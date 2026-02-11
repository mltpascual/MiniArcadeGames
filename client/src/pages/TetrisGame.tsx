/**
 * Tetris Game — Canvas-based Tetris clone
 * Color theme: Coral (#FF6B6B)
 * Controls: Arrow keys + mobile touch buttons
 */
import { useEffect, useRef, useState, useCallback } from "react";
import GameLayout from "@/components/GameLayout";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Trophy, RotateCw, ChevronDown, ChevronLeft, ChevronRight, ChevronsDown, Pause } from "lucide-react";
import { useScoreSubmit } from "@/hooks/useScoreSubmit";
import { useGameSettings } from "@/contexts/GameSettingsContext";
import { useSoundEngine } from "@/hooks/useSoundEngine";
import GameTutorial from "@/components/GameTutorial";
import { tutorials } from "@/data/tutorialData";

const COLS = 10;
const ROWS = 20;
const CELL = 28;
const CANVAS_W = COLS * CELL;
const CANVAS_H = ROWS * CELL;

const SHAPES = [
  { shape: [[1,1,1,1]], color: "#00BCD4" },           // I - cyan
  { shape: [[1,1],[1,1]], color: "#FFD93D" },          // O - yellow
  { shape: [[0,1,0],[1,1,1]], color: "#9C27B0" },      // T - purple
  { shape: [[1,0,0],[1,1,1]], color: "#FF6B6B" },      // L - coral
  { shape: [[0,0,1],[1,1,1]], color: "#FF9800" },      // J - orange
  { shape: [[0,1,1],[1,1,0]], color: "#4CAF50" },      // S - green
  { shape: [[1,1,0],[0,1,1]], color: "#F44336" },      // Z - red
];

type Piece = {
  shape: number[][];
  color: string;
  x: number;
  y: number;
};

function randomPiece(): Piece {
  const t = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return {
    shape: t.shape.map(r => [...r]),
    color: t.color,
    x: Math.floor(COLS / 2) - Math.floor(t.shape[0].length / 2),
    y: 0,
  };
}

function rotate(shape: number[][]): number[][] {
  const rows = shape.length;
  const cols = shape[0].length;
  const result: number[][] = [];
  for (let c = 0; c < cols; c++) {
    result.push([]);
    for (let r = rows - 1; r >= 0; r--) {
      result[c].push(shape[r][c]);
    }
  }
  return result;
}

export default function TetrisGame() {
  const { speedMultiplier } = useGameSettings();
  const { playSound, startMusic, stopMusic } = useSoundEngine();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "over">("idle");
  const { submitScore } = useScoreSubmit();
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("tetris-highscore");
    return saved ? parseInt(saved, 10) : 0;
  });

  const boardRef = useRef<(string | null)[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );
  const pieceRef = useRef<Piece>(randomPiece());
  const nextPieceRef = useRef<Piece>(randomPiece());
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);
  const gameLoopRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const lockDelayRef = useRef(0);

  const getSpeed = useCallback(() => {
    return Math.max(100, 800 - (levelRef.current - 1) * 70);
  }, []);

  const collides = useCallback((piece: Piece, board: (string | null)[][]) => {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const nx = piece.x + c;
          const ny = piece.y + r;
          if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
          if (ny >= 0 && board[ny][nx]) return true;
        }
      }
    }
    return false;
  }, []);

  const lockPiece = useCallback(() => {
    const piece = pieceRef.current;
    const board = boardRef.current;

    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const ny = piece.y + r;
          const nx = piece.x + c;
          if (ny < 0) {
            setGameState("over");
            playSound("gameOver");
            stopMusic();
            const final = scoreRef.current;
            if (final > highScore) {
              setHighScore(final);
              localStorage.setItem("tetris-highscore", String(final));
            }
            submitScore({ game: "tetris", score: final, lines: linesRef.current });
            return;
          }
          board[ny][nx] = piece.color;
        }
      }
    }

    // Clear lines
    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(cell => cell !== null)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(null));
        cleared++;
        r++;
      }
    }

    if (cleared > 0) {
      const points = [0, 100, 300, 500, 800][cleared] * levelRef.current;
      scoreRef.current += points;
      linesRef.current += cleared;
      const newLevel = Math.floor(linesRef.current / 10) + 1;
      if (newLevel > levelRef.current) playSound("levelUp");
      levelRef.current = newLevel;
      setScore(scoreRef.current);
      setLines(linesRef.current);
      setLevel(levelRef.current);
      playSound("lineClear");
    }

    pieceRef.current = nextPieceRef.current;
    nextPieceRef.current = randomPiece();

    if (collides(pieceRef.current, board)) {
      setGameState("over");
      playSound("gameOver");
      stopMusic();
      const final = scoreRef.current;
      if (final > highScore) {
        setHighScore(final);
        localStorage.setItem("tetris-highscore", String(final));
      }
      submitScore({ game: "tetris", score: final, lines: linesRef.current });
    }
  }, [collides, highScore, playSound, stopMusic, submitScore]);

  const moveLeft = useCallback(() => {
    const piece = pieceRef.current;
    piece.x--;
    if (collides(piece, boardRef.current)) piece.x++;
    else playSound("move");
  }, [collides, playSound]);

  const moveRight = useCallback(() => {
    const piece = pieceRef.current;
    piece.x++;
    if (collides(piece, boardRef.current)) piece.x--;
    else playSound("move");
  }, [collides, playSound]);

  const moveDown = useCallback((): boolean => {
    const piece = pieceRef.current;
    piece.y++;
    if (collides(piece, boardRef.current)) {
      piece.y--;
      lockPiece();
      return false;
    }
    return true;
  }, [collides, lockPiece]);

  const hardDrop = useCallback(() => {
    const piece = pieceRef.current;
    let dropped = 0;
    while (!collides({ ...piece, y: piece.y + 1 }, boardRef.current)) {
      piece.y++;
      dropped++;
    }
    scoreRef.current += dropped * 2;
    setScore(scoreRef.current);
    playSound("hit");
    lockPiece();
  }, [collides, lockPiece, playSound]);

  const rotatePiece = useCallback(() => {
    const piece = pieceRef.current;
    const oldShape = piece.shape;
    piece.shape = rotate(piece.shape);
    // Wall kick
    if (collides(piece, boardRef.current)) {
      piece.x--;
      if (collides(piece, boardRef.current)) {
        piece.x += 2;
        if (collides(piece, boardRef.current)) {
          piece.x--;
          piece.shape = oldShape;
          return;
        }
      }
    }
    playSound("rotate");
  }, [collides, playSound]);

  const getGhostY = useCallback(() => {
    const piece = pieceRef.current;
    let ghostY = piece.y;
    while (!collides({ ...piece, y: ghostY + 1 }, boardRef.current)) {
      ghostY++;
    }
    return ghostY;
  }, [collides]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid
    ctx.strokeStyle = "#222240";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, CANVAS_H);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(CANVAS_W, y * CELL);
      ctx.stroke();
    }

    // Board
    const board = boardRef.current;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c]) {
          ctx.fillStyle = board[r][c]!;
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
          ctx.fillStyle = "rgba(255,255,255,0.15)";
          ctx.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, 3);
        }
      }
    }

    // Ghost piece
    const piece = pieceRef.current;
    const ghostY = getGhostY();
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const gx = (piece.x + c) * CELL;
          const gy = (ghostY + r) * CELL;
          ctx.strokeStyle = piece.color;
          ctx.globalAlpha = 0.3;
          ctx.strokeRect(gx + 2, gy + 2, CELL - 4, CELL - 4);
          ctx.globalAlpha = 1;
        }
      }
    }

    // Current piece
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          const px = (piece.x + c) * CELL;
          const py = (piece.y + r) * CELL;
          ctx.fillStyle = piece.color;
          ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.fillRect(px + 1, py + 1, CELL - 2, 3);
        }
      }
    }

    // Draw next piece preview
    const nextCanvas = nextCanvasRef.current;
    if (nextCanvas) {
      const nctx = nextCanvas.getContext("2d");
      if (nctx) {
        nctx.fillStyle = "#1a1a2e";
        nctx.fillRect(0, 0, 120, 120);
        nctx.strokeStyle = "#222240";
        nctx.strokeRect(0, 0, 120, 120);

        const next = nextPieceRef.current;
        const previewCell = 22;
        const offsetX = (120 - next.shape[0].length * previewCell) / 2;
        const offsetY = (120 - next.shape.length * previewCell) / 2;
        for (let r = 0; r < next.shape.length; r++) {
          for (let c = 0; c < next.shape[r].length; c++) {
            if (next.shape[r][c]) {
              nctx.fillStyle = next.color;
              nctx.fillRect(offsetX + c * previewCell + 1, offsetY + r * previewCell + 1, previewCell - 2, previewCell - 2);
            }
          }
        }
      }
    }
  }, [getGhostY]);

  const gameLoop = useCallback((timestamp: number) => {
    if (lastTickRef.current === 0) lastTickRef.current = timestamp;
    const elapsed = timestamp - lastTickRef.current;

    if (elapsed >= getSpeed()) {
      lastTickRef.current = timestamp;
      moveDown();
    }

    draw();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [draw, getSpeed, moveDown]);

  const startGame = useCallback(() => {
    boardRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    pieceRef.current = randomPiece();
    nextPieceRef.current = randomPiece();
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 1;
    lastTickRef.current = 0;
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameState("playing");
    playSound("start");
    startMusic();
  }, [playSound, startMusic]);

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

  useEffect(() => {
    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
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
      switch (e.key) {
        case "ArrowLeft": case "a": case "A": e.preventDefault(); moveLeft(); break;
        case "ArrowRight": case "d": case "D": e.preventDefault(); moveRight(); break;
        case "ArrowDown": case "s": case "S": e.preventDefault(); moveDown(); break;
        case "ArrowUp": case "w": case "W": e.preventDefault(); rotatePiece(); break;
        case " ": e.preventDefault(); hardDrop(); break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, startGame, moveLeft, moveRight, moveDown, rotatePiece, hardDrop, togglePause]);

  useEffect(() => {
    if (gameState === "idle") draw();
  }, [gameState, draw]);

  return (
    <GameLayout title="TETRIS" color="coral">
      <GameTutorial {...tutorials.tetris} />
      <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-lg">
        {/* Score bar */}
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-sm text-muted-foreground">Score</span>
            <span className="font-pixel text-sm sm:text-lg text-arcade-coral">{score}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-sm text-muted-foreground">Lines</span>
            <span className="font-pixel text-sm sm:text-lg text-arcade-mint">{lines}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-sm text-muted-foreground">Lvl</span>
            <span className="font-pixel text-sm sm:text-lg text-arcade-indigo">{level}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-arcade-coral" />
            <span className="font-pixel text-sm sm:text-lg text-arcade-coral">{highScore}</span>
          </div>
        </div>

        {/* Game area with next preview */}
        <div className="flex gap-3 sm:gap-4 items-start">
          <div className="relative rounded-xl border border-arcade-coral/20 overflow-hidden card-glow-coral">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="game-canvas block"
              style={{ width: `min(calc((100vh - 14rem) * ${CANVAS_W} / ${CANVAS_H}), calc(100vw - 10rem), 400px)`, height: "auto", aspectRatio: `${CANVAS_W}/${CANVAS_H}` }}
            />

            {gameState === "idle" && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 sm:gap-4">
                <h2 className="font-pixel text-xl sm:text-2xl text-arcade-coral text-glow-coral">TETRIS</h2>
                <p className="text-xs sm:text-sm text-white/70 text-center px-4">
                  Stack blocks, clear lines!
                </p>
                <Button onClick={startGame} className="bg-arcade-coral text-white hover:bg-arcade-coral/90 font-pixel text-xs sm:text-sm gap-2">
                  <Play className="w-4 h-4" /> START
                </Button>
              </div>
            )}

            {gameState === "paused" && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 sm:gap-4">
                <h2 className="font-pixel text-xl sm:text-2xl text-arcade-coral text-glow-coral">PAUSED</h2>
                <p className="text-xs sm:text-sm text-white/70">Press ESC or P to resume</p>
                <Button onClick={togglePause} className="bg-arcade-coral text-white hover:bg-arcade-coral/90 font-pixel text-xs sm:text-sm gap-2">
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
                <Button onClick={startGame} className="bg-arcade-coral text-white hover:bg-arcade-coral/90 font-pixel text-xs sm:text-sm gap-2">
                  <RotateCcw className="w-4 h-4" /> RETRY
                </Button>
              </div>
            )}
          </div>

          {/* Next piece preview */}
          <div className="flex flex-col gap-2">
            <span className="font-pixel text-[10px] sm:text-xs text-muted-foreground text-center">NEXT</span>
            <canvas
              ref={nextCanvasRef}
              width={120}
              height={120}
              className="rounded-lg border border-arcade-coral/20"
              style={{ width: "60px", height: "60px" }}
            />
          </div>
        </div>

        {/* Mobile touch controls */}
        <div className="grid grid-cols-5 gap-2 w-full max-w-xs mt-2 sm:hidden">
          <Button
            variant="outline"
            size="icon"
            className="border-arcade-coral/30 text-arcade-coral h-12 w-full"
            onTouchStart={(e) => { e.preventDefault(); if (gameState === "playing") moveLeft(); }}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-arcade-coral/30 text-arcade-coral h-12 w-full"
            onTouchStart={(e) => { e.preventDefault(); if (gameState === "playing") moveDown(); }}
          >
            <ChevronDown className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-arcade-coral/30 text-arcade-coral h-12 w-full"
            onTouchStart={(e) => { e.preventDefault(); if (gameState === "playing") moveRight(); }}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-arcade-indigo/30 text-arcade-indigo h-12 w-full"
            onTouchStart={(e) => { e.preventDefault(); if (gameState === "playing") rotatePiece(); }}
          >
            <RotateCw className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-arcade-mint/30 text-arcade-mint h-12 w-full"
            onTouchStart={(e) => { e.preventDefault(); if (gameState === "playing") hardDrop(); }}
          >
            <ChevronsDown className="w-6 h-6" />
          </Button>
        </div>

        {/* Pause button for mobile */}
        {gameState === "playing" && (
          <Button
            variant="outline"
            className="mt-1 border-arcade-coral/30 text-arcade-coral font-pixel text-xs sm:hidden gap-1"
            onClick={togglePause}
          >
            <Pause className="w-4 h-4" /> PAUSE
          </Button>
        )}

        <p className="text-[10px] sm:text-xs text-muted-foreground text-center hidden sm:block">
          ← → Move · ↑ Rotate · ↓ Soft Drop · Space Hard Drop · P Pause
        </p>
      </div>
    </GameLayout>
  );
}
