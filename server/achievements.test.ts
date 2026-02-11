import { describe, expect, it } from "vitest";
import {
  checkAchievements,
  getAchievementDef,
  ACHIEVEMENT_DEFS,
} from "../shared/achievements";

describe("checkAchievements", () => {
  it("always includes first-game achievement", () => {
    const result = checkAchievements("snake", 0);
    expect(result).toContain("first-game");
  });

  describe("snake achievements", () => {
    it("unlocks snake-50 at score 50", () => {
      const result = checkAchievements("snake", 50);
      expect(result).toContain("snake-50");
      expect(result).not.toContain("snake-100");
    });

    it("unlocks snake-100 at score 100", () => {
      const result = checkAchievements("snake", 100);
      expect(result).toContain("snake-50");
      expect(result).toContain("snake-100");
      expect(result).not.toContain("snake-200");
    });

    it("unlocks all snake achievements at score 200+", () => {
      const result = checkAchievements("snake", 250);
      expect(result).toContain("snake-50");
      expect(result).toContain("snake-100");
      expect(result).toContain("snake-200");
    });

    it("does not unlock snake achievements below threshold", () => {
      const result = checkAchievements("snake", 30);
      expect(result).not.toContain("snake-50");
    });
  });

  describe("flappy-bird achievements", () => {
    it("unlocks flappy-10 at score 10", () => {
      const result = checkAchievements("flappy-bird", 10);
      expect(result).toContain("flappy-10");
    });

    it("unlocks all flappy achievements at score 50+", () => {
      const result = checkAchievements("flappy-bird", 60);
      expect(result).toContain("flappy-10");
      expect(result).toContain("flappy-25");
      expect(result).toContain("flappy-50");
    });
  });

  describe("dino-jump achievements", () => {
    it("unlocks dino-100 at score 100", () => {
      const result = checkAchievements("dino-jump", 100);
      expect(result).toContain("dino-100");
      expect(result).not.toContain("dino-500");
    });

    it("unlocks dino-1000 at score 1000+", () => {
      const result = checkAchievements("dino-jump", 1500);
      expect(result).toContain("dino-100");
      expect(result).toContain("dino-500");
      expect(result).toContain("dino-1000");
    });
  });

  describe("tetris achievements", () => {
    it("unlocks tetris-1000 at score 1000", () => {
      const result = checkAchievements("tetris", 1000);
      expect(result).toContain("tetris-1000");
      expect(result).not.toContain("tetris-5000");
    });

    it("unlocks tetris-10-lines with 10+ lines", () => {
      const result = checkAchievements("tetris", 500, { lines: 12 });
      expect(result).toContain("tetris-10-lines");
    });

    it("does not unlock tetris-10-lines with fewer than 10 lines", () => {
      const result = checkAchievements("tetris", 500, { lines: 5 });
      expect(result).not.toContain("tetris-10-lines");
    });

    it("unlocks tetris-4-lines with a four-line clear", () => {
      const result = checkAchievements("tetris", 800, { fourLineClears: 1 });
      expect(result).toContain("tetris-4-lines");
    });
  });

  describe("pong achievements", () => {
    it("unlocks pong-win when player wins", () => {
      const result = checkAchievements("pong", 7, { playerScore: 7, aiScore: 3 });
      expect(result).toContain("pong-win");
      expect(result).not.toContain("pong-flawless");
    });

    it("unlocks pong-flawless when player wins 7-0", () => {
      const result = checkAchievements("pong", 7, { playerScore: 7, aiScore: 0 });
      expect(result).toContain("pong-win");
      expect(result).toContain("pong-flawless");
    });

    it("does not unlock pong-win when player loses", () => {
      const result = checkAchievements("pong", 3, { playerScore: 3, aiScore: 7 });
      expect(result).not.toContain("pong-win");
    });
  });

  describe("space-invaders achievements", () => {
    it("unlocks invaders-500 at score 500", () => {
      const result = checkAchievements("space-invaders", 500);
      expect(result).toContain("invaders-500");
      expect(result).not.toContain("invaders-2000");
    });

    it("unlocks invaders-wave-5 at wave 5+", () => {
      const result = checkAchievements("space-invaders", 300, { wave: 5 });
      expect(result).toContain("invaders-wave-5");
    });

    it("does not unlock invaders-wave-5 below wave 5", () => {
      const result = checkAchievements("space-invaders", 300, { wave: 3 });
      expect(result).not.toContain("invaders-wave-5");
    });
  });

  it("returns empty (except first-game) for unknown game", () => {
    const result = checkAchievements("unknown-game", 9999);
    expect(result).toEqual(["first-game"]);
  });
});

describe("getAchievementDef", () => {
  it("returns the correct achievement definition", () => {
    const def = getAchievementDef("snake-100");
    expect(def).toBeDefined();
    expect(def?.title).toBe("Snake Charmer");
    expect(def?.game).toBe("snake");
  });

  it("returns undefined for non-existent achievement", () => {
    const def = getAchievementDef("nonexistent");
    expect(def).toBeUndefined();
  });
});

describe("ACHIEVEMENT_DEFS", () => {
  it("has unique IDs", () => {
    const ids = ACHIEVEMENT_DEFS.map(a => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("covers all 6 games plus global", () => {
    const games = new Set(ACHIEVEMENT_DEFS.map(a => a.game));
    expect(games).toContain("snake");
    expect(games).toContain("flappy-bird");
    expect(games).toContain("dino-jump");
    expect(games).toContain("tetris");
    expect(games).toContain("pong");
    expect(games).toContain("space-invaders");
    expect(games).toContain("global");
  });

  it("has at least 20 achievements total", () => {
    expect(ACHIEVEMENT_DEFS.length).toBeGreaterThanOrEqual(20);
  });
});
