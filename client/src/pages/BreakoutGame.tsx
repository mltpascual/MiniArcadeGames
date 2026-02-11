// GAME: Breakout
// FILE: BreakoutGame.tsx
// COLOR: #FF6B6B (coral)
// GAME_ID: breakout

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Pause } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { useSoundEngine } from "@/hooks/useSoundEngine";
import { useScoreSubmit } from "@/hooks/useScoreSubmit";
import GameTutorial from "@/components/GameTutorial";
import ShareScore from "@/components/ShareScore";
import { tutorials } from "@/data/tutorialData";

const ACCENT_COLOR = "#FF6B6B";
const GAME_ID = "breakout";
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 8;
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 8;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = 30;

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  status: 1 | 0;
  color: string;
  score: number;
}

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { playSound, startMusic, stopMusic } = useSoundEngine();
  const { submitScore } = useScoreSubmit();
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "over">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);

  const paddleX = useRef(CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2);
  const ball = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - PADDLE_HEIGHT - BALL_RADIUS - 5,
    dx: 2,
    dy: -2,
    speed: 4,
  });
  const bricks = useRef<Brick[][]>([]);
  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    const savedHighScore = localStorage.getItem(`pixel-play-${GAME_ID}-highscore`);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  const brickColors = ["#7FFFD4", "#FF7F50", "#6495ED", "#FFD700", "#DE3163"];

  const resetBricks = () => {
    const newBricks: Brick[][] = [];
    const brickWidth = (CANVAS_WIDTH - BRICK_OFFSET_LEFT * 2 - BRICK_PADDING * (BRICK_COLUMN_COUNT - 1)) / BRICK_COLUMN_COUNT;
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      newBricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const brickX = c * (brickWidth + BRICK_PADDING) + BRICK_OFFSET_LEFT;
        const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
        newBricks[c][r] = {
          x: brickX,
          y: brickY,
          width: brickWidth,
          height: BRICK_HEIGHT,
          status: 1,
          color: brickColors[r % brickColors.length],
          score: (BRICK_ROW_COUNT - r) * 10,
        };
      }
    }
    bricks.current = newBricks;
  };

  const resetGame = useCallback(() => {
    setScore(0);
    setLives(3);
    resetBricks();
    ball.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - PADDLE_HEIGHT - BALL_RADIUS - 50,
      dx: 2,
      dy: -2,
      speed: 4,
    };
    paddleX.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    setGameState("playing");
  }, []);

  const drawPaddle = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.rect(paddleX.current, CANVAS_HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = ACCENT_COLOR;
    ctx.fill();
    ctx.closePath();
  };

  const drawBall = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.arc(ball.current.x, ball.current.y, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.closePath();
  };

  const drawBricks = (ctx: CanvasRenderingContext2D) => {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        if (bricks.current[c][r].status === 1) {
          const brick = bricks.current[c][r];
          ctx.beginPath();
          ctx.rect(brick.x, brick.y, brick.width, brick.height);
          ctx.fillStyle = brick.color;
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  };

  const collisionDetection = () => {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const b = bricks.current[c][r];
        if (b.status === 1) {
          if (
            ball.current.x > b.x &&
            ball.current.x < b.x + b.width &&
            ball.current.y > b.y &&
            ball.current.y < b.y + b.height
          ) {
            ball.current.dy = -ball.current.dy;
            b.status = 0;
            setScore((prev) => prev + b.score);

            // Speed up
            ball.current.speed *= 1.01;

            // Check for win
            const allBricksBroken = bricks.current.flat().every(brick => brick.status === 0);
            if (allBricksBroken) {
                setGameState("over");
            }
          }
        }
      }
    }
  };

  const update = () => {
    if (gameState !== "playing") return;

    // Ball movement
    ball.current.x += ball.current.dx;
    ball.current.y += ball.current.dy;

    // Wall collision (left/right)
    if (ball.current.x + ball.current.dx > CANVAS_WIDTH - BALL_RADIUS || ball.current.x + ball.current.dx < BALL_RADIUS) {
      ball.current.dx = -ball.current.dx;
    }

    // Wall collision (top)
    if (ball.current.y + ball.current.dy < BALL_RADIUS) {
      ball.current.dy = -ball.current.dy;
    }

    // Paddle collision
    if (ball.current.y + ball.current.dy > CANVAS_HEIGHT - BALL_RADIUS - PADDLE_HEIGHT) {
      if (ball.current.x > paddleX.current && ball.current.x < paddleX.current + PADDLE_WIDTH) {
        let collidePoint = ball.current.x - (paddleX.current + PADDLE_WIDTH / 2);
        collidePoint = collidePoint / (PADDLE_WIDTH / 2);
        const angle = collidePoint * (Math.PI / 3);
        ball.current.dx = ball.current.speed * Math.sin(angle);
        ball.current.dy = -ball.current.speed * Math.cos(angle);
      } else { // Ball missed paddle
        setLives(prev => prev - 1);
        if (lives - 1 <= 0) {
          setGameState("over");
        } else {
          ball.current.x = CANVAS_WIDTH / 2;
          ball.current.y = CANVAS_HEIGHT - PADDLE_HEIGHT - BALL_RADIUS - 5;
          ball.current.dx = 2;
          ball.current.dy = -2;
          paddleX.current = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
        }
      }
    }

    collisionDetection();
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks(ctx);
    drawPaddle(ctx);
    drawBall(ctx);
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState === "playing") {
      update();
      draw();
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState, draw]);

  useEffect(() => {
    if (gameState === "playing") {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    if (gameState === "over" && score > highScore) {
      setHighScore(score);
      localStorage.setItem(`pixel-play-${GAME_ID}-highscore`, score.toString());
    }
  }, [gameState, score, highScore]);

  const togglePause = useCallback(() => {
    setGameState(prev => (prev === "playing" ? "paused" : "playing"));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key.toLowerCase() === "p") {
        togglePause();
      }
      if (gameState === "playing") {
        if (e.key === "Right" || e.key === "ArrowRight") {
          paddleX.current = Math.min(paddleX.current + 20, CANVAS_WIDTH - PADDLE_WIDTH);
        } else if (e.key === "Left" || e.key === "ArrowLeft") {
          paddleX.current = Math.max(paddleX.current - 20, 0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, togglePause]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== "playing") return;
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
      paddleX.current = Math.max(0, Math.min(relativeX - PADDLE_WIDTH / 2, CANVAS_WIDTH - PADDLE_WIDTH));
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || gameState !== "playing") return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const relativeX = touch.clientX - rect.left;
    if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
      paddleX.current = Math.max(0, Math.min(relativeX - PADDLE_WIDTH / 2, CANVAS_WIDTH - PADDLE_WIDTH));
    }
  };

  return (
    <GameLayout title="Breakout" color="coral">
    <GameTutorial {...tutorials.breakout} />
    <div className="flex flex-col items-center justify-center text-white font-pixel">
      <div className="flex items-center gap-4 mb-2 text-sm">
        <span>Score: {score}</span>
        <span>Best: {highScore}</span>
        <span>Lives: {lives}</span>
        {gameState === "playing" && (
          <button onClick={togglePause} className="ml-2 p-1 rounded bg-white/10 hover:bg-white/20">
            <Pause className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
      <div className="relative w-full max-w-[700px] aspect-[4/5] bg-[#0d0d1a] rounded-lg overflow-hidden shadow-lg border-2 border-gray-600">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full"
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onTouchStart={(e) => e.preventDefault()}
        />
        {gameState !== "playing" && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center p-4">
            {gameState === "idle" && (
              <>
                <h2 className="text-3xl font-bold mb-4" style={{ color: ACCENT_COLOR }}>
                  Breakout
                </h2>
                <p className="mb-6">Destroy all the bricks to win!</p>
                <Button onClick={resetGame} size="lg" style={{ backgroundColor: ACCENT_COLOR, color: "white" }}>
                  <Play className="mr-2 h-5 w-5" /> Start Game
                </Button>
              </>
            )}
            {gameState === "paused" && (
              <>
                <h2 className="text-3xl font-bold mb-4">Paused</h2>
                <Button onClick={togglePause} size="lg" style={{ backgroundColor: ACCENT_COLOR, color: "white" }}>
                  <Play className="mr-2 h-5 w-5" /> Resume
                </Button>
              </>
            )}
            {gameState === "over" && (
              <>
                <h2 className="text-3xl font-bold mb-4">Game Over</h2>
                <p className="text-xl mb-4">Final Score: {score}</p>
                <div className="flex items-center gap-3">
                  <Button onClick={resetGame} size="lg" style={{ backgroundColor: ACCENT_COLOR, color: "white" }}>
                    <RotateCcw className="mr-2 h-5 w-5" /> Play Again
                  </Button>
                  <ShareScore gameName="Breakout" score={score} isHighScore={score > highScore} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
       <div className="sm:hidden w-full max-w-[700px] mt-4 flex justify-between gap-2">
         <div className="text-xs text-gray-400 text-center">
            <p>Move paddle with mouse, arrow keys, or touch.</p>
            <p>Press 'P' or 'Esc' to pause.</p>
        </div>
      </div>
    </div>
    </GameLayout>
  );
}

