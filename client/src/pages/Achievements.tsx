import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Lock, Sparkles } from "lucide-react";
import { ACHIEVEMENT_DEFS, type AchievementDef } from "../../../shared/achievements";
import { getUnlockedAchievements } from "@/lib/gameStore";

const GAME_LABELS: Record<string, string> = {
  snake: "Snake",
  "flappy-bird": "Flappy Bird",
  "dino-jump": "Dino Jump",
  tetris: "Tetris",
  pong: "Pong",
  "space-invaders": "Space Invaders",
  minesweeper: "Minesweeper",
  breakout: "Breakout",
  "2048": "2048",
  "memory-match": "Memory Match",
  "whack-a-mole": "Whack-a-Mole",
  global: "Global",
};

const GAME_COLORS: Record<string, string> = {
  snake: "#4ade80",
  "flappy-bird": "#f97316",
  "dino-jump": "#818cf8",
  tetris: "#f97316",
  pong: "#4ade80",
  "space-invaders": "#818cf8",
  minesweeper: "#4ade80",
  breakout: "#f97316",
  "2048": "#818cf8",
  "memory-match": "#f97316",
  "whack-a-mole": "#4ade80",
  global: "#facc15",
};

function AchievementCard({
  def,
  unlocked,
  unlockedAt,
}: {
  def: AchievementDef;
  unlocked: boolean;
  unlockedAt?: number;
}) {
  const color = GAME_COLORS[def.game] || "#888";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        relative rounded-xl border p-4 transition-all
        ${unlocked
          ? "bg-card border-border/50 hover:border-border"
          : "bg-muted/20 border-border/20 opacity-60"
        }
      `}
    >
      {/* Badge icon */}
      <div className="flex items-start gap-3">
        <div
          className={`
            w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0
            ${unlocked ? "" : "grayscale"}
          `}
          style={{ backgroundColor: unlocked ? `${color}20` : undefined }}
        >
          {unlocked ? def.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
        </div>
        <div className="min-w-0">
          <h3 className={`font-semibold text-sm ${unlocked ? "text-foreground" : "text-muted-foreground"}`}>
            {def.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{def.description}</p>
          {unlocked && unlockedAt && (
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" style={{ color }} />
              {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Category badge */}
      <div className="absolute top-2 right-2">
        <span
          className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: unlocked ? `${color}20` : undefined,
            color: unlocked ? color : undefined,
          }}
        >
          {def.category}
        </span>
      </div>
    </motion.div>
  );
}

export default function Achievements() {
  const userAchievements = useMemo(() => getUnlockedAchievements(), []);

  const unlockedSet = useMemo(() => {
    const set = new Map<string, number>();
    for (const a of userAchievements) {
      set.set(a.achievementId, a.unlockedAt);
    }
    return set;
  }, [userAchievements]);

  const unlockedCount = unlockedSet.size;
  const totalCount = ACHIEVEMENT_DEFS.length;
  const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Group by game
  const grouped = useMemo(() => {
    const map = new Map<string, AchievementDef[]>();
    for (const def of ACHIEVEMENT_DEFS) {
      const list = map.get(def.game) || [];
      list.push(def);
      map.set(def.game, list);
    }
    return map;
  }, []);

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
            <span className="font-pixel text-sm sm:text-lg text-foreground">ACHIEVEMENTS</span>
          </div>
          <div className="w-16" />
        </div>
      </nav>

      <div className="container py-4 sm:py-8">
        {/* Progress bar */}
        <div className="mb-6 p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">
              {unlockedCount} / {totalCount} Achievements
            </span>
            <span className="text-sm font-mono text-muted-foreground">{progressPct}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </div>

        {/* Achievement groups */}
        {Array.from(grouped.entries()).map(([game, defs]) => (
          <div key={game} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-1 h-5 rounded-full"
                style={{ backgroundColor: GAME_COLORS[game] }}
              />
              <h2 className="font-pixel text-sm sm:text-base" style={{ color: GAME_COLORS[game] }}>
                {GAME_LABELS[game] || game}
              </h2>
              <span className="text-xs text-muted-foreground ml-auto">
                {defs.filter(d => unlockedSet.has(d.id)).length}/{defs.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {defs.map((def) => (
                <AchievementCard
                  key={def.id}
                  def={def}
                  unlocked={unlockedSet.has(def.id)}
                  unlockedAt={unlockedSet.get(def.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
