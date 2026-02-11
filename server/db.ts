import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, scores, InsertScore, achievements, InsertAchievement } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Leaderboard Queries ───

export async function submitScore(data: InsertScore) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(scores).values(data);
}

export async function getTopScores(game: string, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  // Get top score per user for this game
  const result = await db
    .select({
      id: scores.id,
      userId: scores.userId,
      game: scores.game,
      score: scores.score,
      wave: scores.wave,
      lines: scores.lines,
      createdAt: scores.createdAt,
      userName: users.name,
    })
    .from(scores)
    .innerJoin(users, eq(scores.userId, users.id))
    .where(eq(scores.game, game))
    .orderBy(desc(scores.score))
    .limit(limit * 3); // fetch extra to deduplicate

  // Deduplicate: keep only the best score per user
  const seen = new Set<number>();
  const deduped = [];
  for (const row of result) {
    if (!seen.has(row.userId)) {
      seen.add(row.userId);
      deduped.push(row);
      if (deduped.length >= limit) break;
    }
  }
  return deduped;
}

export async function getUserBestScore(userId: number, game: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(scores)
    .where(and(eq(scores.userId, userId), eq(scores.game, game)))
    .orderBy(desc(scores.score))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserAllBestScores(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select({
      game: scores.game,
      score: sql<number>`MAX(${scores.score})`,
    })
    .from(scores)
    .where(eq(scores.userId, userId))
    .groupBy(scores.game);
  return result;
}

// ─── Achievement Queries ───

export async function unlockAchievement(data: InsertAchievement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Only insert if not already unlocked
  const existing = await db
    .select()
    .from(achievements)
    .where(and(eq(achievements.userId, data.userId), eq(achievements.achievementId, data.achievementId)))
    .limit(1);
  if (existing.length > 0) return false; // already unlocked
  await db.insert(achievements).values(data);
  return true; // newly unlocked
}

export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(achievements)
    .where(eq(achievements.userId, userId))
    .orderBy(desc(achievements.unlockedAt));
}

// ─── Profile Queries ───

/** Get recent score history for a user (all games, newest first) */
export async function getUserRecentScores(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: scores.id,
      game: scores.game,
      score: scores.score,
      wave: scores.wave,
      lines: scores.lines,
      createdAt: scores.createdAt,
    })
    .from(scores)
    .where(eq(scores.userId, userId))
    .orderBy(desc(scores.createdAt))
    .limit(limit);
}

/** Get total number of games played by a user */
export async function getUserTotalGamesPlayed(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(scores)
    .where(eq(scores.userId, userId));
  return result[0]?.count ?? 0;
}

/** Get the user's best score per game along with total plays per game */
export async function getUserGameStats(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      game: scores.game,
      bestScore: sql<number>`MAX(${scores.score})`,
      totalPlays: sql<number>`COUNT(*)`,
      lastPlayed: sql<Date>`MAX(${scores.createdAt})`,
    })
    .from(scores)
    .where(eq(scores.userId, userId))
    .groupBy(scores.game);
}
