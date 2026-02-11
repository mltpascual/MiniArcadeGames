/**
 * Flappy Bird Game — Canvas-based flappy bird clone
 * Color theme: Coral (#FF6B6B)
 * Controls: Space / Click / Tap to flap
 */
import { useEffect, useRef, useState, useCallback } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Trophy } from "lucide-react";

const CANVAS_W = 400;
const CANVAS_H = 600;
const GRAVITY = 0.45;
const FLAP_FORCE = -7.5;
const PIPE_WIDTH = 52;
const PIPE_GAP = 150;
const PIPE_SPEED = 2.5;
const BIRD_SIZE = 24;
const PIPE_SPAWN_INTERVAL = 100;

interface Pipe {
  x: number;
  topH: number;
  scored: boolean;
}

const COLORS = {
  bg1: "#1a1a2e",
  bg2: "#16213e",
  bird: "#FF6B6B",
  birdWing: "#FF8E8E",
  birdEye: "#1a1a2e",
  pipe: "#4ECDC4",
  pipeEdge: "#3DBDB5",
  ground: "#2a2a4e",
  groundLine: "#3a3a5e",
  text: "#ffffff",
  score: "#FF6B6B",
};

export default function FlappyBirdGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("flappy-highscore");
    return saved ? parseInt(saved, 10) : 0;
  });

  const birdRef = useRef({ y: CANVAS_H / 2, vel: 0, rotation: 0 });
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const frameRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const flapRef = useRef(false);

  const flap = useCallback(() => {
    if (gameState === "playing") {
      birdRef.current.vel = FLAP_FORCE;
      flapRef.current = true;
    }
  }, [gameState]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    bgGrad.addColorStop(0, COLORS.bg1);
    bgGrad.addColorStop(1, COLORS.bg2);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Stars
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    for (let i = 0; i < 30; i++) {
      const sx = (i * 137.5 + frameRef.current * 0.1) % CANVAS_W;
      const sy = (i * 73.7) % (CANVAS_H - 100);
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, CANVAS_H - 40, CANVAS_W, 40);
    ctx.strokeStyle = COLORS.groundLine;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_H - 40);
    ctx.lineTo(CANVAS_W, CANVAS_H - 40);
    ctx.stroke();

    // Ground pattern
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let i = 0; i < CANVAS_W / 20 + 1; i++) {
      const gx = ((i * 20 - (frameRef.current * 2) % 20) + CANVAS_W) % CANVAS_W;
      ctx.beginPath();
      ctx.moveTo(gx, CANVAS_H - 38);
      ctx.lineTo(gx + 10, CANVAS_H - 2);
      ctx.stroke();
    }

    // Pipes
    pipesRef.current.forEach((pipe) => {
      // Top pipe
      const topGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
      topGrad.addColorStop(0, COLORS.pipeEdge);
      topGrad.addColorStop(0.5, COLORS.pipe);
      topGrad.addColorStop(1, COLORS.pipeEdge);
      ctx.fillStyle = topGrad;
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topH);
      // Top pipe cap
      ctx.fillStyle = COLORS.pipeEdge;
      ctx.fillRect(pipe.x - 3, pipe.topH - 20, PIPE_WIDTH + 6, 20);
      ctx.strokeStyle = COLORS.pipe;
      ctx.lineWidth = 1;
      ctx.strokeRect(pipe.x - 3, pipe.topH - 20, PIPE_WIDTH + 6, 20);

      // Bottom pipe
      const bottomY = pipe.topH + PIPE_GAP;
      ctx.fillStyle = topGrad;
      ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_H - 40 - bottomY);
      // Bottom pipe cap
      ctx.fillStyle = COLORS.pipeEdge;
      ctx.fillRect(pipe.x - 3, bottomY, PIPE_WIDTH + 6, 20);
      ctx.strokeStyle = COLORS.pipe;
      ctx.strokeRect(pipe.x - 3, bottomY, PIPE_WIDTH + 6, 20);
    });

    // Bird
    const bird = birdRef.current;
    ctx.save();
    ctx.translate(80, bird.y);
    ctx.rotate((Math.min(bird.rotation, 90) * Math.PI) / 180);

    // Body
    ctx.fillStyle = COLORS.bird;
    ctx.beginPath();
    ctx.ellipse(0, 0, BIRD_SIZE / 2, BIRD_SIZE / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = COLORS.birdWing;
    const wingY = flapRef.current ? -6 : 2;
    ctx.beginPath();
    ctx.ellipse(-4, wingY, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    flapRef.current = false;

    // Eye
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(6, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.birdEye;
    ctx.beginPath();
    ctx.arc(7, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#FFD93D";
    ctx.beginPath();
    ctx.moveTo(BIRD_SIZE / 2 - 2, -2);
    ctx.lineTo(BIRD_SIZE / 2 + 6, 1);
    ctx.lineTo(BIRD_SIZE / 2 - 2, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Score display on canvas
    ctx.fillStyle = COLORS.score;
    ctx.font = '32px "Silkscreen", monospace';
    ctx.textAlign = "center";
    ctx.fillText(String(scoreRef.current), CANVAS_W / 2, 50);
  }, []);

  const gameLoop = useCallback(() => {
    const bird = birdRef.current;
    frameRef.current++;

    // Physics
    bird.vel += GRAVITY;
    bird.y += bird.vel;
    bird.rotation = Math.min(bird.vel * 4, 90);

    // Spawn pipes
    if (frameRef.current % PIPE_SPAWN_INTERVAL === 0) {
      const minTop = 60;
      const maxTop = CANVAS_H - 40 - PIPE_GAP - 60;
      const topH = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
      pipesRef.current.push({ x: CANVAS_W, topH, scored: false });
    }

    // Move pipes
    pipesRef.current = pipesRef.current.filter((p) => p.x + PIPE_WIDTH > -10);
    pipesRef.current.forEach((pipe) => {
      pipe.x -= PIPE_SPEED;

      // Score
      if (!pipe.scored && pipe.x + PIPE_WIDTH < 80) {
        pipe.scored = true;
        scoreRef.current++;
        setScore(scoreRef.current);
      }
    });

    // Collision detection
    const birdLeft = 80 - BIRD_SIZE / 2;
    const birdRight = 80 + BIRD_SIZE / 2;
    const birdTop = bird.y - BIRD_SIZE / 2 + 2;
    const birdBottom = bird.y + BIRD_SIZE / 2 - 2;

    // Ground/ceiling
    if (birdBottom >= CANVAS_H - 40 || birdTop <= 0) {
      endGame();
      return;
    }

    // Pipes
    for (const pipe of pipesRef.current) {
      if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH) {
        if (birdTop < pipe.topH || birdBottom > pipe.topH + PIPE_GAP) {
          endGame();
          return;
        }
      }
    }

    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [draw]);

  const endGame = useCallback(() => {
    setGameState("over");
    const final = scoreRef.current;
    if (final > highScore) {
      setHighScore(final);
      localStorage.setItem("flappy-highscore", String(final));
    }
  }, [highScore]);

  const startGame = useCallback(() => {
    birdRef.current = { y: CANVAS_H / 2, vel: 0, rotation: 0 };
    pipesRef.current = [];
    scoreRef.current = 0;
    frameRef.current = 0;
    setScore(0);
    setGameState("playing");
  }, []);

  // Game loop effect
  useEffect(() => {
    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, gameLoop]);

  // Controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        if (gameState === "playing") {
          flap();
        } else {
          startGame();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, flap, startGame]);

  // Draw initial state
  useEffect(() => {
    if (gameState === "idle") draw();
  }, [gameState, draw]);

  const handleCanvasClick = () => {
    if (gameState === "playing") {
      flap();
    }
  };

  return (
    <GameLayout title="FLAPPY BIRD" color="coral">
      {/* Score display */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Score</span>
          <span className="font-pixel text-lg text-arcade-coral">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-arcade-mint" />
          <span className="text-sm text-muted-foreground">Best</span>
          <span className="font-pixel text-lg text-arcade-mint">{highScore}</span>
        </div>
      </div>

      {/* Game canvas */}
      <div className="relative rounded-xl border border-arcade-coral/20 overflow-hidden card-glow-coral">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="game-canvas block cursor-pointer"
          onClick={handleCanvasClick}
          onTouchStart={(e) => {
            e.preventDefault();
            if (gameState === "playing") flap();
          }}
          style={{ width: `min(${CANVAS_W}px, calc(100vw - 2rem))`, height: "auto", aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
        />

        {/* Overlay states */}
        {gameState === "idle" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <h2 className="font-pixel text-2xl text-arcade-coral text-glow-coral">FLAPPY BIRD</h2>
            <p className="text-sm text-white/70 text-center px-4">
              Tap, click, or press Space to flap
            </p>
            <Button
              onClick={startGame}
              className="bg-arcade-coral text-white hover:bg-arcade-coral/90 font-pixel text-sm gap-2"
            >
              <Play className="w-4 h-4" /> START
            </Button>
          </div>
        )}

        {gameState === "over" && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
            <h2 className="font-pixel text-2xl text-arcade-coral text-glow-coral">GAME OVER</h2>
            <p className="font-pixel text-lg text-white">Score: {score}</p>
            {score >= highScore && score > 0 && (
              <p className="font-pixel text-sm text-arcade-mint animate-pulse">NEW HIGH SCORE!</p>
            )}
            <Button
              onClick={startGame}
              className="bg-arcade-coral text-white hover:bg-arcade-coral/90 font-pixel text-sm gap-2"
            >
              <RotateCcw className="w-4 h-4" /> RETRY
            </Button>
          </div>
        )}
      </div>

      {/* Controls hint */}
      <p className="mt-4 text-xs text-muted-foreground text-center">
        Space / Click / Tap to flap · Space to start/restart
      </p>
    </GameLayout>
  );
}
