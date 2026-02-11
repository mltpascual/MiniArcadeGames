/**
 * Pong Game — Canvas-based Pong vs AI
 * Color theme: Mint (#4ECDC4)
 * Controls: Arrow Up/Down, W/S, or touch drag on mobile
 */
import { useEffect, useRef, useState, useCallback } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Trophy } from "lucide-react";

const CANVAS_W = 600;
const CANVAS_H = 400;
const PADDLE_W = 12;
const PADDLE_H = 80;
const BALL_R = 8;
const PADDLE_SPEED = 6;
const BALL_SPEED_INIT = 5;
const AI_SPEED = 4;
const WIN_SCORE = 7;

const COLORS = {
  bg: "#1a1a2e",
  line: "#2a2a4e",
  paddle: "#4ECDC4",
  paddleAI: "#FF6B6B",
  ball: "#ffffff",
  ballGlow: "rgba(255,255,255,0.2)",
  text: "#ffffff",
  scoreMint: "#4ECDC4",
  scoreCoral: "#FF6B6B",
};

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">("idle");
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);
  const [wins, setWins] = useState(() => {
    const saved = localStorage.getItem("pong-wins");
    return saved ? parseInt(saved, 10) : 0;
  });

  const playerRef = useRef({ y: CANVAS_H / 2 - PADDLE_H / 2 });
  const aiRef = useRef({ y: CANVAS_H / 2 - PADDLE_H / 2 });
  const ballRef = useRef({ x: CANVAS_W / 2, y: CANVAS_H / 2, vx: BALL_SPEED_INIT, vy: 2 });
  const keysRef = useRef<Set<string>>(new Set());
  const pScoreRef = useRef(0);
  const aScoreRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const touchYRef = useRef<number | null>(null);

  const resetBall = useCallback((direction: number) => {
    ballRef.current = {
      x: CANVAS_W / 2,
      y: CANVAS_H / 2,
      vx: BALL_SPEED_INIT * direction,
      vy: (Math.random() - 0.5) * 4,
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Center line
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = COLORS.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CANVAS_W / 2, 0);
    ctx.lineTo(CANVAS_W / 2, CANVAS_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Center circle
    ctx.strokeStyle = COLORS.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(CANVAS_W / 2, CANVAS_H / 2, 40, 0, Math.PI * 2);
    ctx.stroke();

    // Scores
    ctx.font = '48px "Silkscreen", monospace';
    ctx.textAlign = "center";
    ctx.fillStyle = COLORS.scoreMint;
    ctx.globalAlpha = 0.3;
    ctx.fillText(String(pScoreRef.current), CANVAS_W / 4, 60);
    ctx.fillStyle = COLORS.scoreCoral;
    ctx.fillText(String(aScoreRef.current), (CANVAS_W / 4) * 3, 60);
    ctx.globalAlpha = 1;

    // Player paddle
    ctx.fillStyle = COLORS.paddle;
    ctx.shadowColor = COLORS.paddle;
    ctx.shadowBlur = 10;
    ctx.fillRect(20, playerRef.current.y, PADDLE_W, PADDLE_H);
    ctx.shadowBlur = 0;

    // AI paddle
    ctx.fillStyle = COLORS.paddleAI;
    ctx.shadowColor = COLORS.paddleAI;
    ctx.shadowBlur = 10;
    ctx.fillRect(CANVAS_W - 20 - PADDLE_W, aiRef.current.y, PADDLE_W, PADDLE_H);
    ctx.shadowBlur = 0;

    // Ball glow
    const ball = ballRef.current;
    ctx.fillStyle = COLORS.ballGlow;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Ball
    ctx.fillStyle = COLORS.ball;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();

    // Ball trail
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(ball.x - ball.vx * i * 2, ball.y - ball.vy * i * 2, BALL_R - i, 0, Math.PI * 2);
      ctx.fill();
    }

    // Labels
    ctx.font = '10px "Silkscreen", monospace';
    ctx.fillStyle = COLORS.scoreMint;
    ctx.globalAlpha = 0.5;
    ctx.textAlign = "center";
    ctx.fillText("YOU", CANVAS_W / 4, CANVAS_H - 15);
    ctx.fillStyle = COLORS.scoreCoral;
    ctx.fillText("CPU", (CANVAS_W / 4) * 3, CANVAS_H - 15);
    ctx.globalAlpha = 1;
  }, []);

  const gameLoop = useCallback(() => {
    const ball = ballRef.current;
    const player = playerRef.current;
    const ai = aiRef.current;

    // Player input
    if (keysRef.current.has("ArrowUp") || keysRef.current.has("w") || keysRef.current.has("W")) {
      player.y = Math.max(0, player.y - PADDLE_SPEED);
    }
    if (keysRef.current.has("ArrowDown") || keysRef.current.has("s") || keysRef.current.has("S")) {
      player.y = Math.min(CANVAS_H - PADDLE_H, player.y + PADDLE_SPEED);
    }

    // AI movement
    const aiCenter = ai.y + PADDLE_H / 2;
    const diff = ball.y - aiCenter;
    if (Math.abs(diff) > 10) {
      ai.y += Math.sign(diff) * Math.min(AI_SPEED, Math.abs(diff));
    }
    ai.y = Math.max(0, Math.min(CANVAS_H - PADDLE_H, ai.y));

    // Ball movement
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top/bottom bounce
    if (ball.y - BALL_R <= 0 || ball.y + BALL_R >= CANVAS_H) {
      ball.vy *= -1;
      ball.y = Math.max(BALL_R, Math.min(CANVAS_H - BALL_R, ball.y));
    }

    // Player paddle collision
    if (
      ball.x - BALL_R <= 20 + PADDLE_W &&
      ball.x + BALL_R >= 20 &&
      ball.y >= player.y &&
      ball.y <= player.y + PADDLE_H &&
      ball.vx < 0
    ) {
      const hitPos = (ball.y - player.y) / PADDLE_H - 0.5;
      ball.vx = Math.abs(ball.vx) * 1.05;
      ball.vy = hitPos * 8;
      ball.x = 20 + PADDLE_W + BALL_R;
    }

    // AI paddle collision
    if (
      ball.x + BALL_R >= CANVAS_W - 20 - PADDLE_W &&
      ball.x - BALL_R <= CANVAS_W - 20 &&
      ball.y >= ai.y &&
      ball.y <= ai.y + PADDLE_H &&
      ball.vx > 0
    ) {
      const hitPos = (ball.y - ai.y) / PADDLE_H - 0.5;
      ball.vx = -Math.abs(ball.vx) * 1.05;
      ball.vy = hitPos * 8;
      ball.x = CANVAS_W - 20 - PADDLE_W - BALL_R;
    }

    // Scoring
    if (ball.x < -BALL_R) {
      aScoreRef.current++;
      setAiScore(aScoreRef.current);
      if (aScoreRef.current >= WIN_SCORE) {
        setWinner("ai");
        setGameState("over");
        return;
      }
      resetBall(1);
    }
    if (ball.x > CANVAS_W + BALL_R) {
      pScoreRef.current++;
      setPlayerScore(pScoreRef.current);
      if (pScoreRef.current >= WIN_SCORE) {
        setWinner("player");
        const newWins = wins + 1;
        setWins(newWins);
        localStorage.setItem("pong-wins", String(newWins));
        setGameState("over");
        return;
      }
      resetBall(-1);
    }

    // Speed cap
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (speed > 12) {
      ball.vx = (ball.vx / speed) * 12;
      ball.vy = (ball.vy / speed) * 12;
    }

    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [draw, resetBall, wins]);

  const startGame = useCallback(() => {
    playerRef.current = { y: CANVAS_H / 2 - PADDLE_H / 2 };
    aiRef.current = { y: CANVAS_H / 2 - PADDLE_H / 2 };
    pScoreRef.current = 0;
    aScoreRef.current = 0;
    setPlayerScore(0);
    setAiScore(0);
    setWinner(null);
    resetBall(Math.random() > 0.5 ? 1 : -1);
    setGameState("playing");
  }, [resetBall]);

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
      if (gameState !== "playing") {
        if (e.key === " " || e.key === "Enter") { e.preventDefault(); startGame(); }
        return;
      }
      keysRef.current.add(e.key);
      if (["ArrowUp", "ArrowDown", " "].includes(e.key)) e.preventDefault();
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
  }, [gameState, startGame]);

  // Touch controls — drag to move paddle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCanvasY = (clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return ((clientY - rect.top) / rect.height) * CANVAS_H;
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const y = getCanvasY(e.touches[0].clientY);
      touchYRef.current = y;
      playerRef.current.y = Math.max(0, Math.min(CANVAS_H - PADDLE_H, y - PADDLE_H / 2));
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = getCanvasY(e.touches[0].clientY);
      playerRef.current.y = Math.max(0, Math.min(CANVAS_H - PADDLE_H, y - PADDLE_H / 2));
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  useEffect(() => {
    if (gameState === "idle") draw();
  }, [gameState, draw]);

  return (
    <GameLayout title="PONG" color="mint">
      <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
        {/* Score bar */}
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-sm sm:text-xl text-arcade-mint">{playerScore}</span>
            <span className="text-[10px] sm:text-sm text-muted-foreground">YOU</span>
          </div>
          <span className="text-muted-foreground text-xs">vs</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-sm text-muted-foreground">CPU</span>
            <span className="font-pixel text-sm sm:text-xl text-arcade-coral">{aiScore}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4">
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-arcade-mint" />
            <span className="font-pixel text-xs sm:text-sm text-arcade-mint">{wins}W</span>
          </div>
        </div>

        {/* Game canvas */}
        <div className="relative rounded-xl border border-arcade-mint/20 overflow-hidden card-glow-mint">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="game-canvas block"
            style={{ width: `min(${CANVAS_W}px, calc(100vw - 2rem))`, height: "auto", aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
          />

          {gameState === "idle" && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 sm:gap-4">
              <h2 className="font-pixel text-xl sm:text-2xl text-arcade-mint text-glow-mint">PONG</h2>
              <p className="text-xs sm:text-sm text-white/70 text-center px-4">
                First to {WIN_SCORE} wins! Drag or use arrow keys.
              </p>
              <Button onClick={startGame} className="bg-arcade-mint text-arcade-darker hover:bg-arcade-mint/90 font-pixel text-xs sm:text-sm gap-2">
                <Play className="w-4 h-4" /> START
              </Button>
            </div>
          )}

          {gameState === "over" && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 sm:gap-4">
              <h2 className={`font-pixel text-xl sm:text-2xl ${winner === "player" ? "text-arcade-mint text-glow-mint" : "text-arcade-coral text-glow-coral"}`}>
                {winner === "player" ? "YOU WIN!" : "CPU WINS"}
              </h2>
              <p className="font-pixel text-base sm:text-lg text-white">{playerScore} - {aiScore}</p>
              <Button onClick={startGame} className="bg-arcade-mint text-arcade-darker hover:bg-arcade-mint/90 font-pixel text-xs sm:text-sm gap-2">
                <RotateCcw className="w-4 h-4" /> REMATCH
              </Button>
            </div>
          )}
        </div>

        <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
          ↑↓ or W/S to move paddle · Touch and drag on mobile · First to {WIN_SCORE} wins
        </p>
      </div>
    </GameLayout>
  );
}
