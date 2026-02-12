/**
 * Tests for the localStorage-based gameStore.
 * We mock localStorage since vitest runs in Node.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// ─── Mock localStorage ─────────────────────────────────────────────────────
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
};
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

// Import after mocking
import {
  getAllScores,
  submitScore,
  getTopScores,
  getBestScore,
  getAllBestScores,
  getRecentScores,
  getTotalGamesPlayed,
  getGamePlayCounts,
  getGameStats,
  getAllAchievements,
  getUnlockedAchievementIds,
  getUnlockedAchievements,
  getFavorites,
  toggleFavorite,
  isFavorite,
  getGamesPlayed,
  getPlayerName,
  setPlayerName,
  ACHIEVEMENT_DEFS,
} from "./gameStore";

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// ─── Scores ─────────────────────────────────────────────────────────────────
describe("Scores", () => {
  it("starts with empty scores", () => {
    expect(getAllScores()).toEqual([]);
  });

  it("submits a score and retrieves it", () => {
    const result = submitScore("snake", 100);
    expect(result.scoreId).toBeTruthy();
    const scores = getAllScores();
    expect(scores).toHaveLength(1);
    expect(scores[0].game).toBe("snake");
    expect(scores[0].score).toBe(100);
    expect(scores[0].createdAt).toBeGreaterThan(0);
  });

  it("getTopScores returns sorted by score descending", () => {
    submitScore("snake", 50);
    submitScore("snake", 200);
    submitScore("snake", 100);
    submitScore("tetris", 999);
    const top = getTopScores("snake", 10);
    expect(top).toHaveLength(3);
    expect(top[0].score).toBe(200);
    expect(top[1].score).toBe(100);
    expect(top[2].score).toBe(50);
  });

  it("getTopScores respects limit", () => {
    submitScore("snake", 50);
    submitScore("snake", 200);
    submitScore("snake", 100);
    const top = getTopScores("snake", 2);
    expect(top).toHaveLength(2);
  });

  it("getBestScore returns the highest score for a game", () => {
    submitScore("snake", 50);
    submitScore("snake", 200);
    const best = getBestScore("snake");
    expect(best?.score).toBe(200);
  });

  it("getBestScore returns null for unplayed game", () => {
    expect(getBestScore("nonexistent")).toBeNull();
  });

  it("getAllBestScores returns best per game", () => {
    submitScore("snake", 100);
    submitScore("snake", 200);
    submitScore("tetris", 500);
    submitScore("tetris", 300);
    const best = getAllBestScores();
    expect(best["snake"].score).toBe(200);
    expect(best["tetris"].score).toBe(500);
  });

  it("getRecentScores returns scores sorted by createdAt descending", () => {
    submitScore("snake", 100);
    submitScore("tetris", 200);
    const recent = getRecentScores(10);
    expect(recent).toHaveLength(2);
    // Both have valid timestamps
    expect(recent[0].createdAt).toBeGreaterThanOrEqual(recent[1].createdAt);
  });

  it("getTotalGamesPlayed counts all score entries", () => {
    submitScore("snake", 100);
    submitScore("snake", 200);
    submitScore("tetris", 300);
    expect(getTotalGamesPlayed()).toBe(3);
  });

  it("getGamePlayCounts returns per-game counts", () => {
    submitScore("snake", 100);
    submitScore("snake", 200);
    submitScore("tetris", 300);
    const counts = getGamePlayCounts();
    expect(counts["snake"]).toBe(2);
    expect(counts["tetris"]).toBe(1);
  });

  it("getGameStats returns game stats with plays and best score", () => {
    submitScore("snake", 100);
    submitScore("snake", 200);
    submitScore("tetris", 300);
    const stats = getGameStats();
    const snakeStats = stats.find((s) => s.game === "snake");
    expect(snakeStats?.plays).toBe(2);
    expect(snakeStats?.bestScore).toBe(200);
  });
});

// ─── Achievements ───────────────────────────────────────────────────────────
describe("Achievements", () => {
  it("starts with no achievements", () => {
    expect(getAllAchievements()).toEqual([]);
    expect(getUnlockedAchievementIds()).toEqual([]);
    expect(getUnlockedAchievements()).toEqual([]);
  });

  it("unlocks achievements when score thresholds are met", () => {
    // Snake score of 100 should trigger snake-100 and snake-50
    const result = submitScore("snake", 100);
    expect(result.newAchievements).toContain("snake-100");
    expect(result.newAchievements).toContain("snake-50");
    expect(result.newAchievements).toContain("first-game");
    expect(getUnlockedAchievementIds()).toContain("snake-100");
  });

  it("does not duplicate achievements on subsequent submissions", () => {
    submitScore("snake", 100);
    const result2 = submitScore("snake", 150);
    expect(result2.newAchievements).not.toContain("snake-100");
    expect(result2.newAchievements).not.toContain("first-game");
    expect(getUnlockedAchievementIds().filter((id) => id === "snake-100")).toHaveLength(1);
  });

  it("ACHIEVEMENT_DEFS is exported and non-empty", () => {
    expect(ACHIEVEMENT_DEFS).toBeDefined();
    expect(ACHIEVEMENT_DEFS.length).toBeGreaterThan(0);
  });
});

// ─── Favorites ──────────────────────────────────────────────────────────────
describe("Favorites", () => {
  it("starts with no favorites", () => {
    expect(getFavorites()).toEqual([]);
  });

  it("toggleFavorite adds a game", () => {
    const added = toggleFavorite("snake");
    expect(added).toBe(true);
    expect(isFavorite("snake")).toBe(true);
    expect(getFavorites()).toContain("snake");
  });

  it("toggleFavorite removes a game on second call", () => {
    toggleFavorite("snake");
    const removed = toggleFavorite("snake");
    expect(removed).toBe(false);
    expect(isFavorite("snake")).toBe(false);
    expect(getFavorites()).not.toContain("snake");
  });

  it("handles multiple favorites", () => {
    toggleFavorite("snake");
    toggleFavorite("tetris");
    toggleFavorite("pong");
    expect(getFavorites()).toHaveLength(3);
    toggleFavorite("tetris");
    expect(getFavorites()).toHaveLength(2);
    expect(isFavorite("tetris")).toBe(false);
  });
});

// ─── Games Played ───────────────────────────────────────────────────────────
describe("Games Played Tracking", () => {
  it("starts with no games played", () => {
    expect(getGamesPlayed()).toEqual([]);
  });

  it("tracks unique games played via submitScore", () => {
    submitScore("snake", 100);
    submitScore("snake", 200);
    submitScore("tetris", 300);
    const played = getGamesPlayed();
    expect(played).toContain("snake");
    expect(played).toContain("tetris");
    expect(played).toHaveLength(2);
  });
});

// ─── Player Name ────────────────────────────────────────────────────────────
describe("Player Name", () => {
  it("defaults to 'Player'", () => {
    expect(getPlayerName()).toBe("Player");
  });

  it("sets and gets player name", () => {
    setPlayerName("ArcadeKing");
    expect(getPlayerName()).toBe("ArcadeKing");
  });
});

// ─── Edge Cases ─────────────────────────────────────────────────────────────
describe("Edge Cases", () => {
  it("handles corrupted localStorage gracefully", () => {
    store["pp_scores"] = "not valid json{{{";
    expect(getAllScores()).toEqual([]);
  });

  it("submitScore with extras stores wave and lines", () => {
    submitScore("tetris", 500, { lines: 40, wave: undefined });
    const scores = getAllScores();
    expect(scores[0].lines).toBe(40);
    expect(scores[0].wave).toBeUndefined();
  });
});
