import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Pause } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { useSoundEngine } from "@/hooks/useSoundEngine";
import { useScoreSubmit } from "@/hooks/useScoreSubmit";
import GameTutorial from "@/components/GameTutorial";
import { tutorials } from "@/data/tutorialData";
import ShareScore from "@/components/ShareScore";

const ACCENT_COLOR = "#4ECDC4";
const GAME_ID = "whack-a-mole";

// Game settings
const GRID_SIZE = 3;
const MOLE_LIFESPAN = 1000; // ms
const GOLDEN_MOLE_LIFESPAN = 750; // ms
const GAME_DURATIONS = {
  easy: 60,
  medium: 30,
  hard: 20,
};

type GameState = "idle" | "playing" | "paused" | "over";
type Difficulty = "easy" | "medium" | "hard";

interface Mole {
  x: number;
  y: number;
  radius: number;
  isGolden: boolean;
  createdAt: number;
  isWhacked: boolean;
}

export default function WhackAMoleGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { playSound, startMusic, stopMusic } = useSoundEngine();
  const { submitScore } = useScoreSubmit();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATIONS.medium);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [combo, setCombo] = useState(0);

  const moles = useRef<Mole[]>([]);
  const gameLoopRef = useRef<number>(0);
  const lastUpdateTime = useRef<number>(0);
  const lastMoleTime = useRef<number>(0);
  const moleInterval = useRef(1000);

  const getHighScore = useCallback(() => {
    return parseInt(localStorage.getItem(`pixel-play-${GAME_ID}-highscore`) || "0");
  }, []);

  useEffect(() => {
    setHighScore(getHighScore());
  }, [getHighScore]);

  const saveHighScore = useCallback((newScore: number) => {
    const currentHighScore = getHighScore();
    if (newScore > currentHighScore) {
      setHighScore(newScore);
      localStorage.setItem(`pixel-play-${GAME_ID}-highscore`, String(newScore));
    }
  }, [getHighScore]);

  const resetGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATIONS[difficulty]);
    setCombo(0);
    moles.current = [];
    moleInterval.current = 1000;
    lastMoleTime.current = 0;
  }, [difficulty]);

  const startGame = useCallback(() => {
    resetGame();
    setGameState("playing");
    lastUpdateTime.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [resetGame]);

  const togglePause = () => {
    setGameState((prev) => (prev === "playing" ? "paused" : "playing"));
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, width, height);

    const holeRadius = width / (GRID_SIZE * 2.5);
    const spacing = width / GRID_SIZE;

    // Draw holes
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const x = spacing / 2 + i * spacing;
        const y = spacing / 2 + j * spacing;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(x, y, holeRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw moles
    moles.current.forEach(mole => {
      if (mole.isWhacked) return;
      const moleRadius = holeRadius * 0.8;
      ctx.fillStyle = mole.isGolden ? "#FFD700" : "#8B4513";
      ctx.beginPath();
      ctx.arc(mole.x, mole.y, moleRadius, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(mole.x - moleRadius * 0.3, mole.y - moleRadius * 0.2, moleRadius * 0.1, 0, Math.PI * 2);
      ctx.arc(mole.x + moleRadius * 0.3, mole.y - moleRadius * 0.2, moleRadius * 0.1, 0, Math.PI * 2);
      ctx.fill();
    });

  }, []);

  const update = useCallback((timestamp: number) => {
    if (gameState !== "playing") return;

    const deltaTime = timestamp - lastUpdateTime.current;
    lastUpdateTime.current = timestamp;

    // Update timer
    setTimeLeft(prev => Math.max(0, prev - deltaTime / 1000));

    if (timeLeft <= 0) {
      setGameState("over");
      saveHighScore(score);
      return;
    }

    // Remove old moles
    const now = Date.now();
    moles.current = moles.current.filter(mole => {
      const lifespan = mole.isGolden ? GOLDEN_MOLE_LIFESPAN : MOLE_LIFESPAN;
      return !mole.isWhacked && now - mole.createdAt < lifespan;
    });

    // Add new moles
    if (now - lastMoleTime.current > moleInterval.current) {
      lastMoleTime.current = now;
      moleInterval.current = Math.max(200, 1000 - (GAME_DURATIONS[difficulty] - timeLeft) * 20);

      const occupiedHoles = new Set(moles.current.map(m => `${m.x}-${m.y}`));
      if (occupiedHoles.size >= GRID_SIZE * GRID_SIZE) return;

      let row, col;
      const spacing = canvasRef.current!.width / GRID_SIZE;
      do {
        row = Math.floor(Math.random() * GRID_SIZE);
        col = Math.floor(Math.random() * GRID_SIZE);
      } while (occupiedHoles.has(`${spacing / 2 + col * spacing}-${spacing / 2 + row * spacing}`));

      const x = spacing / 2 + col * spacing;
      const y = spacing / 2 + row * spacing;
      const isGolden = Math.random() < 0.1; // 10% chance for a golden mole

      moles.current.push({
        x,
        y,
        radius: (canvasRef.current!.width / (GRID_SIZE * 2.5)) * 0.8,
        isGolden,
        createdAt: now,
        isWhacked: false,
      });
    }

  }, [gameState, timeLeft, score, saveHighScore, difficulty]);

  const gameLoop = useCallback((timestamp: number) => {
    update(timestamp);
    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let hit = false;
    moles.current.forEach(mole => {
      if (mole.isWhacked) return;
      const distance = Math.sqrt((x - mole.x) ** 2 + (y - mole.y) ** 2);
      if (distance < mole.radius) {
        hit = true;
        mole.isWhacked = true;
        setScore(s => s + (mole.isGolden ? 25 : 10));
        setCombo(c => c + 1);
      }
    });

    if (!hit) {
      setScore(s => Math.max(0, s - 5));
      setCombo(0);
    }
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== "playing") return;
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    let hit = false;
    moles.current.forEach(mole => {
      if (mole.isWhacked) return;
      const distance = Math.sqrt((x - mole.x) ** 2 + (y - mole.y) ** 2);
      if (distance < mole.radius) {
        hit = true;
        mole.isWhacked = true;
        setScore(s => s + (mole.isGolden ? 25 : 10));
        setCombo(c => c + 1);
      }
    });

    if (!hit) {
      setScore(s => Math.max(0, s - 5));
      setCombo(0);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "Escape") {
        if (gameState === "playing" || gameState === "paused") {
          togglePause();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        const size = Math.min(container.clientWidth, 700);
        canvas.width = size;
        canvas.height = size;
        draw();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [draw]);

  useEffect(() => {
    if (gameState === "playing") {
      lastUpdateTime.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  const renderOverlay = () => {
    const overlayClasses = "absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-center p-4";
    switch (gameState) {
      case "idle":
        return (
          <div className={overlayClasses}>
            <h2 className="text-3xl font-bold mb-4" style={{ color: ACCENT_COLOR }}>Whack-A-Mole</h2>
            <p className="text-white mb-4">Click the moles as they pop up! Golden moles are worth more. Don't miss!</p>
            <div className="flex gap-2 mb-4">
              <Button onClick={() => { setDifficulty("easy"); setTimeLeft(GAME_DURATIONS.easy); }} variant={difficulty === "easy" ? "default" : "outline"}>Easy</Button>
              <Button onClick={() => { setDifficulty("medium"); setTimeLeft(GAME_DURATIONS.medium); }} variant={difficulty === "medium" ? "default" : "outline"}>Medium</Button>
              <Button onClick={() => { setDifficulty("hard"); setTimeLeft(GAME_DURATIONS.hard); }} variant={difficulty === "hard" ? "default" : "outline"}>Hard</Button>
            </div>
            <Button onClick={startGame} size="lg">
              <Play className="mr-2 h-5 w-5" /> Start Game
            </Button>
          </div>
        );
      case "paused":
        return (
          <div className={overlayClasses}>
            <h2 className="text-3xl font-bold mb-4 text-white">Paused</h2>
            <Button onClick={togglePause} size="lg">
              <Play className="mr-2 h-5 w-5" /> Resume
            </Button>
          </div>
        );
      case "over":
        return (
          <div className={overlayClasses}>
            <h2 className="text-3xl font-bold mb-2 text-red-500">Game Over</h2>
            <p className="text-xl text-white mb-4">Final Score: {score}</p>
            <div className="flex items-center gap-3">
              <Button onClick={startGame} size="lg">
                <RotateCcw className="mr-2 h-5 w-5" /> Play Again
              </Button>
              <ShareScore gameName="Whack-a-Mole" score={score} isHighScore={score > highScore} />
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <GameLayout title="Whack-a-Mole" color="mint">
    <GameTutorial {...tutorials["whack-a-mole"]} />
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center gap-4 mb-2 text-white text-sm">
        <span>Score: {score}</span>
        <span>Best: {highScore}</span>
        <span>Time: {Math.ceil(timeLeft)}s</span>
        {combo > 1 && <span>Combo: {combo}x</span>}
        {gameState === "playing" && (
          <button onClick={togglePause} className="ml-2 p-1 rounded bg-white/10 hover:bg-white/20">
            <Pause className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
      <div className="relative w-full max-w-[700px] aspect-square">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-lg shadow-lg"
          onMouseDown={handleCanvasClick}
          onTouchStart={handleTouchStart}
        />
        {renderOverlay()}
      </div>
    </div>
    </GameLayout>
  );
}
