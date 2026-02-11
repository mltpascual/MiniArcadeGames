/**
 * Achievement definitions — shared between client and server.
 * Each achievement has a unique ID, display info, and the condition to unlock it.
 */

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  game: string; // which game it belongs to, or "global"
  category: "score" | "milestone" | "challenge";
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // Snake
  { id: "snake-50", title: "Snack Time", description: "Score 50 in Snake", icon: "🍎", game: "snake", category: "score" },
  { id: "snake-100", title: "Snake Charmer", description: "Score 100 in Snake", icon: "🐍", game: "snake", category: "score" },
  { id: "snake-200", title: "Serpent King", description: "Score 200 in Snake", icon: "👑", game: "snake", category: "score" },

  // Flappy Bird
  { id: "flappy-10", title: "First Flight", description: "Score 10 in Flappy Bird", icon: "🐣", game: "flappy-bird", category: "score" },
  { id: "flappy-25", title: "Sky Surfer", description: "Score 25 in Flappy Bird", icon: "🦅", game: "flappy-bird", category: "score" },
  { id: "flappy-50", title: "Bird Legend", description: "Score 50 in Flappy Bird", icon: "🏆", game: "flappy-bird", category: "score" },

  // Dino Jump
  { id: "dino-100", title: "Desert Runner", description: "Score 100 in Dino Jump", icon: "🦕", game: "dino-jump", category: "score" },
  { id: "dino-500", title: "Dino Dash", description: "Score 500 in Dino Jump", icon: "🌵", game: "dino-jump", category: "score" },
  { id: "dino-1000", title: "Extinction Survivor", description: "Score 1000 in Dino Jump", icon: "☄️", game: "dino-jump", category: "score" },

  // Tetris
  { id: "tetris-1000", title: "Block Builder", description: "Score 1000 in Tetris", icon: "🧱", game: "tetris", category: "score" },
  { id: "tetris-5000", title: "Tetris Master", description: "Score 5000 in Tetris", icon: "🏗️", game: "tetris", category: "score" },
  { id: "tetris-10-lines", title: "Line Clearer", description: "Clear 10 lines in one Tetris game", icon: "📏", game: "tetris", category: "milestone" },
  { id: "tetris-4-lines", title: "TETRIS!", description: "Clear 4 lines at once (Tetris)", icon: "💥", game: "tetris", category: "challenge" },

  // Pong
  { id: "pong-win", title: "First Victory", description: "Win a Pong match", icon: "🏓", game: "pong", category: "milestone" },
  { id: "pong-flawless", title: "Flawless Victory", description: "Win Pong without losing a point", icon: "✨", game: "pong", category: "challenge" },

  // Space Invaders
  { id: "invaders-500", title: "Space Cadet", description: "Score 500 in Space Invaders", icon: "🚀", game: "space-invaders", category: "score" },
  { id: "invaders-2000", title: "Alien Slayer", description: "Score 2000 in Space Invaders", icon: "👾", game: "space-invaders", category: "score" },
  { id: "invaders-wave-5", title: "Wave Rider", description: "Reach wave 5 in Space Invaders", icon: "🌊", game: "space-invaders", category: "milestone" },

  // Global
  { id: "first-game", title: "Welcome!", description: "Play your first game", icon: "🎮", game: "global", category: "milestone" },
  { id: "all-games", title: "Arcade Master", description: "Play all 6 games", icon: "🎪", game: "global", category: "challenge" },
];

export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENT_DEFS.find(a => a.id === id);
}

/**
 * Check which achievements should be unlocked based on a game result.
 * Returns an array of achievement IDs that should be newly unlocked.
 */
export function checkAchievements(
  game: string,
  score: number,
  extras?: { lines?: number; wave?: number; playerScore?: number; aiScore?: number; fourLineClears?: number }
): string[] {
  const unlocked: string[] = [];

  // Always grant first-game
  unlocked.push("first-game");

  switch (game) {
    case "snake":
      if (score >= 50) unlocked.push("snake-50");
      if (score >= 100) unlocked.push("snake-100");
      if (score >= 200) unlocked.push("snake-200");
      break;
    case "flappy-bird":
      if (score >= 10) unlocked.push("flappy-10");
      if (score >= 25) unlocked.push("flappy-25");
      if (score >= 50) unlocked.push("flappy-50");
      break;
    case "dino-jump":
      if (score >= 100) unlocked.push("dino-100");
      if (score >= 500) unlocked.push("dino-500");
      if (score >= 1000) unlocked.push("dino-1000");
      break;
    case "tetris":
      if (score >= 1000) unlocked.push("tetris-1000");
      if (score >= 5000) unlocked.push("tetris-5000");
      if (extras?.lines && extras.lines >= 10) unlocked.push("tetris-10-lines");
      if (extras?.fourLineClears && extras.fourLineClears > 0) unlocked.push("tetris-4-lines");
      break;
    case "pong":
      if (extras?.playerScore !== undefined && extras?.aiScore !== undefined) {
        if (extras.playerScore >= 7) unlocked.push("pong-win");
        if (extras.playerScore >= 7 && extras.aiScore === 0) unlocked.push("pong-flawless");
      }
      break;
    case "space-invaders":
      if (score >= 500) unlocked.push("invaders-500");
      if (score >= 2000) unlocked.push("invaders-2000");
      if (extras?.wave && extras.wave >= 5) unlocked.push("invaders-wave-5");
      break;
  }

  return unlocked;
}
