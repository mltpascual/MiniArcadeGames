/**
 * Space Invaders Game — Canvas-based Space Invaders clone
 * Color theme: Indigo (#6C63FF)
 * Controls: Arrow Left/Right + Space to shoot, mobile touch buttons
 */
import { useEffect, useRef, useState, useCallback } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Trophy, ChevronLeft, ChevronRight, Crosshair, Pause } from "lucide-react";
import { useScoreSubmit } from "@/hooks/useScoreSubmit";
import { useGameSettings } from "@/contexts/GameSettingsContext";
import { useSoundEngine } from "@/hooks/useSoundEngine";

const CANVAS_W = 480;
const CANVAS_H = 560;
const PLAYER_W = 36;
const PLAYER_H = 24;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 7;
const ALIEN_ROWS = 5;
const ALIEN_COLS = 8;
const ALIEN_W = 28;
const ALIEN_H = 20;
const ALIEN_PAD_X = 12;
const ALIEN_PAD_Y = 10;
const ALIEN_DROP = 20;

interface Bullet { x: number; y: number; }
interface Alien { x: number; y: number; alive: boolean; type: number; }
interface AlienBullet { x: number; y: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; }

const ALIEN_COLORS = ["#FF6B6B", "#FF9800", "#4CAF50", "#9C27B0", "#00BCD4"];

export default function SpaceInvadersGame() {
  const { difficultyParams, speedMultiplier } = useGameSettings();
  const { playSound, startMusic, stopMusic } = useSoundEngine();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "over">("idle");
  const { submitScore } = useScoreSubmit();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wave, setWave] = useState(1);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("invaders-highscore");
    return saved ? parseInt(saved, 10) : 0;
  });

  const playerRef = useRef({ x: CANVAS_W / 2 - PLAYER_W / 2 });
  const bulletsRef = useRef<Bullet[]>([]);
  const aliensRef = useRef<Alien[]>([]);
  const alienBulletsRef = useRef<AlienBullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const alienDirRef = useRef(1);
  const alienSpeedRef = useRef(1);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const waveRef = useRef(1);
  const keysRef = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number | null>(null);
  const frameRef = useRef(0);
  const lastShotRef = useRef(0);
  const starsRef = useRef<{ x: number; y: number; s: number; speed: number }[]>([]);

  const initAliens = useCallback((waveNum: number) => {
    const aliens: Alien[] = [];
    const startX = 30;
    const startY = 50;
    for (let r = 0; r < ALIEN_ROWS; r++) {
      for (let c = 0; c < ALIEN_COLS; c++) {
        aliens.push({
          x: startX + c * (ALIEN_W + ALIEN_PAD_X),
          y: startY + r * (ALIEN_H + ALIEN_PAD_Y),
          alive: true,
          type: r,
        });
      }
    }
    alienDirRef.current = 1;
    alienSpeedRef.current = 1 + (waveNum - 1) * 0.3;
    return aliens;
  }, []);

  useEffect(() => {
    starsRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * CANVAS_W,
      y: Math.random() * CANVAS_H,
      s: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
    }));
  }, []);

  const shoot = useCallback(() => {
    if (frameRef.current - lastShotRef.current < 12) return;
    lastShotRef.current = frameRef.current;
    bulletsRef.current.push({
      x: playerRef.current.x + PLAYER_W / 2,
      y: CANVAS_H - 50,
    });
    playSound("shoot");
  }, [playSound]);

  const addParticles = useCallback((x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 20 + Math.random() * 20,
        color,
      });
    }
  }, []);

  const drawAlien = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, type: number) => {
    const color = ALIEN_COLORS[type];
    ctx.fillStyle = color;

    if (type === 0) {
      // Crab-like
      ctx.fillRect(x + 4, y, 20, 14);
      ctx.fillRect(x, y + 4, 28, 8);
      ctx.fillRect(x + 2, y + 14, 6, 4);
      ctx.fillRect(x + 20, y + 14, 6, 4);
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(x + 8, y + 4, 4, 4);
      ctx.fillRect(x + 16, y + 4, 4, 4);
    } else if (type === 1) {
      // Squid-like
      ctx.fillRect(x + 6, y, 16, 12);
      ctx.fillRect(x + 2, y + 4, 24, 8);
      ctx.fillRect(x, y + 12, 4, 6);
      ctx.fillRect(x + 24, y + 12, 4, 6);
      ctx.fillRect(x + 10, y + 12, 8, 4);
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(x + 10, y + 4, 3, 3);
      ctx.fillRect(x + 16, y + 4, 3, 3);
    } else if (type === 2) {
      // Octopus
      ctx.fillRect(x + 4, y, 20, 16);
      ctx.fillRect(x, y + 6, 28, 6);
      ctx.fillRect(x + 2, y + 16, 4, 4);
      ctx.fillRect(x + 10, y + 16, 8, 4);
      ctx.fillRect(x + 22, y + 16, 4, 4);
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(x + 8, y + 6, 4, 4);
      ctx.fillRect(x + 16, y + 6, 4, 4);
    } else if (type === 3) {
      // Bug
      ctx.fillRect(x + 8, y, 12, 4);
      ctx.fillRect(x + 4, y + 4, 20, 10);
      ctx.fillRect(x, y + 8, 28, 4);
      ctx.fillRect(x + 4, y + 14, 6, 4);
      ctx.fillRect(x + 18, y + 14, 6, 4);
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(x + 8, y + 6, 3, 3);
      ctx.fillRect(x + 17, y + 6, 3, 3);
    } else {
      // UFO
      ctx.fillRect(x + 8, y, 12, 6);
      ctx.fillRect(x + 2, y + 6, 24, 8);
      ctx.fillRect(x, y + 10, 28, 4);
      ctx.fillRect(x + 4, y + 14, 4, 4);
      ctx.fillRect(x + 20, y + 14, 4, 4);
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(x + 8, y + 8, 3, 3);
      ctx.fillRect(x + 17, y + 8, 3, 3);
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Stars
    starsRef.current.forEach((star) => {
      ctx.fillStyle = `rgba(255,255,255,${0.3 + star.s * 0.2})`;
      ctx.fillRect(star.x, star.y, star.s, star.s);
    });

    // Aliens
    aliensRef.current.forEach((alien) => {
      if (alien.alive) {
        drawAlien(ctx, alien.x, alien.y, alien.type);
      }
    });

    // Player bullets
    ctx.fillStyle = "#6C63FF";
    bulletsRef.current.forEach((b) => {
      ctx.fillRect(b.x - 2, b.y, 4, 12);
      ctx.fillStyle = "rgba(108,99,255,0.3)";
      ctx.fillRect(b.x - 4, b.y + 4, 8, 16);
      ctx.fillStyle = "#6C63FF";
    });

    // Alien bullets
    ctx.fillStyle = "#FF6B6B";
    alienBulletsRef.current.forEach((b) => {
      ctx.fillRect(b.x - 2, b.y, 4, 10);
    });

    // Player ship
    const px = playerRef.current.x;
    const py = CANVAS_H - 45;
    ctx.fillStyle = "#6C63FF";
    // Ship body
    ctx.fillRect(px + 4, py + 8, PLAYER_W - 8, PLAYER_H - 8);
    ctx.fillRect(px, py + 14, PLAYER_W, 10);
    // Cockpit
    ctx.fillRect(px + PLAYER_W / 2 - 3, py, 6, 10);
    ctx.fillStyle = "#8B83FF";
    ctx.fillRect(px + PLAYER_W / 2 - 2, py + 2, 4, 6);
    // Wings
    ctx.fillStyle = "#6C63FF";
    ctx.fillRect(px - 4, py + 16, 6, 6);
    ctx.fillRect(px + PLAYER_W - 2, py + 16, 6, 6);
    // Engine glow
    ctx.fillStyle = "#FF6B6B";
    ctx.fillRect(px + 8, py + PLAYER_H - 2, 4, 4 + Math.random() * 3);
    ctx.fillRect(px + PLAYER_W - 12, py + PLAYER_H - 2, 4, 4 + Math.random() * 3);

    // Particles
    particlesRef.current.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / 40;
      ctx.fillRect(p.x, p.y, 3, 3);
    });
    ctx.globalAlpha = 1;

    // Lives
    for (let i = 0; i < livesRef.current; i++) {
      ctx.fillStyle = "#FF6B6B";
      ctx.fillRect(10 + i * 20, CANVAS_H - 18, 12, 8);
      ctx.fillRect(14 + i * 20, CANVAS_H - 22, 4, 4);
    }

    // Wave indicator
    ctx.fillStyle = "#6C63FF";
    ctx.font = '10px "Silkscreen", monospace';
    ctx.textAlign = "right";
    ctx.fillText(`WAVE ${waveRef.current}`, CANVAS_W - 10, CANVAS_H - 12);
  }, [drawAlien]);

  const gameLoop = useCallback(() => {
    frameRef.current++;

    // Player movement
    if (keysRef.current.has("ArrowLeft") || keysRef.current.has("a") || keysRef.current.has("A")) {
      playerRef.current.x = Math.max(-4, playerRef.current.x - PLAYER_SPEED);
    }
    if (keysRef.current.has("ArrowRight") || keysRef.current.has("d") || keysRef.current.has("D")) {
      playerRef.current.x = Math.min(CANVAS_W - PLAYER_W + 4, playerRef.current.x + PLAYER_SPEED);
    }
    if (keysRef.current.has(" ")) {
      shoot();
    }

    // Move bullets
    bulletsRef.current = bulletsRef.current.filter((b) => {
      b.y -= BULLET_SPEED;
      return b.y > -10;
    });

    // Move alien bullets
    alienBulletsRef.current = alienBulletsRef.current.filter((b) => {
      b.y += 4;
      return b.y < CANVAS_H + 10;
    });

    // Move aliens
    const aliens = aliensRef.current;
    let shouldDrop = false;
    const aliveAliens = aliens.filter((a) => a.alive);

    if (aliveAliens.length > 0) {
      // Check bounds
      const rightMost = Math.max(...aliveAliens.map((a) => a.x + ALIEN_W));
      const leftMost = Math.min(...aliveAliens.map((a) => a.x));

      if (rightMost >= CANVAS_W - 10 && alienDirRef.current > 0) {
        shouldDrop = true;
        alienDirRef.current = -1;
      }
      if (leftMost <= 10 && alienDirRef.current < 0) {
        shouldDrop = true;
        alienDirRef.current = 1;
      }

      aliens.forEach((alien) => {
        if (alien.alive) {
          if (shouldDrop) {
            alien.y += ALIEN_DROP;
          }
          alien.x += alienDirRef.current * alienSpeedRef.current;
        }
      });

      // Alien shooting
      if (frameRef.current % Math.max(20, 60 - waveRef.current * 5) === 0) {
        const shooters = aliveAliens.filter(() => Math.random() < 0.3);
        if (shooters.length > 0) {
          const shooter = shooters[Math.floor(Math.random() * shooters.length)];
          alienBulletsRef.current.push({
            x: shooter.x + ALIEN_W / 2,
            y: shooter.y + ALIEN_H,
          });
        }
      }
    }

    // Bullet-alien collision
    bulletsRef.current = bulletsRef.current.filter((bullet) => {
      for (const alien of aliens) {
        if (
          alien.alive &&
          bullet.x >= alien.x &&
          bullet.x <= alien.x + ALIEN_W &&
          bullet.y >= alien.y &&
          bullet.y <= alien.y + ALIEN_H
        ) {
          alien.alive = false;
          const points = (ALIEN_ROWS - alien.type) * 10 * waveRef.current;
          scoreRef.current += points;
          setScore(scoreRef.current);
          addParticles(alien.x + ALIEN_W / 2, alien.y + ALIEN_H / 2, ALIEN_COLORS[alien.type], 8);
          playSound("hit");

          // Speed up remaining aliens
          const remaining = aliens.filter((a) => a.alive).length;
          alienSpeedRef.current = (1 + (waveRef.current - 1) * 0.3) * (1 + (ALIEN_ROWS * ALIEN_COLS - remaining) * 0.02);

          return false;
        }
      }
      return true;
    });

    // Alien bullet-player collision
    const px = playerRef.current.x;
    const py = CANVAS_H - 45;
    alienBulletsRef.current = alienBulletsRef.current.filter((b) => {
      if (
        b.x >= px && b.x <= px + PLAYER_W &&
        b.y >= py && b.y <= py + PLAYER_H
      ) {
        livesRef.current--;
        setLives(livesRef.current);
        addParticles(px + PLAYER_W / 2, py + PLAYER_H / 2, "#6C63FF", 12);

        playSound("hit");
        if (livesRef.current <= 0) {
          setGameState("over");
          playSound("gameOver");
          stopMusic();
          const final = scoreRef.current;
          if (final > highScore) {
            setHighScore(final);
            localStorage.setItem("invaders-highscore", String(final));
          }
          submitScore({ game: "space-invaders", score: final, wave: waveRef.current });
        }
        return false;
      }
      return true;
    });

    // Alien reaches player
    for (const alien of aliveAliens) {
      if (alien.y + ALIEN_H >= py) {
        setGameState("over");
        playSound("gameOver");
        stopMusic();
        const final = scoreRef.current;
        if (final > highScore) {
          setHighScore(final);
          localStorage.setItem("invaders-highscore", String(final));
        }
        submitScore({ game: "space-invaders", score: final, wave: waveRef.current });
        break;
      }
    }

    // Wave cleared
    if (aliveAliens.length === 0 && gameState === "playing") {
      waveRef.current++;
      setWave(waveRef.current);
      aliensRef.current = initAliens(waveRef.current);
      alienBulletsRef.current = [];
      playSound("levelUp");
    }

    // Update particles
    particlesRef.current = particlesRef.current.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      return p.life > 0;
    });

    // Update stars
    starsRef.current.forEach((star) => {
      star.y += star.speed;
      if (star.y > CANVAS_H) {
        star.y = 0;
        star.x = Math.random() * CANVAS_W;
      }
    });

    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [draw, shoot, addParticles, initAliens, highScore, gameState]);

  const startGame = useCallback(() => {
    playerRef.current = { x: CANVAS_W / 2 - PLAYER_W / 2 };
    bulletsRef.current = [];
    alienBulletsRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    livesRef.current = 3;
    waveRef.current = 1;
    frameRef.current = 0;
    lastShotRef.current = 0;
    aliensRef.current = initAliens(1);
    setScore(0);
    setLives(3);
    setWave(1);
    setGameState("playing");
    playSound("start");
    startMusic();
  }, [initAliens, playSound, startMusic]);

  const togglePause = useCallback(() => {
    if (gameState === "playing") {
      setGameState("paused");
      stopMusic();
    } else if (gameState === "paused") {
      setGameState("playing");
      startMusic();
    }
  }, [gameState, stopMusic, startMusic]);

  useEffect(() => {
    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        e.preventDefault();
        if (gameState === "playing" || gameState === "paused") togglePause();
        return;
      }
      if (gameState === "paused") return;
      if (gameState !== "playing") {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); startGame(); }
        return;
      }
      keysRef.current.add(e.key);
      if (["ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, startGame, togglePause]);

  useEffect(() => {
    if (gameState === "idle") draw();
  }, [gameState, draw]);

  // Mobile touch hold for movement
  const moveIntervalRef = useRef<number | null>(null);

  const startMoveLeft = useCallback(() => {
    if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    moveIntervalRef.current = window.setInterval(() => {
      playerRef.current.x = Math.max(-4, playerRef.current.x - PLAYER_SPEED);
    }, 16);
  }, []);

  const startMoveRight = useCallback(() => {
    if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
    moveIntervalRef.current = window.setInterval(() => {
      playerRef.current.x = Math.min(CANVAS_W - PLAYER_W + 4, playerRef.current.x + PLAYER_SPEED);
    }, 16);
  }, []);

  const stopMove = useCallback(() => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
  }, []);

  const shootIntervalRef = useRef<number | null>(null);

  const startShooting = useCallback(() => {
    shoot();
    if (shootIntervalRef.current) clearInterval(shootIntervalRef.current);
    shootIntervalRef.current = window.setInterval(() => {
      shoot();
    }, 200);
  }, [shoot]);

  const stopShooting = useCallback(() => {
    if (shootIntervalRef.current) {
      clearInterval(shootIntervalRef.current);
      shootIntervalRef.current = null;
    }
  }, []);

  return (
    <GameLayout title="SPACE INVADERS" color="indigo">
      <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
        {/* Score bar */}
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-sm text-muted-foreground">Score</span>
            <span className="font-pixel text-sm sm:text-lg text-arcade-indigo">{score}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-sm text-muted-foreground">Wave</span>
            <span className="font-pixel text-sm sm:text-lg text-arcade-mint">{wave}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-arcade-coral" />
            <span className="font-pixel text-sm sm:text-lg text-arcade-coral">{highScore}</span>
          </div>
        </div>

        {/* Game canvas */}
        <div className="relative rounded-xl border border-arcade-indigo/20 overflow-hidden card-glow-indigo">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="game-canvas block"
            style={{ width: `min(${CANVAS_W}px, calc(100vw - 2rem))`, height: "auto", aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
          />

          {gameState === "idle" && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 sm:gap-4">
              <h2 className="font-pixel text-lg sm:text-2xl text-arcade-indigo text-glow-indigo">SPACE INVADERS</h2>
              <p className="text-xs sm:text-sm text-white/70 text-center px-4">
                Defend Earth from alien waves!
              </p>
              <Button onClick={startGame} className="bg-arcade-indigo text-white hover:bg-arcade-indigo/90 font-pixel text-xs sm:text-sm gap-2">
                <Play className="w-4 h-4" /> START
              </Button>
            </div>
          )}

          {gameState === "paused" && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 sm:gap-4">
              <h2 className="font-pixel text-xl sm:text-2xl text-arcade-indigo text-glow-indigo">PAUSED</h2>
              <p className="text-xs sm:text-sm text-white/70">Press ESC or P to resume</p>
              <Button onClick={togglePause} className="bg-arcade-indigo text-white hover:bg-arcade-indigo/90 font-pixel text-xs sm:text-sm gap-2">
                <Play className="w-4 h-4" /> RESUME
              </Button>
            </div>
          )}

          {gameState === "over" && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 sm:gap-4">
              <h2 className="font-pixel text-xl sm:text-2xl text-arcade-coral text-glow-coral">GAME OVER</h2>
              <p className="font-pixel text-base sm:text-lg text-white">Score: {score}</p>
              <p className="font-pixel text-xs sm:text-sm text-arcade-mint">Wave {wave}</p>
              {score >= highScore && score > 0 && (
                <p className="font-pixel text-xs sm:text-sm text-arcade-mint animate-pulse">NEW HIGH SCORE!</p>
              )}
              <Button onClick={startGame} className="bg-arcade-indigo text-white hover:bg-arcade-indigo/90 font-pixel text-xs sm:text-sm gap-2">
                <RotateCcw className="w-4 h-4" /> RETRY
              </Button>
            </div>
          )}
        </div>

        {/* Mobile touch controls */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mt-1 sm:hidden">
          <Button
            variant="outline"
            className="border-arcade-indigo/30 text-arcade-indigo h-14 text-lg"
            onTouchStart={(e) => { e.preventDefault(); startMoveLeft(); }}
            onTouchEnd={(e) => { e.preventDefault(); stopMove(); }}
            onTouchCancel={() => stopMove()}
          >
            <ChevronLeft className="w-7 h-7" />
          </Button>
          <Button
            variant="outline"
            className="border-arcade-coral/30 text-arcade-coral h-14 text-lg"
            onTouchStart={(e) => { e.preventDefault(); startShooting(); }}
            onTouchEnd={(e) => { e.preventDefault(); stopShooting(); }}
            onTouchCancel={() => stopShooting()}
          >
            <Crosshair className="w-7 h-7" />
          </Button>
          <Button
            variant="outline"
            className="border-arcade-indigo/30 text-arcade-indigo h-14 text-lg"
            onTouchStart={(e) => { e.preventDefault(); startMoveRight(); }}
            onTouchEnd={(e) => { e.preventDefault(); stopMove(); }}
            onTouchCancel={() => stopMove()}
          >
            <ChevronRight className="w-7 h-7" />
          </Button>
        </div>

        {/* Pause button for mobile */}
        {gameState === "playing" && (
          <Button
            variant="outline"
            className="mt-1 border-arcade-indigo/30 text-arcade-indigo font-pixel text-xs sm:hidden gap-1"
            onClick={togglePause}
          >
            <Pause className="w-4 h-4" /> PAUSE
          </Button>
        )}

        <p className="text-[10px] sm:text-xs text-muted-foreground text-center hidden sm:block">
          ← → Move · Space Shoot · P Pause · Survive the alien waves!
        </p>
      </div>
    </GameLayout>
  );
}
