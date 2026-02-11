import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Pause, Flag, Bomb } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { useSoundEngine } from "@/hooks/useSoundEngine";
import { useScoreSubmit } from "@/hooks/useScoreSubmit";

const ACCENT_COLOR = "#4ECDC4";
const GAME_ID = "minesweeper";

const difficulties = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 12, cols: 12, mines: 25 },
  hard: { rows: 16, cols: 16, mines: 40 },
};

type Difficulty = keyof typeof difficulties;

type Cell = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
};

type GameState = "idle" | "playing" | "paused" | "over" | "won";

const MinesweeperGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { playSound, startMusic, stopMusic } = useSoundEngine();
  const { submitScore } = useScoreSubmit();
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [mineCount, setMineCount] = useState(difficulties[difficulty].mines);
  const [flagCount, setFlagCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const gameLoopRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef(0);

  const { rows, cols, mines } = difficulties[difficulty];

  useEffect(() => {
    const savedHighScore = localStorage.getItem(`pixel-play-${GAME_ID}-highscore`);
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  const updateHighScore = useCallback((newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem(`pixel-play-${GAME_ID}-highscore`, newScore.toString());
    }
  }, [highScore]);

  const createGrid = useCallback((r: number, c: number, m: number, firstClick: { row: number, col: number }): Cell[][] => {
    const newGrid: Cell[][] = Array.from({ length: r }, () =>
      Array.from({ length: c }, () => ({ isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0 }))
    );

    let minesPlaced = 0;
    while (minesPlaced < m) {
      const row = Math.floor(Math.random() * r);
      const col = Math.floor(Math.random() * c);
      if (!newGrid[row][col].isMine && !(row === firstClick.row && col === firstClick.col)) {
        newGrid[row][col].isMine = true;
        minesPlaced++;
      }
    }

    for (let row = 0; row < r; row++) {
      for (let col = 0; col < c; col++) {
        if (newGrid[row][col].isMine) continue;
        let count = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < r && newCol >= 0 && newCol < c && newGrid[newRow][newCol].isMine) {
              count++;
            }
          }
        }
        newGrid[row][col].adjacentMines = count;
      }
    }
    return newGrid;
  }, []);

  const startGame = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    const { rows, cols, mines } = difficulties[diff];
    const emptyGrid = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({ isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0 }))
    );
    setGrid(emptyGrid);
    setGameState("playing");
    setScore(0);
    setFlagCount(0);
    setTimer(0);
    setMineCount(mines);
  }, []);

  const revealCell = useCallback((row: number, col: number, currentGrid: Cell[][]): Cell[][] => {
    let newGrid = JSON.parse(JSON.stringify(currentGrid));
    const cell = newGrid[row]?.[col];

    if (!cell || cell.isRevealed || cell.isFlagged) {
      return currentGrid;
    }

    cell.isRevealed = true;

    if (cell.isMine) {
      setGameState("over");
      updateHighScore(score);
      return newGrid;
    }

    setScore(s => s + 10);

    if (cell.adjacentMines === 0) {
        const stack = [[row, col]];
        while(stack.length > 0) {
            const [r, c] = stack.pop()!;
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    const newRow = r + i;
                    const newCol = c + j;
                    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                        const neighbor = newGrid[newRow][newCol];
                        if (!neighbor.isRevealed && !neighbor.isFlagged) {
                            neighbor.isRevealed = true;
                            setScore(s => s + 10);
                            if (neighbor.adjacentMines === 0) {
                                stack.push([newRow, newCol]);
                            }
                        }
                    }
                }
            }
        }
    }
    
    return newGrid;

  }, [rows, cols, score, updateHighScore]);

  const checkWinCondition = useCallback((currentGrid: Cell[][]) => {
    const nonMineCells = rows * cols - mines;
    const revealedCells = currentGrid.flat().filter(c => c.isRevealed && !c.isMine).length;
    if (revealedCells === nonMineCells) {
      setGameState("won");
      const timeBonus = Math.max(0, 1000 - timer * 10);
      const finalScore = score + timeBonus;
      setScore(finalScore);
      updateHighScore(finalScore);
      setFlagCount(mines);
    }
  }, [rows, cols, mines, timer, score, updateHighScore]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (
      'touches' in event) {
        event.preventDefault();
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const cellSize = canvas.width / cols;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row < 0 || row >= rows || col < 0 || col >= cols) return;

    let currentGrid = grid;
    if (grid.flat().every(c => !c.isRevealed)) {
        currentGrid = createGrid(rows, cols, mines, { row, col });
    }

    if ('button' in event && event.button === 2) {
      event.preventDefault();
      setGrid(g => {
        const newGrid = [...g.map(r => [...r])];
        const cell = newGrid[row][col];
        if (!cell.isRevealed) {
          cell.isFlagged = !cell.isFlagged;
          setFlagCount(fc => fc + (cell.isFlagged ? 1 : -1));
        }
        return newGrid;
      });
    } else {
      const newGrid = revealCell(row, col, currentGrid);
      setGrid(newGrid);
      if(gameState === 'playing') checkWinCondition(newGrid);
    }
  }, [gameState, grid, rows, cols, mines, createGrid, revealCell, checkWinCondition]);

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapTimeRef.current < DOUBLE_TAP_DELAY) {
        lastTapTimeRef.current = 0;
        handleCanvasDoubleClick(event);
    } else {
        lastTapTimeRef.current = now;
        handleCanvasClick(event);
    }
  };

  const handleCanvasDoubleClick = (event: React.TouchEvent<HTMLCanvasElement>) => {
      if (gameState !== "playing") return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (event.touches[0].clientX - rect.left) * scaleX;
      const y = (event.touches[0].clientY - rect.top) * scaleY;
      const cellSize = canvas.width / cols;
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);

      if (row < 0 || row >= rows || col < 0 || col >= cols) return;

      setGrid(g => {
        const newGrid = [...g.map(r => [...r])];
        const cell = newGrid[row][col];
        if (!cell.isRevealed) {
          cell.isFlagged = !cell.isFlagged;
          setFlagCount(fc => fc + (cell.isFlagged ? 1 : -1));
        }
        return newGrid;
      });
  }

  const togglePause = useCallback(() => {
    setGameState(prev => (prev === "playing" ? "paused" : "playing"));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key.toLowerCase() === "p") {
        togglePause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePause]);

  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const draw = () => {
        const { width, height } = canvas;
        context.clearRect(0, 0, width, height);
        context.fillStyle = "#1a1a2e";
        context.fillRect(0, 0, width, height);

        if (!grid || grid.length === 0) return;

        const cellSize = width / cols;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = grid[row][col];
                const x = col * cellSize;
                const y = row * cellSize;

                context.strokeStyle = "#333";
                context.strokeRect(x, y, cellSize, cellSize);

                if ((cell.isRevealed && gameState !== 'over') || (gameState === 'over' && cell.isMine) || (gameState === 'won' && cell.isMine)) {
                    if (cell.isMine) {
                        context.fillStyle = gameState === 'over' ? "red" : "#2a2a4a";
                        context.fillRect(x, y, cellSize, cellSize);
                        context.fillStyle = "white";
                        context.textAlign = "center";
                        context.textBaseline = "middle";
                        context.font = `${cellSize * 0.6}px sans-serif`;
                        context.fillText(gameState === 'won' ? "🚩" : "💣", x + cellSize / 2, y + cellSize / 2 + 2);
                    } else {
                        context.fillStyle = "#4a4a6a";
                        context.fillRect(x, y, cellSize, cellSize);
                        if (cell.adjacentMines > 0) {
                            context.fillStyle = ACCENT_COLOR;
                            context.textAlign = "center";
                            context.textBaseline = "middle";
                            context.font = `bold ${cellSize * 0.6}px sans-serif`;
                            context.fillText(cell.adjacentMines.toString(), x + cellSize / 2, y + cellSize / 2);
                        }
                    }
                } else if (cell.isFlagged) {
                    context.fillStyle = "#2a2a4a";
                    context.fillRect(x, y, cellSize, cellSize);
                    context.fillStyle = "white";
                    context.textAlign = "center";
                    context.textBaseline = "middle";
                    context.font = `${cellSize * 0.6}px sans-serif`;
                    context.fillText("🚩", x + cellSize / 2, y + cellSize / 2 + 2);
                } else {
                    context.fillStyle = "#2a2a4a";
                    context.fillRect(x, y, cellSize, cellSize);
                }
            }
        }
    };

    const gameLoop = () => {
      draw();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [grid, gameState, rows, cols]);

  const renderOverlay = () => {
    const overlayClasses = "absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white font-pixel z-10";
    switch (gameState) {
      case "idle":
        return (
          <div className={overlayClasses}>
            <h2 className="text-3xl mb-4" style={{color: ACCENT_COLOR}}>MINESWEEPER</h2>
            <div className="flex gap-4 mb-4">
                <Button onClick={() => startGame('easy')} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Easy</Button>
                <Button onClick={() => startGame('medium')} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded">Medium</Button>
                <Button onClick={() => startGame('hard')} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">Hard</Button>
            </div>
          </div>
        );
      case "paused":
        return (
          <div className={overlayClasses}>
            <h2 className="text-3xl mb-4">PAUSED</h2>
            <Button onClick={togglePause}><Play className="w-8 h-8" /></Button>
          </div>
        );
      case "over":
        return (
          <div className={overlayClasses}>
            <h2 className="text-3xl mb-4 text-red-500">GAME OVER</h2>
            <p className="text-xl mb-4">Score: {score}</p>
            <Button onClick={() => setGameState("idle")}><RotateCcw className="w-8 h-8" /></Button>
          </div>
        );
      case "won":
        return (
          <div className={overlayClasses}>
            <h2 className="text-3xl mb-4 text-green-400">YOU WIN!</h2>
            <p className="text-xl mb-4">Final Score: {score}</p>
            <Button onClick={() => setGameState("idle")}><RotateCcw className="w-8 h-8" /></Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <GameLayout title="Minesweeper" color="mint">
    <div className="flex flex-col items-center justify-center touch-none" onContextMenu={(e) => e.preventDefault()}>

      <div className="flex items-center gap-4 mb-2 text-white text-sm font-pixel">
        <span><Bomb className="w-4 h-4 inline-block mr-1" />{mineCount - flagCount}</span>
        <span>Score: {score}</span>
        <span>Best: {highScore}</span>
        <span>Time: {timer}s</span>
        {gameState === "playing" && (
          <button onClick={togglePause} className="ml-2 p-1 rounded bg-white/10 hover:bg-white/20">
            <Pause className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
      <div className="relative w-full max-w-[700px] aspect-square">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-full h-full bg-[#1a1a2e]"
          onClick={handleCanvasClick}
          onContextMenu={(e) => {e.preventDefault(); handleCanvasClick(e);}}
          onTouchStart={handleTouchStart}
        />
        {renderOverlay()}
      </div>
       <div className="mt-4 text-white/50 text-xs font-pixel text-center">
            <p>Left Click/Tap: Reveal</p>
            <p>Right Click/Double Tap: Flag</p>
        </div>
    </div>
    </GameLayout>
  );
};

export default MinesweeperGame;
