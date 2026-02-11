/**
 * Snake Game — Canvas-based classic snake game
 * Color theme: Mint (#4ECDC4)
 * Controls: Arrow keys / WASD / Swipe on mobile
 */
import { useEffect, useRef, useState, useCallback } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Trophy, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Pause } from "lucide-react";
import { useGameSettings } from "@/contexts/GameSettingsContext";
import { useSoundEngine } from "@/hooks/useSoundEngine";
import { useScoreSubmit } from "@/hooks/useScoreSubmit";

const CELL_SIZE = 20;
const GRID_W = 20;
const GRID_H = 20;
const CANVAS_W = CELL_SIZE * GRID_W;
const CANVAS_H = CELL_SIZE * GRID_H;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Point = { x: number; y: number };

const COLORS = {
  bg: "#1a1a2e",
  grid: "#222240",
  snake: "#4ECDC4",
  snakeHead: "#3DBDB5",
  food: "#FF6B6B",
  foodGlow: "rgba(255, 107, 107, 0.3)",
  text: "#ffffff",
};

function getInitialSnake(): Point[] {
  return [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
}

function randomFood(snake: Point[]): Point {
  let food: Point;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_W),
      y: Math.floor(Math.random() * GRID_H),
    };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
  return food;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "over">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("snake-highscore");
    return saved ? parseInt(saved, 10) : 0;
  });

  const { difficultyParams, speedMultiplier } = useGameSettings();
  const { playSound, startMusic, stopMusic } = useSoundEngine();
  const { submitScore } = useScoreSubmit();

  const snakeRef = useRef<Point[]>(getInitialSnake());
  const dirRef = useRef<Direction>("RIGHT");
  const nextDirRef = useRef<Direction>("RIGHT");
  const foodRef = useRef<Point>(randomFood(getInitialSnake()));
  const scoreRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const speedRef = useRef(difficultyParams.snakeSpeed);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GRID_W; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, CANVAS_H);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_H; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(CANVAS_W, y * CELL_SIZE);
      ctx.stroke();
    }

    // Food glow
    const food = foodRef.current;
    ctx.fillStyle = COLORS.foodGlow;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Food
    ctx.fillStyle = COLORS.food;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Snake
    const snake = snakeRef.current;
    snake.forEach((seg, i) => {
      const isHead = i === 0;
      const alpha = 1 - (i / snake.length) * 0.4;
      ctx.fillStyle = isHead
        ? COLORS.snakeHead
        : `rgba(78, 205, 196, ${alpha})`;
      const padding = isHead ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(
        seg.x * CELL_SIZE + padding,
        seg.y * CELL_SIZE + padding,
        CELL_SIZE - padding * 2,
        CELL_SIZE - padding * 2,
        isHead ? 4 : 3
      );
      ctx.fill();

      // Head eyes
      if (isHead) {
        ctx.fillStyle = "#1a1a2e";
        const dir = dirRef.current;
        let ex1 = 0, ey1 = 0, ex2 = 0, ey2 = 0;
        const cx = seg.x * CELL_SIZE + CELL_SIZE / 2;
        const cy = seg.y * CELL_SIZE + CELL_SIZE / 2;
        if (dir === "RIGHT") { ex1 = cx + 3; ey1 = cy - 3; ex2 = cx + 3; ey2 = cy + 3; }
        if (dir === "LEFT") { ex1 = cx - 3; ey1 = cy - 3; ex2 = cx - 3; ey2 = cy + 3; }
        if (dir === "UP") { ex1 = cx - 3; ey1 = cy - 3; ex2 = cx + 3; ey2 = cy - 3; }
        if (dir === "DOWN") { ex1 = cx - 3; ey1 = cy + 3; ex2 = cx + 3; ey2 = cy + 3; }
        ctx.beginPath();
        ctx.arc(ex1, ey1, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex2, ey2, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, []);

  const gameLoop = useCallback(
    (timestamp: number) => {
      if (lastTickRef.current === 0) lastTickRef.current = timestamp;
      const elapsed = timestamp - lastTickRef.current;

      if (elapsed >= speedRef.current) {
        lastTickRef.current = timestamp;
        dirRef.current = nextDirRef.current;

        const snake = [...snakeRef.current];
        const head = { ...snake[0] };

        switch (dirRef.current) {
          case "UP": head.y -= 1; break;
          case "DOWN": head.y += 1; break;
          case "LEFT": head.x -= 1; break;
          case "RIGHT": head.x += 1; break;
        }

      // Wall collision
      if (head.x < 0 || head.x >= GRID_W || head.y < 0 || head.y >= GRID_H) {
          setGameState("over");
          playSound("gameOver");
          stopMusic();
          const final = scoreRef.current;
          if (final > highScore) {
            setHighScore(final);
            localStorage.setItem("snake-highscore", String(final));
          }
          submitScore({ game: "snake", score: final });
          return;
        }

        // Self collision
        if (snake.some((s) => s.x === head.x && s.y === head.y)) {
          setGameState("over");
          playSound("gameOver");
          stopMusic();
          const final = scoreRef.current;
          if (final > highScore) {
            setHighScore(final);
            localStorage.setItem("snake-highscore", String(final));
          }
          submitScore({ game: "snake", score: final });
          return;
        }

        snake.unshift(head);

        // Food collision
        if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
          scoreRef.current += 10;
          setScore(scoreRef.current);
          foodRef.current = randomFood(snake);
          playSound("eat");
          // Speed up slightly
          speedRef.current = Math.max(40, speedRef.current - 1);
        } else {
          snake.pop();
        }

        snakeRef.current = snake;
      }

      draw();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [draw, highScore]
  );

  const startGame = useCallback(() => {
    snakeRef.current = getInitialSnake();
    dirRef.current = "RIGHT";
    nextDirRef.current = "RIGHT";
    foodRef.current = randomFood(getInitialSnake());
    scoreRef.current = 0;
    speedRef.current = Math.round(difficultyParams.snakeSpeed / speedMultiplier);
    lastTickRef.current = 0;
    setScore(0);
    setGameState("playing");
    playSound("start");
    startMusic();
  }, [difficultyParams.snakeSpeed, speedMultiplier, playSound, startMusic]);

  const changeDirection = useCallback((newDir: Direction) => {
    const current = dirRef.current;
    if (
      (newDir === "UP" && current !== "DOWN") ||
      (newDir === "DOWN" && current !== "UP") ||
      (newDir === "LEFT" && current !== "RIGHT") ||
      (newDir === "RIGHT" && current !== "LEFT")
    ) {
      nextDirRef.current = newDir;
    }
  }, []);

  const togglePause = useCallback(() => {
    if (gameState === "playing") {
      setGameState("paused");
      stopMusic();
    } else if (gameState === "paused") {
      setGameState("playing");
      lastTickRef.current = 0;
      startMusic();
    }
  }, [gameState, stopMusic, startMusic]);

  // Game loop effect
  useEffect(() => {
    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, gameLoop]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Pause toggle
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        e.preventDefault();
        if (gameState === "playing" || gameState === "paused") {
          togglePause();
        }
        return;
      }
      if (gameState === "paused") return;
      if (gameState !== "playing") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          startGame();
        }
        return;
      }
      switch (e.key) {
        case "ArrowUp": case "w": case "W": e.preventDefault(); changeDirection("UP"); break;
        case "ArrowDown": case "s": case "S": e.preventDefault(); changeDirection("DOWN"); break;
        case "ArrowLeft": case "a": case "A": e.preventDefault(); changeDirection("LEFT"); break;
        case "ArrowRight": case "d": case "D": e.preventDefault(); changeDirection("RIGHT"); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, startGame, changeDirection, togglePause]);

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const minSwipe = 20;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > minSwipe) {
          changeDirection(dx > 0 ? "RIGHT" : "LEFT");
        }
      } else {
        if (Math.abs(dy) > minSwipe) {
          changeDirection(dy > 0 ? "DOWN" : "UP");
        }
      }
      touchStartRef.current = null;
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [changeDirection]);

  // Draw initial state
  useEffect(() => {
    if (gameState === "idle") draw();
  }, [gameState, draw]);

  return (
    <GameLayout title="SNAKE" color="mint">
      {/* Score display */}
      <div className="flex items-center gap-3 sm:gap-6 mb-3 sm:mb-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-[10px] sm:text-sm text-muted-foreground">Score</span>
          <span className="font-pixel text-sm sm:text-lg text-arcade-mint">{score}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-arcade-coral" />
          <span className="text-[10px] sm:text-sm text-muted-foreground">Best</span>
          <span className="font-pixel text-sm sm:text-lg text-arcade-coral">{highScore}</span>
        </div>
      </div>

      {/* Game canvas container */}
      <div className="relative rounded-xl border border-arcade-mint/20 overflow-hidden card-glow-mint">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="game-canvas block"
          style={{ width: `min(${CANVAS_W}px, calc(100vw - 2rem))`, height: "auto", aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
        />

        {/* Overlay states */}
        {gameState === "idle" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 sm:gap-4">
            <h2 className="font-pixel text-xl sm:text-2xl text-arcade-mint text-glow-mint">SNAKE</h2>
            <p className="text-xs sm:text-sm text-white/70 text-center px-4">
              Use arrow keys or swipe to control the snake
            </p>
            <Button
              onClick={startGame}
              className="bg-arcade-mint text-arcade-darker hover:bg-arcade-mint/90 font-pixel text-xs sm:text-sm gap-2"
            >
              <Play className="w-4 h-4" /> START
            </Button>
          </div>
        )}

        {gameState === "paused" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 sm:gap-4">
            <h2 className="font-pixel text-xl sm:text-2xl text-arcade-mint text-glow-mint">PAUSED</h2>
            <p className="text-xs sm:text-sm text-white/70">Press ESC or P to resume</p>
            <Button
              onClick={togglePause}
              className="bg-arcade-mint text-arcade-darker hover:bg-arcade-mint/90 font-pixel text-xs sm:text-sm gap-2"
            >
              <Play className="w-4 h-4" /> RESUME
            </Button>
          </div>
        )}

        {gameState === "over" && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 sm:gap-4">
            <h2 className="font-pixel text-xl sm:text-2xl text-arcade-coral text-glow-coral">GAME OVER</h2>
            <p className="font-pixel text-base sm:text-lg text-white">Score: {score}</p>
            {score >= highScore && score > 0 && (
              <p className="font-pixel text-xs sm:text-sm text-arcade-mint animate-pulse">NEW HIGH SCORE!</p>
            )}
            <Button
              onClick={startGame}
              className="bg-arcade-mint text-arcade-darker hover:bg-arcade-mint/90 font-pixel text-xs sm:text-sm gap-2"
            >
              <RotateCcw className="w-4 h-4" /> RETRY
            </Button>
          </div>
        )}
      </div>

      {/* Mobile D-pad controls */}
      <div className="mt-4 grid grid-cols-3 gap-2 w-48 sm:hidden">
        <div />
        <Button
          variant="outline"
          className="border-arcade-mint/30 text-arcade-mint h-14 w-full"
          onTouchStart={(e) => { e.preventDefault(); changeDirection("UP"); }}
        >
          <ChevronUp className="w-7 h-7" />
        </Button>
        <div />
        <Button
          variant="outline"
          className="border-arcade-mint/30 text-arcade-mint h-14 w-full"
          onTouchStart={(e) => { e.preventDefault(); changeDirection("LEFT"); }}
        >
          <ChevronLeft className="w-7 h-7" />
        </Button>
        <div />
        <Button
          variant="outline"
          className="border-arcade-mint/30 text-arcade-mint h-14 w-full"
          onTouchStart={(e) => { e.preventDefault(); changeDirection("RIGHT"); }}
        >
          <ChevronRight className="w-7 h-7" />
        </Button>
        <div />
        <Button
          variant="outline"
          className="border-arcade-mint/30 text-arcade-mint h-14 w-full"
          onTouchStart={(e) => { e.preventDefault(); changeDirection("DOWN"); }}
        >
          <ChevronDown className="w-7 h-7" />
        </Button>
        <div />
      </div>

      {/* Pause button for mobile */}
      {gameState === "playing" && (
        <Button
          variant="outline"
          className="mt-3 border-arcade-mint/30 text-arcade-mint font-pixel text-xs sm:hidden gap-1"
          onClick={togglePause}
        >
          <Pause className="w-4 h-4" /> PAUSE
        </Button>
      )}

      {/* Controls hint */}
      <p className="mt-4 text-[10px] sm:text-xs text-muted-foreground text-center hidden sm:block">
        Arrow keys or WASD to move · P to pause · Space to start/restart
      </p>
    </GameLayout>
  );
}
