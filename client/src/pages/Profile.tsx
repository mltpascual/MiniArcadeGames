/**
 * Profile Page — Player stats dashboard, game history, and unlocked achievements
 * Design: Neo-retro arcade theme with stat cards, game history table, and achievement badges
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Gamepad2,
  Trophy,
  Award,
  Target,
  Clock,
  Star,
  Zap,
  TrendingUp,
  Calendar,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { ACHIEVEMENT_DEFS, getAchievementDef } from "../../../shared/achievements";

const GAME_LABELS: Record<string, { name: string; color: string; path: string }> = {
  snake: { name: "Snake", color: "text-arcade-mint", path: "/snake" },
  "flappy-bird": { name: "Flappy Bird", color: "text-arcade-coral", path: "/flappy-bird" },
  "dino-jump": { name: "Dino Jump", color: "text-arcade-indigo", path: "/dino-jump" },
  tetris: { name: "Tetris", color: "text-arcade-coral", path: "/tetris" },
  pong: { name: "Pong", color: "text-arcade-mint", path: "/pong" },
  "space-invaders": { name: "Space Invaders", color: "text-arcade-indigo", path: "/space-invaders" },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelativeTime(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export default function Profile() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const profileQuery = trpc.profile.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Not logged in state
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="border-b border-border/50 backdrop-blur-md bg-background/60 sticky top-0 z-50">
          <div className="container flex items-center justify-between py-3">
            <Link href="/">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </div>
            </Link>
            <h1 className="font-pixel text-sm text-arcade-indigo">PROFILE</h1>
            <div className="w-16" />
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 rounded-2xl bg-arcade-indigo/10 border border-arcade-indigo/30 flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-arcade-indigo" />
            </div>
            <h2 className="font-pixel text-xl text-foreground mb-3">LOGIN TO VIEW PROFILE</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Sign in to track your scores, earn achievements, and compete on the leaderboard.
            </p>
            <a
              href={getLoginUrl()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-arcade-indigo text-white font-semibold text-sm hover:bg-arcade-indigo/80 transition-colors"
            >
              <User className="w-4 h-4" />
              Sign In
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading || profileQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="border-b border-border/50 backdrop-blur-md bg-background/60 sticky top-0 z-50">
          <div className="container flex items-center justify-between py-3">
            <Link href="/">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </div>
            </Link>
            <h1 className="font-pixel text-sm text-arcade-indigo">PROFILE</h1>
            <div className="w-16" />
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-xl border-2 border-arcade-indigo/30 border-t-arcade-indigo animate-spin" />
            <span className="font-pixel text-xs text-muted-foreground">LOADING PROFILE...</span>
          </div>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data;
  if (!profile) return null;

  const totalAchievements = ACHIEVEMENT_DEFS.length;
  const achievementProgress = Math.round(
    (profile.stats.achievementsUnlocked / totalAchievements) * 100
  );
  const unlockedIds = new Set(profile.achievements.map((a) => a.achievementId));

  // Get the 6 most recently unlocked achievements
  const recentAchievements = profile.achievements.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur-md bg-background/60 sticky top-0 z-50">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Back</span>
              </div>
            </Link>
            <div className="w-px h-5 bg-border/50" />
            <h1 className="font-pixel text-sm text-arcade-indigo">PROFILE</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <div className="w-7 h-7 rounded-md border border-border/50 flex items-center justify-center text-muted-foreground hover:text-arcade-coral hover:border-arcade-coral/30 transition-colors" title="Settings">
                <Settings className="w-3.5 h-3.5" />
              </div>
            </Link>
            <button
              onClick={() => logout()}
              className="w-7 h-7 rounded-md border border-border/50 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:border-red-400/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4 sm:py-8 max-w-5xl mx-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* ── Player Header ── */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-arcade-indigo/20 to-arcade-coral/20 border border-arcade-indigo/30 flex items-center justify-center shrink-0">
                <span className="font-pixel text-2xl sm:text-3xl text-arcade-indigo">
                  {(profile.user.name || "?")[0]?.toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <h2 className="font-pixel text-lg sm:text-2xl text-foreground truncate">
                  {profile.user.name || "Player"}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {formatDate(profile.user.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Stats Cards ── */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-1 h-5 bg-arcade-coral rounded-full" />
              <h3 className="font-pixel text-xs sm:text-sm text-foreground">OVERVIEW</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                icon={<Gamepad2 className="w-5 h-5" />}
                label="Games Played"
                value={profile.stats.totalGamesPlayed}
                color="indigo"
              />
              <StatCard
                icon={<Target className="w-5 h-5" />}
                label="Games Tried"
                value={`${profile.stats.gamesWithScores}/6`}
                color="coral"
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Total Best Score"
                value={profile.stats.totalBestScore.toLocaleString()}
                color="mint"
              />
              <StatCard
                icon={<Award className="w-5 h-5" />}
                label="Achievements"
                value={`${profile.stats.achievementsUnlocked}/${totalAchievements}`}
                color="indigo"
              />
            </div>
          </motion.div>

          {/* ── Per-Game Stats ── */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-1 h-5 bg-arcade-mint rounded-full" />
              <h3 className="font-pixel text-xs sm:text-sm text-foreground">GAME STATS</h3>
            </div>
            {profile.gameStats.length === 0 ? (
              <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
                <Gamepad2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No games played yet. Start playing to see your stats!</p>
                <Link href="/">
                  <span className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-arcade-mint text-arcade-darker font-semibold text-sm hover:bg-arcade-mint/80 transition-colors">
                    <Gamepad2 className="w-4 h-4" /> Play Now
                  </span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {Object.entries(GAME_LABELS).map(([gameId, info]) => {
                  const stat = profile.gameStats.find((s) => s.game === gameId);
                  if (!stat) return null;
                  return (
                    <Link href={info.path} key={gameId}>
                      <div className="rounded-xl border border-border/50 bg-card p-4 hover:border-border transition-colors group cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`font-pixel text-xs ${info.color}`}>{info.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {stat.totalPlays} {stat.totalPlays === 1 ? "play" : "plays"}
                          </span>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Best Score</p>
                            <p className="text-xl sm:text-2xl font-bold text-foreground">
                              {(stat.bestScore ?? 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">Last played</p>
                            <p className="text-xs text-muted-foreground">
                              {stat.lastPlayed ? formatRelativeTime(stat.lastPlayed) : "—"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] text-arcade-indigo opacity-0 group-hover:opacity-100 transition-opacity text-right">
                          Play again →
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* ── Achievements Section ── */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-arcade-indigo rounded-full" />
                <h3 className="font-pixel text-xs sm:text-sm text-foreground">ACHIEVEMENTS</h3>
              </div>
              <Link href="/achievements">
                <span className="text-xs text-arcade-indigo hover:underline">View All →</span>
              </Link>
            </div>

            {/* Progress bar */}
            <div className="rounded-xl border border-border/50 bg-card p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">
                  {profile.stats.achievementsUnlocked} of {totalAchievements} unlocked
                </span>
                <span className="font-pixel text-xs text-arcade-indigo">{achievementProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-arcade-indigo to-arcade-coral"
                  initial={{ width: 0 }}
                  animate={{ width: `${achievementProgress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            {/* Recent achievements */}
            {recentAchievements.length === 0 ? (
              <div className="rounded-xl border border-border/50 bg-card p-6 text-center">
                <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No achievements unlocked yet. Keep playing!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentAchievements.map((ua) => {
                  const def = getAchievementDef(ua.achievementId);
                  if (!def) return null;
                  const gameInfo = def.game !== "global" ? GAME_LABELS[def.game] : null;
                  return (
                    <div
                      key={ua.achievementId}
                      className="rounded-xl border border-arcade-indigo/20 bg-arcade-indigo/5 p-3 flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-arcade-indigo/10 flex items-center justify-center text-lg shrink-0">
                        {def.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{def.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{def.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {gameInfo && (
                            <span className={`text-[10px] ${gameInfo.color}`}>{gameInfo.name}</span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(ua.unlockedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* ── Recent Game History ── */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-1 h-5 bg-arcade-coral rounded-full" />
              <h3 className="font-pixel text-xs sm:text-sm text-foreground">RECENT GAMES</h3>
            </div>

            {profile.recentScores.length === 0 ? (
              <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
                <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No game history yet.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                {/* Table header */}
                <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 border-b border-border/50 bg-muted/30">
                  <span className="font-pixel text-[10px] text-muted-foreground">GAME</span>
                  <span className="font-pixel text-[10px] text-muted-foreground text-right w-20">SCORE</span>
                  <span className="font-pixel text-[10px] text-muted-foreground text-right w-16">EXTRA</span>
                  <span className="font-pixel text-[10px] text-muted-foreground text-right w-24">WHEN</span>
                </div>

                {/* Table rows */}
                <div className="divide-y divide-border/30">
                  {profile.recentScores.map((entry, i) => {
                    const gameInfo = GAME_LABELS[entry.game] || {
                      name: entry.game,
                      color: "text-foreground",
                      path: "/",
                    };
                    const extra =
                      entry.game === "tetris" && entry.lines
                        ? `${entry.lines}L`
                        : entry.game === "space-invaders" && entry.wave
                        ? `W${entry.wave}`
                        : "—";

                    return (
                      <div
                        key={entry.id ?? i}
                        className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-4 px-4 py-2.5 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`font-pixel text-xs ${gameInfo.color}`}>
                            {gameInfo.name}
                          </span>
                        </div>
                        <div className="text-right sm:w-20">
                          <span className="text-sm font-bold text-foreground">
                            {entry.score.toLocaleString()}
                          </span>
                        </div>
                        <div className="hidden sm:block text-right w-16">
                          <span className="text-xs text-muted-foreground">{extra}</span>
                        </div>
                        <div className="hidden sm:block text-right w-24">
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(entry.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Stat Card Component ── */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "indigo" | "coral" | "mint";
}) {
  const colorMap = {
    indigo: {
      iconBg: "bg-arcade-indigo/10",
      iconText: "text-arcade-indigo",
      border: "border-arcade-indigo/20",
    },
    coral: {
      iconBg: "bg-arcade-coral/10",
      iconText: "text-arcade-coral",
      border: "border-arcade-coral/20",
    },
    mint: {
      iconBg: "bg-arcade-mint/10",
      iconText: "text-arcade-mint",
      border: "border-arcade-mint/20",
    },
  };
  const c = colorMap[color];

  return (
    <div className={`rounded-xl border ${c.border} bg-card p-3 sm:p-4`}>
      <div className={`w-9 h-9 rounded-lg ${c.iconBg} ${c.iconText} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-lg sm:text-2xl font-bold text-foreground mt-0.5">{value}</p>
    </div>
  );
}
