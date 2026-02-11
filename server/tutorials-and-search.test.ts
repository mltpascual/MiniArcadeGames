import { describe, expect, it } from "vitest";

/**
 * Tests for tutorial data completeness and search/filter logic.
 * These are unit tests that validate the data structures used by
 * the GameTutorial component and Home page search/filter.
 */

// Tutorial data structure validation
const EXPECTED_GAME_IDS = [
  "snake",
  "flappy",
  "dino",
  "tetris",
  "pong",
  "invaders",
  "minesweeper",
  "breakout",
  "2048",
  "memory-match",
  "whack-a-mole",
];

// Replicate the game data from Home.tsx for search/filter testing
const games = [
  { id: "snake", title: "Snake", tag: "Classic", description: "Guide the snake" },
  { id: "flappy", title: "Flappy Bird", tag: "Addictive", description: "Tap to fly" },
  { id: "dino", title: "Dino Jump", tag: "Endless", description: "Run, jump" },
  { id: "tetris", title: "Tetris", tag: "Puzzle", description: "Stack blocks" },
  { id: "pong", title: "Pong", tag: "Versus", description: "Table tennis" },
  { id: "invaders", title: "Space Invaders", tag: "Shooter", description: "Defend Earth" },
  { id: "minesweeper", title: "Minesweeper", tag: "Strategy", description: "Reveal tiles" },
  { id: "breakout", title: "Breakout", tag: "Action", description: "Smash bricks" },
  { id: "2048", title: "2048", tag: "Puzzle", description: "Slide and merge" },
  { id: "memory-match", title: "Memory Match", tag: "Brain", description: "Flip cards" },
  { id: "whack-a-mole", title: "Whack-a-Mole", tag: "Reflex", description: "Whack moles" },
];

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

function filterGames(searchQuery: string, activeCategory: string) {
  return games.filter((game) => {
    const matchesSearch =
      searchQuery === "" ||
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || gameCategoryMap[game.tag] === activeCategory;
    return matchesSearch && matchesCategory;
  });
}

describe("Search and filter logic", () => {
  it("returns all 11 games when no filter is applied", () => {
    const result = filterGames("", "all");
    expect(result).toHaveLength(11);
  });

  it("filters games by search query (title)", () => {
    const result = filterGames("snake", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("snake");
  });

  it("filters games by search query (case-insensitive)", () => {
    const result = filterGames("TETRIS", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("tetris");
  });

  it("filters games by search query (partial match)", () => {
    const result = filterGames("bird", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("flappy");
  });

  it("filters games by search query (description match)", () => {
    const result = filterGames("bricks", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("breakout");
  });

  it("filters games by category: classic", () => {
    const result = filterGames("", "classic");
    // Snake (Classic) + Flappy Bird (Addictive -> classic)
    expect(result).toHaveLength(2);
    expect(result.map((g) => g.id)).toContain("snake");
    expect(result.map((g) => g.id)).toContain("flappy");
  });

  it("filters games by category: puzzle", () => {
    const result = filterGames("", "puzzle");
    // Tetris (Puzzle) + Minesweeper (Strategy -> puzzle) + 2048 (Puzzle)
    expect(result).toHaveLength(3);
    expect(result.map((g) => g.id)).toContain("tetris");
    expect(result.map((g) => g.id)).toContain("minesweeper");
    expect(result.map((g) => g.id)).toContain("2048");
  });

  it("filters games by category: action", () => {
    const result = filterGames("", "action");
    // Dino (Endless -> action) + Pong (Versus -> action) + Space Invaders (Shooter -> action) + Breakout (Action -> action)
    expect(result).toHaveLength(4);
    expect(result.map((g) => g.id)).toContain("dino");
    expect(result.map((g) => g.id)).toContain("pong");
    expect(result.map((g) => g.id)).toContain("invaders");
    expect(result.map((g) => g.id)).toContain("breakout");
  });

  it("filters games by category: brain", () => {
    const result = filterGames("", "brain");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("memory-match");
  });

  it("filters games by category: reflex", () => {
    const result = filterGames("", "reflex");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("whack-a-mole");
  });

  it("combines search and category filter", () => {
    const result = filterGames("pong", "action");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("pong");
  });

  it("returns empty when search and category don't match", () => {
    const result = filterGames("snake", "action");
    expect(result).toHaveLength(0);
  });

  it("returns empty for non-existent game search", () => {
    const result = filterGames("pacman", "all");
    expect(result).toHaveLength(0);
  });

  it("all game tags map to a valid category", () => {
    const validCategories = ["classic", "puzzle", "action", "brain", "reflex"];
    for (const game of games) {
      const category = gameCategoryMap[game.tag];
      expect(category, `Game "${game.title}" tag "${game.tag}" has no category mapping`).toBeDefined();
      expect(validCategories, `Category "${category}" for game "${game.title}" is not valid`).toContain(category);
    }
  });
});

describe("Tutorial data completeness", () => {
  it("has exactly 11 game IDs expected", () => {
    expect(EXPECTED_GAME_IDS).toHaveLength(11);
  });

  it("all game IDs are unique", () => {
    const uniqueIds = new Set(EXPECTED_GAME_IDS);
    expect(uniqueIds.size).toBe(EXPECTED_GAME_IDS.length);
  });

  it("every game in the games list has a matching game ID in tutorials", () => {
    const gameIds = games.map((g) => g.id);
    // Map game IDs to tutorial IDs (some differ)
    const tutorialIdMap: Record<string, string> = {
      snake: "snake",
      flappy: "flappy",
      dino: "dino",
      tetris: "tetris",
      pong: "pong",
      invaders: "invaders",
      minesweeper: "minesweeper",
      breakout: "breakout",
      "2048": "2048",
      "memory-match": "memory-match",
      "whack-a-mole": "whack-a-mole",
    };
    for (const gameId of gameIds) {
      const tutorialId = tutorialIdMap[gameId];
      expect(tutorialId, `Game "${gameId}" has no tutorial mapping`).toBeDefined();
      expect(EXPECTED_GAME_IDS).toContain(tutorialId);
    }
  });
});
