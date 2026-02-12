import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Crown, Medal, Award, Gamepad2 } from "lucide-react";
import { getTopScores, type ScoreEntry } from "@/lib/gameStore";

const GAMES = [
  { id: "snake", label: "Snake", color: "#4ade80" },
  { id: "flappy-bird", label: "Flappy Bird", color: "#f97316" },
  { id: "dino-jump", label: "Dino Jump", color: "#818cf8" },
  { id: "tetris", label: "Tetris", color: "#f97316" },
  { id: "pong", label: "Pong", color: "#4ade80" },
  { id: "space-invaders", label: "Invaders", color: "#818cf8" },
  { id: "minesweeper", label: "Minesweeper", color: "#4ade80" },
  { id: "breakout", label: "Breakout", color: "#f97316" },
  { id: "2048", label: "2048", color: "#818cf8" },
  { id: "memory-match", label: "Memory", color: "#f97316" },
  { id: "whack-a-mole", label: "Whack", color: "#4ade80" },
] as const;

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return <span className="w-5 h-5 flex items-center justify-center text-xs text-muted-foreground font-mono">{rank}</span>;
}

export default function Leaderboard() {
  const [selectedGame, setSelectedGame] = useState<typeof GAMES[number]["id"]>("snake");

  const scores: ScoreEntry[] = useMemo(() => getTopScores(selectedGame, 20), [selectedGame]);
  const selectedGameInfo = useMemo(() => GAMES.find(g => g.id === selectedGame), [selectedGame]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border/50 backdrop-blur-md bg-background/60 sticky top-0 z-20">
        <div className="container flex items-center justify-between py-3 sm:py-4">
          <Link href="/">
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Back</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-pixel text-sm sm:text-lg text-foreground">LEADERBOARD</span>
          </div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="container py-4 sm:py-8">
        {/* Game Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`
                flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg font-pixel text-xs sm:text-sm transition-all
                ${selectedGame === game.id
                  ? "text-white shadow-lg"
                  : "bg-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                }
              `}
              style={selectedGame === game.id ? { backgroundColor: game.color } : {}}
            >
              {game.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <motion.div
          key={selectedGame}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border/50 overflow-hidden"
        >
          {/* Table Header */}
          <div className="grid grid-cols-[3rem_1fr_auto] sm:grid-cols-[4rem_1fr_auto_auto] gap-2 sm:gap-4 px-4 sm:px-6 py-3 bg-muted/30 border-b border-border/30">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Rank</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase">Player</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase text-right">Score</span>
            <span className="hidden sm:block text-xs font-semibold text-muted-foreground uppercase text-right">Date</span>
          </div>

          {/* Empty state */}
          {scores.length === 0 && (
            <div className="py-16 text-center">
              <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No scores yet. Be the first to play!</p>
              <Link href={`/${selectedGame}`}>
                <span
                  className="inline-block mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ backgroundColor: selectedGameInfo?.color }}
                >
                  Play {selectedGameInfo?.label}
                </span>
              </Link>
            </div>
          )}

          {/* Score rows */}
          {scores.map((entry: ScoreEntry, index: number) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`
                grid grid-cols-[3rem_1fr_auto] sm:grid-cols-[4rem_1fr_auto_auto] gap-2 sm:gap-4 px-4 sm:px-6 py-3 border-b border-border/20
                hover:bg-muted/20
                ${index < 3 ? "bg-muted/10" : ""}
                transition-colors
              `}
            >
              <div className="flex items-center">
                <RankIcon rank={index + 1} />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm truncate text-foreground">You</span>
              </div>
              <div className="flex items-center justify-end">
                <span
                  className="font-mono text-sm font-bold"
                  style={{ color: selectedGameInfo?.color }}
                >
                  {entry.score.toLocaleString()}
                </span>
              </div>
              <div className="hidden sm:flex items-center justify-end">
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
