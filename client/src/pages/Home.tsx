/**
 * Home Page — Mini Games Arcade Hub
 * Design: Neo-retro flat with depth, "Pixel Playground" aesthetic
 * - Dark charcoal base with vibrant triadic accents (indigo, coral, mint)
 * - Responsive grid game cards — 1 col mobile, 2 col tablet, 3 col desktop
 * - Silkscreen pixel font for headings, Outfit for body
 */
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Gamepad2, Zap, Settings, Trophy, Award, User, Search, X, Star, Flame, Sparkles } from "lucide-react";
import { getFavorites, toggleFavorite as storeToggleFavorite, getGamePlayCounts } from "@/lib/gameStore";

const HERO_IMG = "/images/hero-arcade.webp";

const SNAKE_IMG = "/images/snake-card.webp";

const FLAPPY_IMG = "/images/flappy-card.webp";

const DINO_IMG = "/images/dino-card.webp";

const TETRIS_IMG = "/images/tetris-card.webp";

const PONG_IMG = "/images/pong-card.webp";

const INVADERS_IMG = "/images/invaders-card.webp";

const MINESWEEPER_IMG = "/images/minesweeper-card.webp";

const BREAKOUT_IMG = "/images/breakout-card.webp";

const GAME2048_IMG = "/images/2048-card.webp";

const MEMORY_IMG = "/images/memory-card.webp";

const WHACK_IMG = "/images/whack-card.webp";

// Games added in the latest batch (shown with NEW badge)
const NEW_GAME_IDS = new Set(["minesweeper", "breakout", "2048", "memory-match", "whack-a-mole"]);
// Threshold: games with >= this many total plays get a HOT badge
const HOT_PLAY_THRESHOLD = 5;

const games = [
  {
    id: "snake",
    backendId: "snake" as const,
    title: "Snake",
    description: "Guide the snake, eat the apples, grow longer. Classic arcade fun with a modern twist.",
    path: "/snake",
    image: SNAKE_IMG,
    color: "mint" as const,
    tag: "Classic",
  },
  {
    id: "flappy",
    backendId: "flappy-bird" as const,
    title: "Flappy Bird",
    description: "Tap to fly through the pipes. One wrong move and it's game over. How far can you go?",
    path: "/flappy-bird",
    image: FLAPPY_IMG,
    color: "coral" as const,
    tag: "Addictive",
  },
  {
    id: "dino",
    backendId: "dino-jump" as const,
    title: "Dino Jump",
    description: "Run, jump, and dodge obstacles in this endless desert runner. Beat your high score!",
    path: "/dino-jump",
    image: DINO_IMG,
    color: "indigo" as const,
    tag: "Endless",
  },
  {
    id: "tetris",
    backendId: "tetris" as const,
    title: "Tetris",
    description: "Stack the falling blocks, clear lines, and chase the high score. The ultimate puzzle game.",
    path: "/tetris",
    image: TETRIS_IMG,
    color: "coral" as const,
    tag: "Puzzle",
  },
  {
    id: "pong",
    backendId: "pong" as const,
    title: "Pong",
    description: "The original arcade classic. Beat the AI in this fast-paced table tennis showdown.",
    path: "/pong",
    image: PONG_IMG,
    color: "mint" as const,
    tag: "Versus",
  },
  {
    id: "invaders",
    backendId: "space-invaders" as const,
    title: "Space Invaders",
    description: "Defend Earth from waves of alien invaders. Shoot, dodge, and survive as long as you can!",
    path: "/space-invaders",
    image: INVADERS_IMG,
    color: "indigo" as const,
    tag: "Shooter",
  },
  {
    id: "minesweeper",
    backendId: "minesweeper" as const,
    title: "Minesweeper",
    description: "Reveal tiles, flag mines, and clear the board. One wrong click and it's game over!",
    path: "/minesweeper",
    image: MINESWEEPER_IMG,
    color: "mint" as const,
    tag: "Strategy",
  },
  {
    id: "breakout",
    backendId: "breakout" as const,
    title: "Breakout",
    description: "Smash bricks with a bouncing ball and paddle. Clear all the bricks to win!",
    path: "/breakout",
    image: BREAKOUT_IMG,
    color: "coral" as const,
    tag: "Action",
  },
  {
    id: "2048",
    backendId: "2048" as const,
    title: "2048",
    description: "Slide and merge tiles to reach 2048. A simple concept that's endlessly addictive.",
    path: "/2048",
    image: GAME2048_IMG,
    color: "indigo" as const,
    tag: "Puzzle",
  },
  {
    id: "memory-match",
    backendId: "memory-match" as const,
    title: "Memory Match",
    description: "Flip cards and find matching pairs. Test your memory and beat the clock!",
    path: "/memory-match",
    image: MEMORY_IMG,
    color: "coral" as const,
    tag: "Brain",
  },
  {
    id: "whack-a-mole",
    backendId: "whack-a-mole" as const,
    title: "Whack-a-Mole",
    description: "Whack the moles as they pop up! Fast reflexes earn the highest scores.",
    path: "/whack-a-mole",
    image: WHACK_IMG,
    color: "mint" as const,
    tag: "Reflex",
  },
];

const categories = [
  { id: "all", label: "ALL", icon: null },
  { id: "favorites", label: "\u2605 FAVS", icon: null },
  { id: "classic", label: "CLASSIC", icon: null },
  { id: "puzzle", label: "PUZZLE", icon: null },
  { id: "action", label: "ACTION", icon: null },
  { id: "brain", label: "BRAIN", icon: null },
  { id: "reflex", label: "REFLEX", icon: null },
];

const gameCategoryMap: Record<string, string> = {
  "Classic": "classic",
  "Addictive": "classic",
  "Endless": "action",
  "Puzzle": "puzzle",
  "Versus": "action",
  "Shooter": "action",
  "Strategy": "puzzle",
  "Action": "action",
  "Brain": "brain",
  "Reflex": "reflex",
};

const colorMap = {
  mint: {
    border: "border-arcade-mint/30",
    hoverBorder: "hover:border-arcade-mint/60",
    bg: "bg-arcade-mint/10",
    text: "text-arcade-mint",
    glow: "card-glow-mint",
    tagBg: "bg-arcade-mint/20",
    tagText: "text-arcade-mint",
    btnBg: "bg-arcade-mint",
    btnText: "text-arcade-darker",
  },
  coral: {
    border: "border-arcade-coral/30",
    hoverBorder: "hover:border-arcade-coral/60",
    bg: "bg-arcade-coral/10",
    text: "text-arcade-coral",
    glow: "card-glow-coral",
    tagBg: "bg-arcade-coral/20",
    tagText: "text-arcade-coral",
    btnBg: "bg-arcade-coral",
    btnText: "text-arcade-darker",
  },
  indigo: {
    border: "border-arcade-indigo/30",
    hoverBorder: "hover:border-arcade-indigo/60",
    bg: "bg-arcade-indigo/10",
    text: "text-arcade-indigo",
    glow: "card-glow-indigo",
    tagBg: "bg-arcade-indigo/20",
    tagText: "text-arcade-indigo",
    btnBg: "bg-arcade-indigo",
    btnText: "text-white",
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [favVersion, setFavVersion] = useState(0);

  // Favorites from localStorage
  const favoriteGameIds = useMemo(() => new Set(getFavorites()), [favVersion]);

  // Game play counts for HOT badge from localStorage
  const hotGameIds = useMemo(() => {
    const counts = getGamePlayCounts();
    const hot = new Set<string>();
    for (const [game, plays] of Object.entries(counts)) {
      if (plays >= HOT_PLAY_THRESHOLD) hot.add(game);
    }
    return hot;
  }, [favVersion]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent, backendId: string) => {
    e.preventDefault();
    e.stopPropagation();
    storeToggleFavorite(backendId);
    setFavVersion((v) => v + 1);
  }, []);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = searchQuery === "" ||
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.tag.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeCategory === "favorites") {
        return matchesSearch && favoriteGameIds.has(game.backendId);
      }
      const matchesCategory = activeCategory === "all" ||
        gameCategoryMap[game.tag] === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, favoriteGameIds]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Floating geometric shapes background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-arcade-indigo/5 blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "10%", left: "5%" }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-arcade-coral/5 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "50%", right: "0%" }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full bg-arcade-mint/5 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -50, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "10%", left: "30%" }}
        />
      </div>

      {/* Nav bar */}
      <nav className="relative z-10 border-b border-border/50 backdrop-blur-md bg-background/60 sticky top-0">
        <div className="container flex items-center justify-between py-3 sm:py-4">
          <Link href="/">
            <div className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-arcade-indigo/20 border border-arcade-indigo/30 flex items-center justify-center group-hover:bg-arcade-indigo/30 transition-colors">
                <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-arcade-indigo" />
              </div>
              <span className="font-pixel text-sm sm:text-lg text-foreground tracking-wide">
                PIXEL<span className="text-arcade-indigo">PLAY</span>
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-arcade-coral" />
              <span>{games.length} Games</span>
            </div>
            <Link href="/leaderboard">
              <div className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-yellow-400 hover:border-yellow-400/30 transition-colors" title="Leaderboard">
                <Trophy className="w-4 h-4" />
              </div>
            </Link>
            <Link href="/achievements">
              <div className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-arcade-mint hover:border-arcade-mint/30 transition-colors" title="Achievements">
                <Award className="w-4 h-4" />
              </div>
            </Link>
            <Link href="/profile">
              <div className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-arcade-indigo hover:border-arcade-indigo/30 transition-colors" title="Profile">
                <User className="w-4 h-4" />
              </div>
            </Link>
            <Link href="/settings">
              <div className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-arcade-coral hover:border-arcade-coral/30 transition-colors" title="Settings">
                <Settings className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-4 pb-2 sm:pt-8 sm:pb-4 md:pt-12 md:pb-6">
        <div className="container">
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-border/50">
            <img
              src={HERO_IMG}
              alt="Pixel Playground Arcade"
              className="w-full h-36 sm:h-48 md:h-64 lg:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="font-pixel text-lg sm:text-2xl md:text-3xl lg:text-5xl text-white text-glow-indigo leading-tight">
                  PIXEL PLAYGROUND
                </h1>
                <p className="mt-1 sm:mt-3 text-xs sm:text-base text-white/80 max-w-xl font-light">
                  Classic arcade games reimagined. Pick a game, beat your score, and have fun.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="relative z-10 pt-4 sm:pt-6 md:pt-8">
        <div className="container">
          {/* Search Bar */}
          <div className="relative mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-full pl-10 sm:pl-12 pr-10 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground text-sm sm:text-base font-medium focus:outline-none focus:border-arcade-indigo/50 focus:ring-1 focus:ring-arcade-indigo/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/30 transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide mb-2 sm:mb-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`font-pixel text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap transition-all duration-200 border ${
                  activeCategory === cat.id
                    ? "bg-arcade-indigo/20 border-arcade-indigo/40 text-arcade-indigo"
                    : "bg-card border-border/30 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Games Grid */}
      <section className="relative z-10 py-4 sm:py-8 md:py-12">
        <div className="container">
          <motion.div
            className="flex items-center justify-between gap-3 mb-4 sm:mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 sm:h-8 bg-arcade-coral rounded-full" />
              <h2 className="font-pixel text-base sm:text-lg md:text-xl text-foreground">
                {activeCategory === "all" && !searchQuery ? "SELECT GAME" : `${filteredGames.length} GAME${filteredGames.length !== 1 ? "S" : ""} FOUND`}
              </h2>
            </div>
          </motion.div>

          {filteredGames.length === 0 ? (
            <motion.div
              className="text-center py-16 sm:py-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Gamepad2 className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-pixel text-sm sm:text-base text-muted-foreground mb-2">
                {activeCategory === "favorites" ? "NO FAVORITES YET" : "NO GAMES FOUND"}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground/60">
                {activeCategory === "favorites"
                  ? "Star games to add them to your favorites!"
                  : "Try a different search or category"}
              </p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="mt-4 px-4 py-2 rounded-lg bg-arcade-indigo/20 text-arcade-indigo font-pixel text-xs hover:bg-arcade-indigo/30 transition-colors"
              >
                CLEAR FILTERS
              </button>
            </motion.div>
          ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {filteredGames.map((game) => {
                const colors = colorMap[game.color];
                const isFav = favoriteGameIds.has(game.backendId);
                const isNew = NEW_GAME_IDS.has(game.id);
                const isHot = hotGameIds.has(game.backendId);
                return (
                  <motion.div key={game.id} variants={itemVariants} layout>
                    <Link href={game.path}>
                      <motion.div
                        className={`group relative rounded-lg sm:rounded-xl border ${colors.border} ${colors.hoverBorder} bg-card overflow-hidden transition-colors duration-300 h-full`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        {/* Card image */}
                        <div className="relative h-28 sm:h-40 md:h-48 overflow-hidden">
                          <img
                            src={game.image}
                            alt={game.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                          {/* Tag + Badges row */}
                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1.5">
                            <span className={`font-pixel text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${colors.tagBg} ${colors.tagText}`}>
                              {game.tag}
                            </span>
                            {isNew && (
                              <motion.span
                                className="font-pixel text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/90 text-white flex items-center gap-0.5"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                              >
                                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                NEW
                              </motion.span>
                            )}
                            {isHot && !isNew && (
                              <motion.span
                                className="font-pixel text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-orange-500/90 text-white flex items-center gap-0.5"
                                initial={{ scale: 0 }}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                HOT
                              </motion.span>
                            )}
                          </div>
                          {/* Favorite star button */}
                          <button
                            onClick={(e) => handleToggleFavorite(e, game.backendId)}
                            className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
                              isFav
                                ? "bg-yellow-400/90 text-yellow-900 shadow-lg shadow-yellow-400/30"
                                : "bg-black/40 text-white/60 hover:bg-black/60 hover:text-white backdrop-blur-sm"
                            }`}
                            title={isFav ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? "fill-current" : ""}`} />
                          </button>
                        </div>

                        {/* Card content */}
                        <div className="p-3 sm:p-4 md:p-5">
                          <h3 className={`font-pixel text-sm sm:text-lg md:text-xl ${colors.text} mb-1 sm:mb-2`}>
                            {game.title}
                          </h3>
                          <p className="text-[11px] sm:text-sm text-muted-foreground leading-relaxed mb-2 sm:mb-4 line-clamp-2">
                            {game.description}
                          </p>
                          <div
                            className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-md sm:rounded-lg ${colors.btnBg} ${colors.btnText} font-semibold text-[10px] sm:text-sm transition-all group-hover:gap-3`}
                          >
                            Play
                            <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                          </div>
                        </div>

                        {/* Hover glow effect */}
                        <div
                          className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${colors.glow}`}
                          style={{ borderRadius: "inherit" }}
                        />
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-6 sm:py-8 mt-4 sm:mt-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <span className="font-pixel text-xs text-muted-foreground">
            PIXEL<span className="text-arcade-indigo">PLAY</span> ARCADE
          </span>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Use arrow keys or tap to play. Have fun!
          </p>
        </div>
      </footer>
    </div>
  );
}
