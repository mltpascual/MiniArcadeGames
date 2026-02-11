import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Mock the db module before importing routers
vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  submitScore: vi.fn(),
  getTopScores: vi.fn().mockResolvedValue([]),
  getUserBestScore: vi.fn().mockResolvedValue(null),
  getUserAllBestScores: vi.fn().mockResolvedValue([]),
  unlockAchievement: vi.fn().mockResolvedValue(false),
  getUserAchievements: vi.fn().mockResolvedValue([]),
  getUserRecentScores: vi.fn().mockResolvedValue([]),
  getUserTotalGamesPlayed: vi.fn().mockResolvedValue(0),
  getUserGameStats: vi.fn().mockResolvedValue([]),
}));

import { appRouter } from "./routers";
import * as db from "./db";

function createAuthContext(overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 42,
    openId: "test-user-42",
    email: "player@arcade.test",
    name: "TestPlayer",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-06-01"),
    lastSignedIn: new Date("2025-06-15"),
    ...overrides,
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("profile.getMyProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns profile data with all sections populated", async () => {
    const mockGameStats = [
      { game: "snake", bestScore: 150, totalPlays: 5, lastPlayed: new Date("2025-06-10") },
      { game: "tetris", bestScore: 3000, totalPlays: 12, lastPlayed: new Date("2025-06-14") },
    ];
    const mockRecentScores = [
      { id: 1, game: "snake", score: 120, wave: null, lines: null, createdAt: new Date("2025-06-14") },
      { id: 2, game: "tetris", score: 3000, wave: null, lines: 15, createdAt: new Date("2025-06-14") },
      { id: 3, game: "snake", score: 150, wave: null, lines: null, createdAt: new Date("2025-06-10") },
    ];
    const mockAchievements = [
      { id: 1, userId: 42, achievementId: "snake-100", unlockedAt: new Date("2025-06-10") },
      { id: 2, userId: 42, achievementId: "first-game", unlockedAt: new Date("2025-06-01") },
    ];
    const mockBestScores = [
      { game: "snake", score: 150 },
      { game: "tetris", score: 3000 },
    ];

    vi.mocked(db.getUserGameStats).mockResolvedValue(mockGameStats);
    vi.mocked(db.getUserRecentScores).mockResolvedValue(mockRecentScores);
    vi.mocked(db.getUserTotalGamesPlayed).mockResolvedValue(17);
    vi.mocked(db.getUserAchievements).mockResolvedValue(mockAchievements);
    vi.mocked(db.getUserAllBestScores).mockResolvedValue(mockBestScores);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profile.getMyProfile();

    // Verify user info
    expect(result.user.id).toBe(42);
    expect(result.user.name).toBe("TestPlayer");
    expect(result.user.email).toBe("player@arcade.test");

    // Verify stats
    expect(result.stats.totalGamesPlayed).toBe(17);
    expect(result.stats.gamesWithScores).toBe(2);
    expect(result.stats.totalBestScore).toBe(3150); // 150 + 3000
    expect(result.stats.achievementsUnlocked).toBe(2);

    // Verify game stats
    expect(result.gameStats).toHaveLength(2);
    expect(result.gameStats[0].game).toBe("snake");
    expect(result.gameStats[1].game).toBe("tetris");

    // Verify recent scores
    expect(result.recentScores).toHaveLength(3);
    expect(result.recentScores[0].score).toBe(120);

    // Verify achievements
    expect(result.achievements).toHaveLength(2);
    expect(result.achievements[0].achievementId).toBe("snake-100");
  });

  it("returns empty data for a new user with no games played", async () => {
    vi.mocked(db.getUserGameStats).mockResolvedValue([]);
    vi.mocked(db.getUserRecentScores).mockResolvedValue([]);
    vi.mocked(db.getUserTotalGamesPlayed).mockResolvedValue(0);
    vi.mocked(db.getUserAchievements).mockResolvedValue([]);
    vi.mocked(db.getUserAllBestScores).mockResolvedValue([]);

    const ctx = createAuthContext({ name: "NewPlayer" });
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profile.getMyProfile();

    expect(result.user.name).toBe("NewPlayer");
    expect(result.stats.totalGamesPlayed).toBe(0);
    expect(result.stats.gamesWithScores).toBe(0);
    expect(result.stats.totalBestScore).toBe(0);
    expect(result.stats.achievementsUnlocked).toBe(0);
    expect(result.gameStats).toHaveLength(0);
    expect(result.recentScores).toHaveLength(0);
    expect(result.achievements).toHaveLength(0);
  });

  it("calls all db functions with the correct userId", async () => {
    const ctx = createAuthContext({ id: 99 });
    const caller = appRouter.createCaller(ctx);
    await caller.profile.getMyProfile();

    expect(db.getUserGameStats).toHaveBeenCalledWith(99);
    expect(db.getUserRecentScores).toHaveBeenCalledWith(99, 30);
    expect(db.getUserTotalGamesPlayed).toHaveBeenCalledWith(99);
    expect(db.getUserAchievements).toHaveBeenCalledWith(99);
    expect(db.getUserAllBestScores).toHaveBeenCalledWith(99);
  });

  it("correctly sums best scores from multiple games", async () => {
    vi.mocked(db.getUserAllBestScores).mockResolvedValue([
      { game: "snake", score: 200 },
      { game: "flappy-bird", score: 30 },
      { game: "dino-jump", score: 800 },
      { game: "tetris", score: 5000 },
      { game: "pong", score: 7 },
      { game: "space-invaders", score: 1500 },
    ]);
    vi.mocked(db.getUserGameStats).mockResolvedValue([]);
    vi.mocked(db.getUserRecentScores).mockResolvedValue([]);
    vi.mocked(db.getUserTotalGamesPlayed).mockResolvedValue(50);
    vi.mocked(db.getUserAchievements).mockResolvedValue([]);

    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.profile.getMyProfile();

    expect(result.stats.totalBestScore).toBe(7537); // 200+30+800+5000+7+1500
    expect(result.stats.gamesWithScores).toBe(6);
  });
});
