
// GAME: Memory Match
// FILE: MemoryMatchGame.tsx
// COLOR: #FF6B6B (coral)
// GAME_ID: memory-match

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Pause } from "lucide-react";
import GameLayout from "@/components/GameLayout";
import { useSoundEngine } from "@/hooks/useSoundEngine";
import { useScoreSubmit } from "@/hooks/useScoreSubmit";
import GameTutorial from "@/components/GameTutorial";
import { tutorials } from "@/data/tutorialData";

const ACCENT_COLOR = "#FF6B6B";
const BACKGROUND_COLOR = "#1a1a2e";
const GAME_ID = "memory-match";
const HIGH_SCORE_KEY = `pixel-play-${GAME_ID}-highscore`;

const EMOJIS = ["ð", "ð", "ð", "ð", "ð", "ð", "ð¥", "ð¥"];

const GRID_SIZE = 4;
const CARD_COUNT = GRID_SIZE * GRID_SIZE;
const PAIRS_COUNT = CARD_COUNT / 2;

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  flipProgress: number; // 0 (face-down) to 1 (face-up)
  isFlipping: boolean;
}

export default function MemoryMatchGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { playSound, startMusic, stopMusic } = useSoundEngine();
  const { submitScore } = useScoreSubmit();
  const [gameState, setGameState] = useState<"idle" | "playing" | "paused" | "over">("idle");
  const [score, setScore] = useState(1000);
  const [highScore, setHighScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [pairsFound, setPairsFound] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: Math.min(700, window.innerWidth - 20), height: Math.min(700, window.innerWidth - 20) });

  const gameLoopRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const flippedCardsRef = useRef<Card[]>([]);
  const isCheckingRef = useRef(false);
  const canvasSizeRef = useRef(canvasSize);
  canvasSizeRef.current = canvasSize;

  useEffect(() => {
    const storedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
  }, []);

  const shuffleAndDeal = useCallback((size?: { width: number; height: number }) => {
    const s = size || canvasSizeRef.current;
    const symbols = [...EMOJIS, ...EMOJIS];
    symbols.sort(() => Math.random() - 0.5);

    const cardWidth = s.width / GRID_SIZE;
    const cardHeight = s.height / GRID_SIZE;

    const newCards = symbols.map((emoji, index) => {
      const row = Math.floor(index / GRID_SIZE);
      const col = index % GRID_SIZE;
      return {
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
        x: col * cardWidth,
        y: row * cardHeight,
        width: cardWidth,
        height: cardHeight,
        flipProgress: 0,
        isFlipping: false,
      };
    });
    setCards(newCards);
  }, []);

  const startGame = () => {
    shuffleAndDeal();
    setScore(1000);
    setMoves(0);
    setPairsFound(0);
    flippedCardsRef.current = [];
    isCheckingRef.current = false;
    setGameState("playing");
  };

  const togglePause = useCallback(() => {
    setGameState(prev => (prev === "playing" ? "paused" : "playing"));
  }, []);

  const drawCard = (ctx: CanvasRenderingContext2D, card: Card) => {
    const cardPadding = 5;
    const cornerRadius = 10;
    const cardInnerWidth = card.width - cardPadding * 2;
    const cardInnerHeight = card.height - cardPadding * 2;

    ctx.save();
    ctx.translate(card.x + card.width / 2, card.y + card.height / 2);

    const scaleX = Math.cos(card.flipProgress * Math.PI);
    ctx.scale(scaleX, 1);

    ctx.beginPath();
    ctx.moveTo(-cardInnerWidth / 2 + cornerRadius, -cardInnerHeight / 2);
    ctx.arcTo(cardInnerWidth / 2, -cardInnerHeight / 2, cardInnerWidth / 2, cardInnerHeight / 2, cornerRadius);
    ctx.arcTo(cardInnerWidth / 2, cardInnerHeight / 2, -cardInnerWidth / 2, cardInnerHeight / 2, cornerRadius);
    ctx.arcTo(-cardInnerWidth / 2, cardInnerHeight / 2, -cardInnerWidth / 2, -cardInnerHeight / 2, cornerRadius);
    ctx.arcTo(-cardInnerWidth / 2, -cardInnerHeight / 2, cardInnerWidth / 2, -cardInnerHeight / 2, cornerRadius);
    ctx.closePath();

    if (card.flipProgress > 0.5) { // Face-up
      ctx.fillStyle = card.isMatched ? "#4a4e69" : "#f2e9e4";
      ctx.fill();
      ctx.save();
      ctx.scale(-1, 1); // Flip text back
      ctx.font = `${card.width * 0.5}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000";
      ctx.fillText(card.emoji, 0, 2);
      ctx.restore();
    } else { // Face-down
      ctx.fillStyle = ACCENT_COLOR;
      ctx.fill();
    }
    ctx.restore();
  };

  const gameLoop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let changed = false;
    cards.forEach(card => {
      if (card.isFlipping) {
        changed = true;
        const targetProgress = card.isFlipped ? 1 : 0;
        if (Math.abs(card.flipProgress - targetProgress) > 0.02) {
          card.flipProgress += (targetProgress - card.flipProgress) * 15 * deltaTime;
        } else {
          card.flipProgress = targetProgress;
          card.isFlipping = false;
        }
      }
      drawCard(ctx, card);
    });

    if (changed) {
      setCards([...cards]);
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [cards, drawCard]);

  useEffect(() => {
    if (gameState === "playing") {
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

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== "playing" || isCheckingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const clickedCard = cards.find(card =>
      x >= card.x && x <= card.x + card.width &&
      y >= card.y && y <= card.y + card.height
    );

    if (clickedCard && !clickedCard.isFlipped && !clickedCard.isMatched && flippedCardsRef.current.length < 2) {
      clickedCard.isFlipped = true;
      clickedCard.isFlipping = true;
      flippedCardsRef.current.push(clickedCard);
      setCards([...cards]);

      if (flippedCardsRef.current.length === 2) {
        setMoves(m => m + 1);
        setScore(s => Math.max(0, s - 10));
        isCheckingRef.current = true;
        const [firstCard, secondCard] = flippedCardsRef.current;

        if (firstCard.emoji === secondCard.emoji) {
          firstCard.isMatched = true;
          secondCard.isMatched = true;
          const newPairsFound = pairsFound + 1;
          setPairsFound(newPairsFound);
          flippedCardsRef.current = [];
          isCheckingRef.current = false;

          if (newPairsFound === PAIRS_COUNT) {
            const finalScore = score - 10; // Adjust for current move
            if (finalScore > highScore) {
              setHighScore(finalScore);
              localStorage.setItem(HIGH_SCORE_KEY, finalScore.toString());
            }
            setGameState("over");
          }
        } else {
          setTimeout(() => {
            firstCard.isFlipped = false;
            secondCard.isFlipped = false;
            firstCard.isFlipping = true;
            secondCard.isFlipping = true;
            flippedCardsRef.current = [];
            isCheckingRef.current = false;
            setCards([...cards]);
          }, 1000);
        }
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const size = Math.min(700, screenWidth - 20);
      const newSize = { width: size, height: size };
      setCanvasSize(newSize);
      if (gameState === "idle") {
        shuffleAndDeal(newSize);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key.toLowerCase() === "p") {
        if (gameState === "playing" || gameState === "paused") {
          togglePause();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, togglePause]);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (gameState !== "playing" || isCheckingRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;

      // This is a simplified version of handleCanvasClick for touch
      const clickedCard = cards.find(card =>
        x >= card.x && x <= card.x + card.width &&
        y >= card.y && y <= card.y + card.height
      );
      if (clickedCard) {
          const mockEvent = { clientX: touch.clientX, clientY: touch.clientY } as React.MouseEvent<HTMLCanvasElement>;
          handleCanvasClick(mockEvent);
      }
  }

  return (
    <GameLayout title="Memory Match" color="coral">
    <GameTutorial {...tutorials["memory-match"]} />
    <div className="flex flex-col items-center justify-center font-sans">
      <div className="flex items-center gap-4 mb-2 text-white text-sm">
        <span>Score: {score}</span>
        <span>Best: {highScore}</span>
        <span>Moves: {moves}</span>
        {gameState === "playing" && (
          <button onClick={togglePause} className="ml-2 p-1 rounded bg-white/10 hover:bg-white/20">
            <Pause className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
      <div className="relative" style={{ width: canvasSize.width, height: canvasSize.height }}>
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={handleCanvasClick}
          onTouchStart={handleTouchStart}
          className="bg-black/20 rounded-lg"
        />
        {gameState !== "playing" && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg text-white">
            {gameState === "idle" && (
              <>
                <h2 className="text-3xl font-bold mb-4">Memory Match</h2>
                <p className="mb-6 text-center px-4">Find all the matching pairs!</p>
                <Button onClick={startGame} style={{ backgroundColor: ACCENT_COLOR }} className="text-white">
                  <Play className="mr-2 h-4 w-4" /> Start Game
                </Button>
              </>
            )}
            {gameState === "paused" && (
              <>
                <h2 className="text-3xl font-bold mb-6">Paused</h2>
                <Button onClick={togglePause} style={{ backgroundColor: ACCENT_COLOR }} className="text-white">
                  <Play className="mr-2 h-4 w-4" /> Resume
                </Button>
              </>
            )}
            {gameState === "over" && (
              <>
                <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                <p className="text-lg mb-4">Final Score: {score}</p>
                <Button onClick={startGame} style={{ backgroundColor: ACCENT_COLOR }} className="text-white">
                  <RotateCcw className="mr-2 h-4 w-4" /> Play Again
                </Button>
              </>
            )}
          </div>
        )}
      </div>
       <div className="sm:hidden h-16"></div>
    </div>
    </GameLayout>
  );
}
