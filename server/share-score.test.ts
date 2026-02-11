import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

/**
 * Tests for the ShareScore social sharing feature.
 * Validates the share text builder, component integration across all games,
 * and social URL construction.
 */

// ─── buildShareText logic (replicated from component) ───

function buildShareText(
  gameName: string,
  score: number,
  extraDetail?: string,
  isHighScore?: boolean
): string {
  const parts = [`🎮 I scored ${score.toLocaleString()} on ${gameName}`];
  if (extraDetail) parts[0] += ` (${extraDetail})`;
  parts[0] += "!";
  if (isHighScore) parts.push("🏆 New high score!");
  parts.push("Can you beat it? Play now on Pixel Playground!");
  return parts.join(" ");
}

describe("buildShareText", () => {
  it("generates basic share text with game name and score", () => {
    const text = buildShareText("Snake", 42);
    expect(text).toContain("I scored 42 on Snake");
    expect(text).toContain("Can you beat it?");
    expect(text).not.toContain("New high score");
  });

  it("includes high score badge when isHighScore is true", () => {
    const text = buildShareText("Tetris", 1500, undefined, true);
    expect(text).toContain("🏆 New high score!");
  });

  it("does not include high score badge when isHighScore is false", () => {
    const text = buildShareText("Pong", 3, undefined, false);
    expect(text).not.toContain("New high score");
  });

  it("includes extra detail when provided", () => {
    const text = buildShareText("Tetris", 5000, "Level 8");
    expect(text).toContain("(Level 8)");
  });

  it("includes both extra detail and high score", () => {
    const text = buildShareText("Space Invaders", 9999, "Wave 12", true);
    expect(text).toContain("(Wave 12)");
    expect(text).toContain("🏆 New high score!");
    expect(text).toContain("I scored 9,999 on Space Invaders");
  });

  it("formats large scores with commas", () => {
    const text = buildShareText("2048", 123456);
    expect(text).toContain("123,456");
  });

  it("handles zero score", () => {
    const text = buildShareText("Flappy Bird", 0);
    expect(text).toContain("I scored 0 on Flappy Bird");
  });
});

// ─── Social URL construction ───

describe("Social URL construction", () => {
  const shareText = "🎮 I scored 100 on Snake! Can you beat it?";
  const shareUrl = "https://example.com/snake";

  it("constructs valid Twitter intent URL", () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    expect(url).toContain("twitter.com/intent/tweet");
    expect(url).toContain("text=");
    expect(url).toContain("url=");
    // Verify it's a valid URL
    const parsed = new URL(url);
    expect(parsed.hostname).toBe("twitter.com");
  });

  it("constructs valid Facebook share URL", () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    expect(url).toContain("facebook.com/sharer");
    expect(url).toContain("u=");
    const parsed = new URL(url);
    expect(parsed.hostname).toBe("www.facebook.com");
  });

  it("encodes special characters in share text", () => {
    const specialText = "Score: 100! #gaming @player";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(specialText)}`;
    expect(url).not.toContain("#");
    expect(url).not.toContain("@");
    expect(url).toContain("%23");
    expect(url).toContain("%40");
  });
});

// ─── Integration: verify all 11 game files import ShareScore ───

describe("ShareScore integration across all games", () => {
  const GAME_FILES = [
    "SnakeGame.tsx",
    "FlappyBirdGame.tsx",
    "DinoGame.tsx",
    "TetrisGame.tsx",
    "PongGame.tsx",
    "SpaceInvadersGame.tsx",
    "MinesweeperGame.tsx",
    "BreakoutGame.tsx",
    "Game2048.tsx",
    "MemoryMatchGame.tsx",
    "WhackAMoleGame.tsx",
  ];

  const pagesDir = path.resolve(__dirname, "../client/src/pages");

  for (const file of GAME_FILES) {
    const gameName = file.replace(".tsx", "");

    it(`${gameName} imports ShareScore`, () => {
      const content = fs.readFileSync(path.join(pagesDir, file), "utf-8");
      expect(content).toContain('import ShareScore from "@/components/ShareScore"');
    });

    it(`${gameName} uses <ShareScore component in game-over section`, () => {
      const content = fs.readFileSync(path.join(pagesDir, file), "utf-8");
      expect(content).toContain("<ShareScore");
      expect(content).toContain("gameName=");
    });
  }
});

// ─── Share text for each game ───

describe("Share text for each game type", () => {
  it("Snake: basic score share", () => {
    const text = buildShareText("Snake", 42, undefined, false);
    expect(text).toBe("🎮 I scored 42 on Snake! Can you beat it? Play now on Pixel Playground!");
  });

  it("Pong: includes vs CPU detail", () => {
    const text = buildShareText("Pong", 5, "5-3 vs CPU", true);
    expect(text).toContain("(5-3 vs CPU)");
    expect(text).toContain("🏆 New high score!");
  });

  it("Tetris: includes level detail", () => {
    const text = buildShareText("Tetris", 3000, "Level 5");
    expect(text).toContain("(Level 5)");
  });

  it("Space Invaders: includes wave detail", () => {
    const text = buildShareText("Space Invaders", 7500, "Wave 10");
    expect(text).toContain("(Wave 10)");
  });

  it("Memory Match: includes moves detail", () => {
    const text = buildShareText("Memory Match", 200, "15 moves");
    expect(text).toContain("(15 moves)");
  });
});
