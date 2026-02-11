/**
 * Dino Jump Game — Canvas-based Chrome dinosaur runner clone
 * Color theme: Indigo (#6C63FF)
 * Controls: Space / ArrowUp / Click / Tap to jump, ArrowDown to duck
 */
import { useEffect, useRef, useState, useCallback } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Trophy, ArrowUp, ArrowDown, Pause } from "lucide-react";
import { useGameSettings } from "@/contexts/GameSettingsContext";
import ShareScore from "@/components/ShareScore";
import { useSoundEngine } from "@/hooks/useSoundEngine";
import { useScoreSubmit } from "@/hooks/useScoreSubmit";
import GameTutorial from "@/components/GameTutorial";
import { tutorials } from "@/data/tutorialData";

const CANVAS_W = 700;
const CANVAS_H = 250;
const GROUND_Y = CANVAS_H - 40;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const INITIAL_SPEED = 5;
const MAX_SPEED = 12;

interface Obstacle {
  x: number;
  w: number;
  h: number;
  type: "cactus-small" | "cactus-tall" | "cactus-group" | "bird";
  birdY?: number;
}

const COLORS = {
  bg: "#1a1a2e",
  ground: "#2a2a4e",
  groundLine: "#6C63FF",
  dino: "#6C63FF",
  dinoLight: "#8B83FF",
  cactus: "#4ECDC4",
  cactusEdge: "#3DBDB5",
  bird: "#FF6B6B",
  cloud: "rgba(108, 99, 255, 0.15)",
  text: "#ffffff",
  score: "#6C63FF",
  mountain: "#222240",
  mountainLight: "#2a2a50",
};

export default function DinoGame() {
  const { difficultyParams, speedMultiplier } = useGameSettings();
  const { playSound, startMusic, stopMusic } = useSoundEngine();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "over">("idle");
  const { submitScore } = useScoreSubmit();
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("dino-highscore");
    return saved ? parseInt(saved, 10) : 0;
  });

  const dinoRef = useRef({
    y: GROUND_Y,
    vel: 0,
    jumping: false,
    ducking: false,
    legFrame: 0,
  });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const scoreRef = useRef(0);
  const frameRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);
  const gameLoopRef = useRef<number | null>(null);
  const cloudsRef = useRef<{ x: number; y: number; w: number }[]>([]);
  const mountainsRef = useRef<{ x: number; h: number; w: number }[]>([]);

  // Initialize clouds and mountains
  useEffect(() => {
    cloudsRef.current = Array.from({ length: 5 }, (_, i) => ({
      x: i * 160 + Math.random() * 80,
      y: 30 + Math.random() * 60,
      w: 40 + Math.random() * 30,
    }));
    mountainsRef.current = Array.from({ length: 4 }, (_, i) => ({
      x: i * 200 + Math.random() * 100,
      h: 40 + Math.random() * 50,
      w: 80 + Math.random() * 60,
    }));
  }, []);

  const drawDino = useCallback((ctx: CanvasRenderingContext2D) => {
    const dino = dinoRef.current;
    const x = 60;
    const y = dino.y;
    const ducking = dino.ducking && !dino.jumping;

    ctx.fillStyle = COLORS.dino;

    if (ducking) {
      // Ducking dino — wider and shorter
      // Body
      ctx.fillRect(x - 15, y - 16, 35, 16);
      // Head
      ctx.fillRect(x + 15, y - 22, 12, 12);
      // Eye
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(x + 22, y - 20, 3, 3);
      ctx.fillStyle = COLORS.dino;
      // Legs
      const legOffset = dino.legFrame % 2 === 0 ? 0 : 4;
      ctx.fillRect(x - 8 + legOffset, y, 4, 6);
      ctx.fillRect(x + 6 - legOffset, y, 4, 6);
    } else {
      // Standing dino
      // Body
      ctx.fillRect(x - 8, y - 36, 20, 28);
      // Head
      ctx.fillRect(x + 2, y - 48, 16, 16);
      // Jaw
      ctx.fillRect(x + 8, y - 38, 14, 6);
      // Eye
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(x + 12, y - 46, 3, 3);
      ctx.fillStyle = COLORS.dino;
      // Arm
      ctx.fillRect(x + 8, y - 22, 4, 8);
      // Tail
      ctx.fillRect(x - 14, y - 32, 8, 6);
      ctx.fillRect(x - 18, y - 28, 6, 4);
      // Legs
      const legOffset = dino.legFrame % 2 === 0 ? 0 : 4;
      ctx.fillRect(x - 4 + legOffset, y - 8, 5, 8);
      ctx.fillRect(x + 8 - legOffset, y - 8, 5, 8);
    }

    // Highlight
    ctx.fillStyle = COLORS.dinoLight;
    if (ducking) {
      ctx.fillRect(x - 15, y - 16, 35, 3);
    } else {
      ctx.fillRect(x - 8, y - 36, 20, 3);
    }
  }, []);

  const drawCactus = useCallback((ctx: CanvasRenderingContext2D, obs: Obstacle) => {
    ctx.fillStyle = COLORS.cactus;

    if (obs.type === "cactus-small") {
      ctx.fillRect(obs.x, GROUND_Y - obs.h, obs.w, obs.h);
      ctx.fillRect(obs.x - 4, GROUND_Y - obs.h + 8, 4, 12);
      ctx.fillRect(obs.x + obs.w, GROUND_Y - obs.h + 14, 4, 10);
      // Highlight
      ctx.fillStyle = COLORS.cactusEdge;
      ctx.fillRect(obs.x, GROUND_Y - obs.h, obs.w, 3);
    } else if (obs.type === "cactus-tall") {
      ctx.fillRect(obs.x, GROUND_Y - obs.h, obs.w, obs.h);
      ctx.fillRect(obs.x - 5, GROUND_Y - obs.h + 12, 5, 16);
      ctx.fillRect(obs.x + obs.w, GROUND_Y - obs.h + 20, 5, 14);
      ctx.fillStyle = COLORS.cactusEdge;
      ctx.fillRect(obs.x, GROUND_Y - obs.h, obs.w, 3);
    } else if (obs.type === "cactus-group") {
      // Three cacti close together
      for (let i = 0; i < 3; i++) {
        const cx = obs.x + i * 14;
        const ch = obs.h - i * 5 + (i === 1 ? 8 : 0);
        ctx.fillStyle = COLORS.cactus;
        ctx.fillRect(cx, GROUND_Y - ch, 10, ch);
        ctx.fillStyle = COLORS.cactusEdge;
        ctx.fillRect(cx, GROUND_Y - ch, 10, 2);
      }
    }
  }, []);

  const drawBird = useCallback((ctx: CanvasRenderingContext2D, obs: Obstacle) => {
    const y = obs.birdY || GROUND_Y - 50;
    const wingUp = frameRef.current % 20 < 10;

    ctx.fillStyle = COLORS.bird;
    // Body
    ctx.fillRect(obs.x, y, 20, 10);
    // Wing
    if (wingUp) {
      ctx.fillRect(obs.x + 4, y - 8, 12, 8);
    } else {
      ctx.fillRect(obs.x + 4, y + 10, 12, 8);
    }
    // Beak
    ctx.fillStyle = "#FFD93D";
    ctx.fillRect(obs.x + 20, y + 2, 6, 4);
    // Eye
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(obs.x + 16, y + 2, 2, 2);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Mountains (parallax)
    mountainsRef.current.forEach((m) => {
      ctx.fillStyle = COLORS.mountain;
      ctx.beginPath();
      ctx.moveTo(m.x, GROUND_Y);
      ctx.lineTo(m.x + m.w / 2, GROUND_Y - m.h);
      ctx.lineTo(m.x + m.w, GROUND_Y);
      ctx.closePath();
      ctx.fill();

      // Mountain highlight
      ctx.fillStyle = COLORS.mountainLight;
      ctx.beginPath();
      ctx.moveTo(m.x + m.w / 2, GROUND_Y - m.h);
      ctx.lineTo(m.x + m.w / 2 + 10, GROUND_Y - m.h + 15);
      ctx.lineTo(m.x + m.w * 0.7, GROUND_Y);
      ctx.lineTo(m.x + m.w, GROUND_Y);
      ctx.closePath();
      ctx.fill();
    });

    // Clouds
    cloudsRef.current.forEach((c) => {
      ctx.fillStyle = COLORS.cloud;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w / 2, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(c.x - c.w / 4, c.y + 5, c.w / 3, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Ground
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, GROUND_Y, CANVAS_W, CANVAS_H - GROUND_Y);
    ctx.strokeStyle = COLORS.groundLine;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_W, GROUND_Y);
    ctx.stroke();

    // Ground texture
    ctx.fillStyle = "rgba(108, 99, 255, 0.1)";
    for (let i = 0; i < 40; i++) {
      const gx = ((i * 20 - (frameRef.current * speedRef.current * 0.5) % 800) + 800) % CANVAS_W;
      ctx.fillRect(gx, GROUND_Y + 5 + (i % 3) * 8, 3 + (i % 2) * 2, 2);
    }

    // Obstacles
    obstaclesRef.current.forEach((obs) => {
      if (obs.type === "bird") {
        drawBird(ctx, obs);
      } else {
        drawCactus(ctx, obs);
      }
    });

    // Dino
    drawDino(ctx);

    // Score on canvas
    ctx.fillStyle = COLORS.score;
    ctx.font = '20px "Silkscreen", monospace';
    ctx.textAlign = "right";
    ctx.fillText(String(Math.floor(scoreRef.current)).padStart(5, "0"), CANVAS_W - 20, 30);
  }, [drawDino, drawCactus, drawBird]);

  const spawnObstacle = useCallback(() => {
    const rand = Math.random();
    let obs: Obstacle;

    if (rand < 0.3) {
      obs = { x: CANVAS_W, w: 12, h: 30 + Math.random() * 10, type: "cactus-small" };
    } else if (rand < 0.55) {
      obs = { x: CANVAS_W, w: 14, h: 45 + Math.random() * 10, type: "cactus-tall" };
    } else if (rand < 0.8) {
      obs = { x: CANVAS_W, w: 38, h: 30 + Math.random() * 8, type: "cactus-group" };
    } else {
      const birdY = GROUND_Y - (Math.random() > 0.5 ? 50 : 30);
      obs = { x: CANVAS_W, w: 26, h: 18, type: "bird", birdY };
    }

    obstaclesRef.current.push(obs);
  }, []);

  const gameLoop = useCallback(() => {
    const dino = dinoRef.current;
    frameRef.current++;

    // Score
    scoreRef.current += speedRef.current * 0.02;
    if (frameRef.current % 5 === 0) {
      setScore(Math.floor(scoreRef.current));
    }

    // Speed up
    speedRef.current = Math.min(MAX_SPEED, INITIAL_SPEED + scoreRef.current * 0.002);

    // Dino physics
    if (dino.jumping) {
      dino.vel += GRAVITY;
      dino.y += dino.vel;
      if (dino.y >= GROUND_Y) {
        dino.y = GROUND_Y;
        dino.vel = 0;
        dino.jumping = false;
      }
    }

    // Leg animation
    if (frameRef.current % 6 === 0) {
      dino.legFrame++;
    }

    // Spawn obstacles
    const lastObs = obstaclesRef.current[obstaclesRef.current.length - 1];
    const minGap = 200 / (speedRef.current / INITIAL_SPEED);
    if (!lastObs || lastObs.x < CANVAS_W - (minGap + Math.random() * 150)) {
      if (Math.random() < 0.03 * speedRef.current) {
        spawnObstacle();
      }
    }

    // Move obstacles
    obstaclesRef.current = obstaclesRef.current.filter((o) => o.x + o.w > -20);
    obstaclesRef.current.forEach((obs) => {
      obs.x -= speedRef.current;
    });

    // Move clouds (parallax - slower)
    cloudsRef.current.forEach((c) => {
      c.x -= speedRef.current * 0.2;
      if (c.x + c.w < 0) {
        c.x = CANVAS_W + Math.random() * 100;
        c.y = 30 + Math.random() * 60;
      }
    });

    // Move mountains (parallax - even slower)
    mountainsRef.current.forEach((m) => {
      m.x -= speedRef.current * 0.1;
      if (m.x + m.w < 0) {
        m.x = CANVAS_W + Math.random() * 100;
        m.h = 40 + Math.random() * 50;
      }
    });

    // Collision detection
    const dinoX = 60;
    const ducking = dino.ducking && !dino.jumping;
    const dinoLeft = ducking ? dinoX - 15 : dinoX - 8;
    const dinoRight = ducking ? dinoX + 20 : dinoX + 12;
    const dinoTop = ducking ? dino.y - 16 : dino.y - 48;
    const dinoBottom = dino.y;

    for (const obs of obstaclesRef.current) {
      let obsLeft = obs.x;
      let obsRight = obs.x + obs.w;
      let obsTop: number;
      let obsBottom: number;

      if (obs.type === "bird") {
        obsTop = (obs.birdY || GROUND_Y - 50) - 8;
        obsBottom = (obs.birdY || GROUND_Y - 50) + 18;
      } else {
        obsTop = GROUND_Y - obs.h;
        obsBottom = GROUND_Y;
      }

      // AABB collision with some padding
      if (
        dinoRight - 4 > obsLeft + 2 &&
        dinoLeft + 4 < obsRight - 2 &&
        dinoBottom - 2 > obsTop + 2 &&
        dinoTop + 4 < obsBottom - 2
      ) {
        endGame();
        return;
      }
    }

    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [draw, spawnObstacle]);

  const endGame = useCallback(() => {
    setGameState("over");
    playSound("gameOver");
    stopMusic();
    const final = Math.floor(scoreRef.current);
    setScore(final);
    if (final > highScore) {
      setHighScore(final);
      localStorage.setItem("dino-highscore", String(final));
    }
    submitScore({ game: "dino-jump", score: final });
  }, [highScore, playSound, stopMusic, submitScore]);

  const jump = useCallback(() => {
    const dino = dinoRef.current;
    if (!dino.jumping) {
      dino.jumping = true;
      dino.vel = JUMP_FORCE;
      dino.ducking = false;
      playSound("jump");
    }
  }, [playSound]);

  const startGame = useCallback(() => {
    dinoRef.current = { y: GROUND_Y, vel: 0, jumping: false, ducking: false, legFrame: 0 };
    obstaclesRef.current = [];
    scoreRef.current = 0;
    frameRef.current = 0;
    speedRef.current = INITIAL_SPEED * speedMultiplier;
    setScore(0);
    setGameState("playing");
    playSound("start");
    startMusic();
  }, [speedMultiplier, playSound, startMusic]);

  const togglePause = useCallback(() => {
    if (gameState === "playing") {
      setGameState("paused");
      stopMusic();
    } else if (gameState === "paused") {
      setGameState("playing");
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        e.preventDefault();
        if (gameState === "playing" || gameState === "paused") togglePause();
        return;
      }
      if (gameState === "paused") return;
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        if (gameState === "playing") {
          jump();
        } else {
          startGame();
        }
      }
      if (e.key === "ArrowDown" && gameState === "playing") {
        e.preventDefault();
        dinoRef.current.ducking = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        dinoRef.current.ducking = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, jump, startGame, togglePause]);

  // Draw initial state
  useEffect(() => {
    if (gameState === "idle") draw();
  }, [gameState, draw]);

  const handleCanvasClick = () => {
    if (gameState === "playing") {
      jump();
    }
  };

  return (
    <GameLayout title="DINO JUMP" color="indigo">
      <GameTutorial {...tutorials.dino} />
      {/* Score display */}
      <div className="flex items-center gap-3 sm:gap-6 mb-3 sm:mb-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-[10px] sm:text-sm text-muted-foreground">Score</span>
          <span className="font-pixel text-sm sm:text-lg text-arcade-indigo">{String(score).padStart(5, "0")}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-arcade-coral" />
          <span className="text-[10px] sm:text-sm text-muted-foreground">Best</span>
          <span className="font-pixel text-sm sm:text-lg text-arcade-coral">{String(highScore).padStart(5, "0")}</span>
        </div>
      </div>

      {/* Game canvas */}
      <div className="relative rounded-xl border border-arcade-indigo/20 overflow-hidden card-glow-indigo">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="game-canvas block cursor-pointer"
          onClick={handleCanvasClick}
          onTouchStart={(e) => {
            e.preventDefault();
            if (gameState === "playing") jump();
          }}
          style={{ width: `min(calc(100vw - 2rem), 900px)`, height: "auto", aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
        />

        {/* Overlay states */}
        {gameState === "idle" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 sm:gap-4">
            <h2 className="font-pixel text-xl sm:text-2xl text-arcade-indigo text-glow-indigo">DINO JUMP</h2>
            <p className="text-xs sm:text-sm text-white/70 text-center px-4">
              Space / Up to jump · Down to duck · Avoid obstacles!
            </p>
            <Button
              onClick={startGame}
              className="bg-arcade-indigo text-white hover:bg-arcade-indigo/90 font-pixel text-xs sm:text-sm gap-2"
            >
              <Play className="w-4 h-4" /> START
            </Button>
          </div>
        )}

        {gameState === "paused" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 sm:gap-4">
            <h2 className="font-pixel text-xl sm:text-2xl text-arcade-indigo text-glow-indigo">PAUSED</h2>
            <p className="text-xs sm:text-sm text-white/70">Press ESC or P to resume</p>
            <Button
              onClick={togglePause}
              className="bg-arcade-indigo text-white hover:bg-arcade-indigo/90 font-pixel text-xs sm:text-sm gap-2"
            >
              <Play className="w-4 h-4" /> RESUME
            </Button>
          </div>
        )}

        {gameState === "over" && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 sm:gap-4">
            <h2 className="font-pixel text-xl sm:text-2xl text-arcade-coral text-glow-coral">GAME OVER</h2>
            <p className="font-pixel text-base sm:text-lg text-white">Score: {String(score).padStart(5, "0")}</p>
            {score >= highScore && score > 0 && (
              <p className="font-pixel text-xs sm:text-sm text-arcade-mint animate-pulse">NEW HIGH SCORE!</p>
            )}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                onClick={startGame}
                className="bg-arcade-indigo text-white hover:bg-arcade-indigo/90 font-pixel text-xs sm:text-sm gap-2"
              >
                <RotateCcw className="w-4 h-4" /> RETRY
              </Button>
              <ShareScore gameName="Dino Jump" score={score} isHighScore={score >= highScore && score > 0} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile touch controls */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-3 sm:hidden">
        <Button
          variant="outline"
          className="border-arcade-indigo/30 text-arcade-indigo h-14 text-sm font-pixel gap-2"
          onTouchStart={(e) => { e.preventDefault(); if (gameState === "playing") jump(); }}
        >
          <ArrowUp className="w-6 h-6" /> JUMP
        </Button>
        <Button
          variant="outline"
          className="border-arcade-coral/30 text-arcade-coral h-14 text-sm font-pixel gap-2"
          onTouchStart={(e) => { e.preventDefault(); if (gameState === "playing") { dinoRef.current.ducking = true; } }}
          onTouchEnd={(e) => { e.preventDefault(); dinoRef.current.ducking = false; }}
          onTouchCancel={() => { dinoRef.current.ducking = false; }}
        >
          <ArrowDown className="w-6 h-6" /> DUCK
        </Button>
      </div>

      {/* Pause button for mobile */}
      {gameState === "playing" && (
        <Button
          variant="outline"
          className="mt-3 border-arcade-indigo/30 text-arcade-indigo font-pixel text-xs sm:hidden gap-1"
          onClick={togglePause}
        >
          <Pause className="w-4 h-4" /> PAUSE
        </Button>
      )}

      {/* Controls hint */}
      <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground text-center hidden sm:block">
        Space / Up Arrow to jump · Down Arrow to duck · P to pause
      </p>
    </GameLayout>
  );
}
