/**
 * Tutorial data for all 11 games.
 * Each entry contains desktop/mobile controls and gameplay tips.
 */
import type { GameTutorialProps } from "@/components/GameTutorial";

type TutorialData = Omit<GameTutorialProps, "onDismiss">;

export const tutorials: Record<string, TutorialData> = {
  snake: {
    gameId: "snake",
    gameName: "Snake",
    controls: {
      desktop: [
        { key: "↑ ↓ ← →", action: "Change direction" },
        { key: "ESC / P", action: "Pause game" },
      ],
      mobile: [
        { key: "D-Pad", action: "Tap directional buttons to steer" },
        { key: "⏸", action: "Tap pause button" },
      ],
    },
    tips: [
      { text: "Eat apples to grow longer and score points." },
      { text: "Don't run into walls or your own tail!" },
      { text: "Plan your path ahead — longer snakes need more room." },
    ],
  },
  flappy: {
    gameId: "flappy",
    gameName: "Flappy Bird",
    controls: {
      desktop: [
        { key: "SPACE", action: "Flap wings / Start game" },
        { key: "ESC / P", action: "Pause game" },
      ],
      mobile: [
        { key: "TAP", action: "Tap anywhere to flap" },
        { key: "⏸", action: "Tap pause button" },
      ],
    },
    tips: [
      { text: "Tap with a steady rhythm — don't panic-tap!" },
      { text: "Aim for the center of each pipe gap." },
      { text: "Each pipe passed scores 1 point." },
    ],
  },
  dino: {
    gameId: "dino",
    gameName: "Dino Jump",
    controls: {
      desktop: [
        { key: "SPACE / ↑", action: "Jump" },
        { key: "↓", action: "Duck" },
        { key: "ESC / P", action: "Pause game" },
      ],
      mobile: [
        { key: "TAP", action: "Tap to jump" },
        { key: "SWIPE ↓", action: "Swipe down to duck" },
        { key: "⏸", action: "Tap pause button" },
      ],
    },
    tips: [
      { text: "Jump over cacti and duck under pterodactyls." },
      { text: "The game speeds up over time — stay alert!" },
      { text: "Time your jumps carefully for tall cacti." },
    ],
  },
  tetris: {
    gameId: "tetris",
    gameName: "Tetris",
    controls: {
      desktop: [
        { key: "← →", action: "Move piece left/right" },
        { key: "↑", action: "Rotate piece" },
        { key: "↓", action: "Soft drop (faster)" },
        { key: "SPACE", action: "Hard drop (instant)" },
        { key: "ESC / P", action: "Pause game" },
      ],
      mobile: [
        { key: "← →", action: "Tap arrows to move" },
        { key: "↻", action: "Tap rotate button" },
        { key: "↓", action: "Tap down for soft drop" },
        { key: "⏸", action: "Tap pause button" },
      ],
    },
    tips: [
      { text: "Clear multiple lines at once for bonus points." },
      { text: "Keep the board as flat as possible." },
      { text: "Save the I-piece for Tetris clears (4 lines)." },
    ],
  },
  pong: {
    gameId: "pong",
    gameName: "Pong",
    controls: {
      desktop: [
        { key: "↑ ↓", action: "Move paddle up/down" },
        { key: "W S", action: "Alternative paddle controls" },
        { key: "ESC / P", action: "Pause game" },
      ],
      mobile: [
        { key: "DRAG", action: "Drag finger up/down to move paddle" },
        { key: "⏸", action: "Tap pause button" },
      ],
    },
    tips: [
      { text: "Hit the ball with the edge of your paddle for angled shots." },
      { text: "Anticipate where the ball will go, don't just react." },
      { text: "First to the target score wins the match!" },
    ],
  },
  invaders: {
    gameId: "invaders",
    gameName: "Space Invaders",
    controls: {
      desktop: [
        { key: "← →", action: "Move ship left/right" },
        { key: "SPACE", action: "Fire laser" },
        { key: "ESC / P", action: "Pause game" },
      ],
      mobile: [
        { key: "← →", action: "Tap arrows to move" },
        { key: "FIRE", action: "Tap fire button to shoot" },
        { key: "⏸", action: "Tap pause button" },
      ],
    },
    tips: [
      { text: "Destroy entire rows before they descend too far." },
      { text: "Use shields for cover, but they break over time." },
      { text: "Bonus UFOs appear at the top — shoot them for extra points!" },
    ],
  },
  minesweeper: {
    gameId: "minesweeper",
    gameName: "Minesweeper",
    controls: {
      desktop: [
        { key: "CLICK", action: "Reveal a tile" },
        { key: "RIGHT-CLICK", action: "Place/remove flag" },
        { key: "ESC / P", action: "Pause game" },
      ],
      mobile: [
        { key: "TAP", action: "Reveal a tile" },
        { key: "LONG PRESS", action: "Place/remove flag" },
        { key: "⏸", action: "Tap pause button" },
      ],
    },
    tips: [
      { text: "Numbers show how many adjacent mines surround a tile." },
      { text: "Flag all suspected mines before revealing nearby tiles." },
      { text: "Start from corners or edges for safer opening moves." },
    ],
  },
  breakout: {
    gameId: "breakout",
    gameName: "Breakout",
    controls: {
      desktop: [
        { key: "← →", action: "Move paddle left/right" },
        { key: "SPACE", action: "Launch ball" },
        { key: "ESC / P", action: "Pause game" },
      ],
      mobile: [
        { key: "DRAG", action: "Drag finger to move paddle" },
        { key: "TAP", action: "Tap to launch ball" },
        { key: "⏸", action: "Tap pause button" },
      ],
    },
    tips: [
      { text: "Hit the ball with the paddle's edge for sharper angles." },
      { text: "Clear all bricks to advance to the next level." },
      { text: "Don't let the ball fall below the paddle!" },
    ],
  },
  "2048": {
    gameId: "2048",
    gameName: "2048",
    controls: {
      desktop: [
        { key: "↑ ↓ ← →", action: "Slide tiles in any direction" },
        { key: "ESC / P", action: "Pause game" },
      ],
      mobile: [
        { key: "SWIPE", action: "Swipe in any direction to slide tiles" },
        { key: "⏸", action: "Tap pause button" },
      ],
    },
    tips: [
      { text: "Keep your highest tile in a corner." },
      { text: "Build a chain of descending values along one edge." },
      { text: "Avoid moving in all four directions — stick to 2-3 mostly." },
    ],
  },
  "memory-match": {
    gameId: "memory-match",
    gameName: "Memory Match",
    controls: {
      desktop: [
        { key: "CLICK", action: "Flip a card" },
        { key: "ESC / P", action: "Pause game" },
      ],
      mobile: [
        { key: "TAP", action: "Tap a card to flip it" },
        { key: "⏸", action: "Tap pause button" },
      ],
    },
    tips: [
      { text: "Flip two cards per turn — match pairs to clear them." },
      { text: "Memorize card positions as they're revealed." },
      { text: "Fewer moves = higher score. Be strategic!" },
    ],
  },
  "whack-a-mole": {
    gameId: "whack-a-mole",
    gameName: "Whack-a-Mole",
    controls: {
      desktop: [
        { key: "CLICK", action: "Whack a mole" },
        { key: "ESC / P", action: "Pause game" },
      ],
      mobile: [
        { key: "TAP", action: "Tap a mole to whack it" },
        { key: "⏸", action: "Tap pause button" },
      ],
    },
    tips: [
      { text: "Be quick — moles only stay up for a short time!" },
      { text: "Watch for special moles that give bonus points." },
      { text: "Moles appear faster as the game progresses." },
    ],
  },
};
