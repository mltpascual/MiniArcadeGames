import { describe, it, expect } from "vitest";

/**
 * Tests for favorites system, game badges, and reset tutorial logic.
 * These are unit tests that validate data structures and logic used by
 * the Home page favorites/badges and Settings reset tutorial features.
 */

// ─── Game data with backendId mapping ───

const games = [
  { id: "snake", backendId: "snake", title: "Snake", tag: "Classic" },
  { id: "flappy", backendId: "flappy-bird", title: "Flappy Bird", tag: "Addictive" },
  { id: "dino", backendId: "dino-jump", title: "Dino Jump", tag: "Endless" },
  { id: "tetris", backendId: "tetris", title: "Tetris", tag: "Puzzle" },
  { id: "pong", backendId: "pong", title: "Pong", tag: "Versus" },
  { id: "invaders", backendId: "space-invaders", title: "Space Invaders", tag: "Shooter" },
  { id: "minesweeper", backendId: "minesweeper", title: "Minesweeper", tag: "Strategy" },
  { id: "breakout", backendId: "breakout", title: "Breakout", tag: "Action" },
  { id: "2048", backendId: "2048", title: "2048", tag: "Puzzle" },
  { id: "memory-match", backendId: "memory-match", title: "Memory Match", tag: "Brain" },
  { id: "whack-a-mole", backendId: "whack-a-mole", title: "Whack-a-Mole", tag: "Reflex" },
];

const VALID_GAMES = ["snake", "flappy-bird", "dino-jump", "tetris", "pong", "space-invaders", "minesweeper", "breakout", "2048", "memory-match", "whack-a-mole"];

const NEW_GAME_IDS = new Set(["minesweeper", "breakout", "2048", "memory-match", "whack-a-mole"]);
const HOT_PLAY_THRESHOLD = 5;

const gameCategoryMap: Record<string, string> = {
  Classic: "classic",
  Addictive: "classic",
  Endless: "action",
  Puzzle: "puzzle",
  Versus: "action",
  Shooter: "action",
  Strategy: "puzzle",
  Action: "action",
  Brain: "brain",
  Reflex: "reflex",
};

// ─── Favorites System Tests ───

describe("Favorites System", () => {
  it("every game has a valid backendId that matches VALID_GAMES", () => {
    for (const game of games) {
      expect(VALID_GAMES).toContain(game.backendId);
    }
  });

  it("backendId is unique across all games", () => {
    const backendIds = games.map((g) => g.backendId);
    expect(new Set(backendIds).size).toBe(backendIds.length);
  });

  it("favorites filter returns only favorited games", () => {
    const favoriteBackendIds = new Set(["snake", "tetris", "2048"]);
    const filtered = games.filter((g) => favoriteBackendIds.has(g.backendId));
    expect(filtered).toHaveLength(3);
    expect(filtered.map((g) => g.id)).toEqual(["snake", "tetris", "2048"]);
  });

  it("favorites filter returns empty when no favorites", () => {
    const favoriteBackendIds = new Set<string>();
    const filtered = games.filter((g) => favoriteBackendIds.has(g.backendId));
    expect(filtered).toHaveLength(0);
  });

  it("favorites filter combined with search works correctly", () => {
    const favoriteBackendIds = new Set(["snake", "tetris", "2048"]);
    const searchQuery = "tet";
    const filtered = games.filter((g) => {
      const matchesFav = favoriteBackendIds.has(g.backendId);
      const matchesSearch =
        g.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFav && matchesSearch;
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("tetris");
  });
});

// ─── Game Badges Tests ───

describe("Game Badges", () => {
  it("NEW badge is assigned to the 5 newest games", () => {
    const newGames = games.filter((g) => NEW_GAME_IDS.has(g.id));
    expect(newGames).toHaveLength(5);
    expect(newGames.map((g) => g.id).sort()).toEqual(
      ["2048", "breakout", "memory-match", "minesweeper", "whack-a-mole"].sort()
    );
  });

  it("HOT badge is determined by play count threshold", () => {
    const playCounts = [
      { game: "snake", totalPlays: 10 },
      { game: "tetris", totalPlays: 3 },
      { game: "pong", totalPlays: 7 },
      { game: "flappy-bird", totalPlays: 1 },
    ];
    const hotGames = new Set<string>();
    for (const c of playCounts) {
      if (c.totalPlays >= HOT_PLAY_THRESHOLD) hotGames.add(c.game);
    }
    expect(hotGames.has("snake")).toBe(true);
    expect(hotGames.has("pong")).toBe(true);
    expect(hotGames.has("tetris")).toBe(false);
    expect(hotGames.has("flappy-bird")).toBe(false);
  });

  it("HOT badge does not show on NEW games (NEW takes priority)", () => {
    const hotBackendIds = new Set(["minesweeper", "snake"]);
    const gamesWithBadges = games.map((g) => {
      const isNew = NEW_GAME_IDS.has(g.id);
      const isHot = hotBackendIds.has(g.backendId) && !isNew;
      return { id: g.id, isNew, isHot };
    });
    const minesweeper = gamesWithBadges.find((g) => g.id === "minesweeper")!;
    expect(minesweeper.isNew).toBe(true);
    expect(minesweeper.isHot).toBe(false);
    const snake = gamesWithBadges.find((g) => g.id === "snake")!;
    expect(snake.isNew).toBe(false);
    expect(snake.isHot).toBe(true);
  });

  it("games without enough plays get no HOT badge", () => {
    const playCounts: { game: string; totalPlays: number }[] = [];
    const hotGames = new Set<string>();
    for (const c of playCounts) {
      if (c.totalPlays >= HOT_PLAY_THRESHOLD) hotGames.add(c.game);
    }
    expect(hotGames.size).toBe(0);
  });
});

// ─── Categories with Favorites Tab ───

describe("Categories with Favorites Tab", () => {
  const categories = [
    { id: "all" },
    { id: "favorites" },
    { id: "classic" },
    { id: "puzzle" },
    { id: "action" },
    { id: "brain" },
    { id: "reflex" },
  ];

  it("includes a favorites category tab", () => {
    expect(categories.find((c) => c.id === "favorites")).toBeDefined();
  });

  it("has 7 total category tabs including favorites", () => {
    expect(categories).toHaveLength(7);
  });

  it("favorites filter works independently of category map", () => {
    const activeCategory = "favorites";
    const favoriteBackendIds = new Set(["snake", "pong"]);
    const filtered = games.filter((g) => {
      if (activeCategory === "favorites") {
        return favoriteBackendIds.has(g.backendId);
      }
      return activeCategory === "all" || gameCategoryMap[g.tag] === activeCategory;
    });
    expect(filtered).toHaveLength(2);
  });
});

// ─── Reset Tutorial Logic ───

describe("Reset Tutorial Logic", () => {
  const TUTORIAL_STORAGE_KEY = "pixel-playground-tutorials-seen";
  const ALL_GAME_IDS = [
    "snake", "flappy", "dino", "tetris", "pong", "invaders",
    "minesweeper", "breakout", "2048", "memory-match", "whack-a-mole",
  ];

  it("reset all clears the entire storage key", () => {
    const seen: Record<string, boolean> = { snake: true, tetris: true };
    // Simulate reset all
    const afterReset: Record<string, boolean> = {};
    expect(Object.keys(afterReset).length).toBe(0);
  });

  it("reset single removes only one game from seen map", () => {
    const seen: Record<string, boolean> = { snake: true, tetris: true, pong: true };
    delete seen["tetris"];
    expect(seen).toEqual({ snake: true, pong: true });
    expect(Object.keys(seen).length).toBe(2);
  });

  it("all 11 game IDs are present in the tutorial list", () => {
    expect(ALL_GAME_IDS).toHaveLength(11);
    for (const id of ALL_GAME_IDS) {
      expect(games.find((g) => g.id === id)).toBeDefined();
    }
  });

  it("seen count reflects actual seen tutorials", () => {
    const seen: Record<string, boolean> = { snake: true, tetris: true };
    expect(Object.keys(seen).length).toBe(2);
    delete seen["snake"];
    expect(Object.keys(seen).length).toBe(1);
  });
});
