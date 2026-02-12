/**
 * Client-side localStorage game store.
 * Replaces all server-side tRPC/database calls with local persistence.
 */

import { checkAchievements, getAchievementDef, ACHIEVEMENT_DEFS } from "@shared/achievements";

// ─── Storage Keys ────────────────────────────────────────────────────────────
const KEYS = {
  SCORES: "pp_scores",
  ACHIEVEMENTS: "pp_achievements",
  FAVORITES: "pp_favorites",
  GAMES_PLAYED: "pp_games_played",
  PLAYER_NAME: "pp_player_name",
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ScoreEntry {
  id: string;
  game: string;
  score: number;
  wave?: number;
  lines?: number;
  createdAt: number; // unix ms
}

export interface AchievementEntry {
  id: string;
  unlockedAt: number; // unix ms
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setJSON(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

let idCounter = Date.now();
function nextId(): string {
  return (idCounter++).toString(36);
}

// ─── Scores ──────────────────────────────────────────────────────────────────
export function getAllScores(): ScoreEntry[] {
  return getJSON<ScoreEntry[]>(KEYS.SCORES, []);
}

export function submitScore(
  game: string,
  score: number,
  extras?: { wave?: number; lines?: number; playerScore?: number; aiScore?: number; fourLineClears?: number; difficulty?: string; maxTile?: number }
): { scoreId: string; newAchievements: string[] } {
  const scores = getAllScores();
  const entry: ScoreEntry = {
    id: nextId(),
    game,
    score,
    wave: extras?.wave,
    lines: extras?.lines,
    createdAt: Date.now(),
  };
  scores.push(entry);
  setJSON(KEYS.SCORES, scores);

  // Track games played for "all-games" achievement
  const gamesPlayed = getGamesPlayed();
  if (!gamesPlayed.includes(game)) {
    gamesPlayed.push(game);
    setJSON(KEYS.GAMES_PLAYED, gamesPlayed);
  }

  // Check achievements
  const candidates = checkAchievements(game, score, extras);
  // Also check "all-games" if they've played all 11
  if (gamesPlayed.length >= 11) {
    candidates.push("all-games");
  }

  const existing = getUnlockedAchievementIds();
  const newAchievements = candidates.filter((id) => !existing.includes(id));

  if (newAchievements.length > 0) {
    const achievements = getAllAchievements();
    const now = Date.now();
    for (const id of newAchievements) {
      achievements.push({ id, unlockedAt: now });
    }
    setJSON(KEYS.ACHIEVEMENTS, achievements);
  }

  return { scoreId: entry.id, newAchievements };
}

export function getTopScores(game: string, limit = 10): ScoreEntry[] {
  return getAllScores()
    .filter((s) => s.game === game)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getBestScore(game: string): ScoreEntry | null {
  const top = getTopScores(game, 1);
  return top[0] ?? null;
}

export function getAllBestScores(): Record<string, ScoreEntry> {
  const scores = getAllScores();
  const best: Record<string, ScoreEntry> = {};
  for (const s of scores) {
    if (!best[s.game] || s.score > best[s.game].score) {
      best[s.game] = s;
    }
  }
  return best;
}

export function getRecentScores(limit = 20): ScoreEntry[] {
  return getAllScores()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

export function getTotalGamesPlayed(): number {
  return getAllScores().length;
}

export function getGamePlayCounts(): Record<string, number> {
  const scores = getAllScores();
  const counts: Record<string, number> = {};
  for (const s of scores) {
    counts[s.game] = (counts[s.game] || 0) + 1;
  }
  return counts;
}

export function getGameStats(): { game: string; plays: number; bestScore: number }[] {
  const scores = getAllScores();
  const map: Record<string, { plays: number; bestScore: number }> = {};
  for (const s of scores) {
    if (!map[s.game]) map[s.game] = { plays: 0, bestScore: 0 };
    map[s.game].plays++;
    if (s.score > map[s.game].bestScore) map[s.game].bestScore = s.score;
  }
  return Object.entries(map).map(([game, stats]) => ({ game, ...stats }));
}

// ─── Achievements ────────────────────────────────────────────────────────────
export function getAllAchievements(): AchievementEntry[] {
  return getJSON<AchievementEntry[]>(KEYS.ACHIEVEMENTS, []);
}

export function getUnlockedAchievementIds(): string[] {
  return getAllAchievements().map((a) => a.id);
}

export function getUnlockedAchievements(): { achievementId: string; unlockedAt: number }[] {
  return getAllAchievements().map((a) => ({ achievementId: a.id, unlockedAt: a.unlockedAt }));
}

// ─── Favorites ───────────────────────────────────────────────────────────────
export function getFavorites(): string[] {
  return getJSON<string[]>(KEYS.FAVORITES, []);
}

export function toggleFavorite(gameId: string): boolean {
  const favs = getFavorites();
  const idx = favs.indexOf(gameId);
  if (idx >= 0) {
    favs.splice(idx, 1);
    setJSON(KEYS.FAVORITES, favs);
    return false; // removed
  } else {
    favs.push(gameId);
    setJSON(KEYS.FAVORITES, favs);
    return true; // added
  }
}

export function isFavorite(gameId: string): boolean {
  return getFavorites().includes(gameId);
}

// ─── Games Played Tracking ──────────────────────────────────────────────────
export function getGamesPlayed(): string[] {
  return getJSON<string[]>(KEYS.GAMES_PLAYED, []);
}

// ─── Player Name ─────────────────────────────────────────────────────────────
export function getPlayerName(): string {
  return localStorage.getItem(KEYS.PLAYER_NAME) || "Player";
}

export function setPlayerName(name: string): void {
  localStorage.setItem(KEYS.PLAYER_NAME, name);
}

// ─── Re-exports ──────────────────────────────────────────────────────────────
export { ACHIEVEMENT_DEFS, getAchievementDef, checkAchievements };
