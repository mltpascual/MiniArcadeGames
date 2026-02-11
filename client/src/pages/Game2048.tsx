import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Pause } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { useSoundEngine } from "@/hooks/useSoundEngine";
import { useScoreSubmit } from "@/hooks/useScoreSubmit";

const ACCENT_COLOR = "#7C5CFC";
const GAME_ID = "2048";

export default function Game2048() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { playSound, startMusic, stopMusic } = useSoundEngine();
    const { submitScore } = useScoreSubmit();
    const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "over">("idle");
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [grid, setGrid] = useState<number[][]>([]);
    const gameLoopRef = useRef<number>(0);
    const touchStartRef = useRef<{ x: number, y: number } | null>(null);

    useEffect(() => {
        const savedHighScore = localStorage.getItem(`pixel-play-${GAME_ID}-highscore`);
        if (savedHighScore) {
            setHighScore(parseInt(savedHighScore, 10));
        }
    }, []);

    const startGame = () => {
        setScore(0);
        initGrid();
        setGameState("playing");
    };

    const togglePause = () => {
        setGameState(prevState => (prevState === "playing" ? "paused" : "playing"));
    };

    const initGrid = useCallback(() => {
        const newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
        addRandomTile(newGrid);
        addRandomTile(newGrid);
        setGrid(newGrid);
    }, []);

    const addRandomTile = (currentGrid: number[][]) => {
        const emptyCells: { r: number; c: number }[] = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (currentGrid[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }
        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            currentGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
        return currentGrid;
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (gameState !== 'playing') return;
        let moved = false;
        switch (e.key) {
            case 'ArrowUp': moved = move('up'); break;
            case 'ArrowDown': moved = move('down'); break;
            case 'ArrowLeft': moved = move('left'); break;
            case 'ArrowRight': moved = move('right'); break;
            case 'p': case 'P': togglePause(); break;
            case 'Escape': togglePause(); break;
        }

        if (moved) {
            const newGrid = addRandomTile(grid.map(row => [...row]));
            setGrid(newGrid);
            if (isGameOver(newGrid)) {
                setGameState('over');
            }
        }
    }, [grid, gameState]);

    const move = (direction: 'up' | 'down' | 'left' | 'right'): boolean => {
        let moved = false;
        let newScore = score;
        const newGrid = grid.map(row => [...row]);

        const processRow = (row: number[]) => {
            const filtered = row.filter(v => v !== 0);
            const newRow = [];
            let scoreToAdd = 0;
            for (let i = 0; i < filtered.length; i++) {
                if (i + 1 < filtered.length && filtered[i] === filtered[i+1]) {
                    const mergedValue = filtered[i] * 2;
                    newRow.push(mergedValue);
                    scoreToAdd += mergedValue;
                    i++;
                } else {
                    newRow.push(filtered[i]);
                }
            }
            while (newRow.length < 4) newRow.push(0);
            return { processedRow: newRow, score: scoreToAdd };
        };

        if (direction === 'left' || direction === 'right') {
            for (let r = 0; r < 4; r++) {
                const row = newGrid[r];
                const originalRow = [...row];
                const tempRow = direction === 'left' ? row : [...row].reverse();
                const { processedRow, score: scoreToAdd } = processRow(tempRow);
                const finalRow = direction === 'left' ? processedRow : processedRow.reverse();
                newGrid[r] = finalRow;
                newScore += scoreToAdd;
                if (!moved && JSON.stringify(originalRow) !== JSON.stringify(finalRow)) {
                    moved = true;
                }
            }
        } else { // up or down
            for (let c = 0; c < 4; c++) {
                const col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
                const originalCol = [...col];
                const tempCol = direction === 'up' ? col : [...col].reverse();
                const { processedRow, score: scoreToAdd } = processRow(tempCol);
                const finalCol = direction === 'up' ? processedRow : processedRow.reverse();
                newScore += scoreToAdd;
                for (let r = 0; r < 4; r++) {
                    newGrid[r][c] = finalCol[r];
                }
                if (!moved && JSON.stringify(originalCol) !== JSON.stringify(finalCol)) {
                    moved = true;
                }
            }
        }

        if (moved) {
            setGrid(newGrid);
            setScore(newScore);
            if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem(`pixel-play-${GAME_ID}-highscore`, newScore.toString());
            }
        }

        return moved;
    };

    const isGameOver = (currentGrid: number[][]) => {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (currentGrid[r][c] === 0) return false; // empty cell
                if (c < 3 && currentGrid[r][c] === currentGrid[r][c + 1]) return false; // can merge right
                if (r < 3 && currentGrid[r][c] === currentGrid[r + 1][c]) return false; // can merge down
            }
        }
        return true;
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const TILE_COLORS: { [key: number]: string } = {
        2: "#eee4da",
        4: "#ede0c8",
        8: "#f2b179",
        16: "#f59563",
        32: "#f67c5f",
        64: "#f65e3b",
        128: "#edcf72",
        256: "#edcc61",
        512: "#edc850",
        1024: "#edc53f",
        2048: "#edc22e",
    };

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = Math.min(canvas.width, 700);
        const TILE_SIZE = size / 4 * 0.85;
        const TILE_GAP = size / 4 * 0.15;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const x = c * (TILE_SIZE + TILE_GAP) + TILE_GAP;
                const y = r * (TILE_SIZE + TILE_GAP) + TILE_GAP;
                const value = grid[r] ? grid[r][c] : 0;

                // Draw background tile
                ctx.fillStyle = "#cdc1b4";
                ctx.beginPath();
                ctx.roundRect(x, y, TILE_SIZE, TILE_SIZE, [10]);
                ctx.fill();

                if (value > 0) {
                    ctx.fillStyle = TILE_COLORS[value] || "#3c3a32";
                    ctx.beginPath();
                    ctx.roundRect(x, y, TILE_SIZE, TILE_SIZE, [10]);
                    ctx.fill();

                    ctx.fillStyle = value < 8 ? "#776e65" : "#f9f6f2";
                    ctx.font = `bold ${TILE_SIZE / 2.5}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(value.toString(), x + TILE_SIZE / 2, y + TILE_SIZE / 2);
                }
            }
        }
    }, [grid]);

    useEffect(() => {
        if (gameState === 'playing') {
            const gameLoop = () => {
                draw();
                gameLoopRef.current = requestAnimationFrame(gameLoop);
            };
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        } else {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
            draw(); // Draw final state
        }

        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameState, draw]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const handleResize = () => {
            const size = Math.min(window.innerWidth * 0.9, 700);
            canvas.width = size;
            canvas.height = size;
            draw();
        };
        handleResize();
        window.addEventListener('resize', handleResize);
                const canvasEl = canvas;
        const handleTouchStart = (e: TouchEvent) => {
            e.preventDefault();
            if (gameState !== 'playing') return;
            const touch = e.touches[0];
            touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        };

        const handleTouchEnd = (e: TouchEvent) => {
            e.preventDefault();
            if (gameState !== 'playing' || !touchStartRef.current) return;

            const touch = e.changedTouches[0];
            const dx = touch.clientX - touchStartRef.current.x;
            const dy = touch.clientY - touchStartRef.current.y;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            let moved = false;
            if (Math.max(absDx, absDy) > 30) { // Swipe threshold
                if (absDx > absDy) {
                    moved = move(dx > 0 ? 'right' : 'left');
                } else {
                    moved = move(dy > 0 ? 'down' : 'up');
                }
            }

            if (moved) {
                const newGrid = addRandomTile(grid.map(row => [...row]));
                setGrid(newGrid);
                if (isGameOver(newGrid)) {
                    setGameState('over');
                }
            }

            touchStartRef.current = null;
        };

        canvasEl.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvasEl.addEventListener('touchend', handleTouchEnd, { passive: false });

        return () => {
            window.removeEventListener('resize', handleResize);
            canvasEl.removeEventListener('touchstart', handleTouchStart);
            canvasEl.removeEventListener('touchend', handleTouchEnd);
        };
    }, [draw]);    return (
        <GameLayout title="2048" color="indigo">
        <div className="flex flex-col items-center justify-center font-pixel">    <h1 className="font-pixel text-lg sm:text-xl mb-4" style={{color: ACCENT_COLOR}}>2048</h1>
            <div className="flex items-center gap-4 mb-2 text-white text-sm">
                <span>Score: {score}</span>
                <span>Best: {highScore}</span>
                {gameState === "playing" && (
                    <button onClick={togglePause} className="ml-2 p-1 rounded bg-white/10 hover:bg-white/20">
                        <Pause className="w-4 h-4 text-white" />
                    </button>
                )}
            </div>
            <div className="relative w-full max-w-[700px] aspect-square">
                <canvas ref={canvasRef} className="rounded-lg bg-[#34344a] w-full h-full" />
                {gameState === "idle" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                        <button onClick={startGame} className="text-white font-bold py-2 px-4 rounded bg-green-500 hover:bg-green-600">
                            <Play className="w-8 h-8"/>
                        </button>
                    </div>
                )}
                {gameState === "paused" && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                        <h2 className="font-pixel text-2xl text-white mb-4">Paused</h2>
                        <button onClick={togglePause} className="text-white font-bold py-2 px-4 rounded bg-yellow-500 hover:bg-yellow-600">
                            <Play className="w-8 h-8"/>
                        </button>
                    </div>
                )}
                {gameState === "over" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                        <h2 className="font-pixel text-2xl text-white mb-4">Game Over</h2>
                        <button onClick={startGame} className="text-white font-bold py-2 px-4 rounded bg-red-500 hover:bg-red-600">
                            <RotateCcw className="w-8 h-8"/>
                        </button>
                    </div>
                )}
            </div>
            {/* Mobile Controls */}
            <div className="sm:hidden flex justify-center items-center gap-2 mt-4">
                 <button onClick={() => move('up')} className="w-16 h-16 bg-white/10 rounded-lg text-white flex items-center justify-center">↑</button>
                 <button onClick={() => move('down')} className="w-16 h-16 bg-white/10 rounded-lg text-white flex items-center justify-center">↓</button>
                 <button onClick={() => move('left')} className="w-16 h-16 bg-white/10 rounded-lg text-white flex items-center justify-center">←</button>
                 <button onClick={() => move('right')} className="w-16 h-16 bg-white/10 rounded-lg text-white flex items-center justify-center">→</button>
            </div>
        </div>
        </GameLayout>
    );
}
