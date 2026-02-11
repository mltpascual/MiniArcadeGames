/**
 * GameSettingsContext — Global game settings for all games
 * Manages difficulty, game speed, and sound volume
 * Persists to localStorage
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type Difficulty = "easy" | "medium" | "hard";
export type GameSpeed = "slow" | "normal" | "fast";

interface GameSettings {
  difficulty: Difficulty;
  gameSpeed: GameSpeed;
  soundEnabled: boolean;
  soundVolume: number; // 0-100
  musicEnabled: boolean;
  musicVolume: number; // 0-100
}

interface GameSettingsContextType extends GameSettings {
  setDifficulty: (d: Difficulty) => void;
  setGameSpeed: (s: GameSpeed) => void;
  setSoundEnabled: (e: boolean) => void;
  setSoundVolume: (v: number) => void;
  setMusicEnabled: (e: boolean) => void;
  setMusicVolume: (v: number) => void;
  resetToDefaults: () => void;
  /** Returns a speed multiplier based on gameSpeed: slow=0.7, normal=1.0, fast=1.4 */
  speedMultiplier: number;
  /** Returns difficulty params: easy has more forgiving values, hard is punishing */
  difficultyParams: {
    label: string;
    pipeGap: number; // flappy bird pipe gap
    snakeSpeed: number; // ms per tick
    obstacleFrequency: number; // dino obstacle frequency multiplier
    aiReaction: number; // pong AI reaction (lower = harder)
    tetrisStartLevel: number;
    invaderSpeed: number; // space invaders speed multiplier
  };
}

const DEFAULTS: GameSettings = {
  difficulty: "medium",
  gameSpeed: "normal",
  soundEnabled: true,
  soundVolume: 70,
  musicEnabled: true,
  musicVolume: 40,
};

const STORAGE_KEY = "pixel-play-settings";

function loadSettings(): GameSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULTS, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULTS };
}

function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

const GameSettingsContext = createContext<GameSettingsContextType | undefined>(undefined);

export function GameSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const update = useCallback((partial: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const speedMultiplier = settings.gameSpeed === "slow" ? 0.7 : settings.gameSpeed === "fast" ? 1.4 : 1.0;

  const difficultyParams = (() => {
    switch (settings.difficulty) {
      case "easy":
        return {
          label: "Easy",
          pipeGap: 180,
          snakeSpeed: 160,
          obstacleFrequency: 0.6,
          aiReaction: 0.04,
          tetrisStartLevel: 1,
          invaderSpeed: 0.7,
        };
      case "hard":
        return {
          label: "Hard",
          pipeGap: 120,
          snakeSpeed: 80,
          obstacleFrequency: 1.5,
          aiReaction: 0.12,
          tetrisStartLevel: 5,
          invaderSpeed: 1.5,
        };
      default:
        return {
          label: "Medium",
          pipeGap: 150,
          snakeSpeed: 110,
          obstacleFrequency: 1.0,
          aiReaction: 0.08,
          tetrisStartLevel: 1,
          invaderSpeed: 1.0,
        };
    }
  })();

  const value: GameSettingsContextType = {
    ...settings,
    speedMultiplier,
    difficultyParams,
    setDifficulty: (d) => update({ difficulty: d }),
    setGameSpeed: (s) => update({ gameSpeed: s }),
    setSoundEnabled: (e) => update({ soundEnabled: e }),
    setSoundVolume: (v) => update({ soundVolume: v }),
    setMusicEnabled: (e) => update({ musicEnabled: e }),
    setMusicVolume: (v) => update({ musicVolume: v }),
    resetToDefaults: () => setSettings({ ...DEFAULTS }),
  };

  return (
    <GameSettingsContext.Provider value={value}>
      {children}
    </GameSettingsContext.Provider>
  );
}

export function useGameSettings() {
  const context = useContext(GameSettingsContext);
  if (!context) {
    throw new Error("useGameSettings must be used within GameSettingsProvider");
  }
  return context;
}
