/**
 * Home Page — Mini Games Arcade Hub
 * Design: Neo-retro flat with depth, "Pixel Playground" aesthetic
 * - Dark charcoal base with vibrant triadic accents (indigo, coral, mint)
 * - Responsive grid game cards — 1 col mobile, 2 col tablet, 3 col desktop
 * - Silkscreen pixel font for headings, Outfit for body
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Gamepad2, Zap, Settings, Trophy, Award } from "lucide-react";

const HERO_IMG = "https://private-us-east-1.manuscdn.com/sessionFile/47LZSGYqN22BYCYAxPiaxL/sandbox/2gvGaXiIcbq5AtvP2rclMh-img-1_1770800508000_na1fn_aGVyby1hcmNhZGU.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNDdMWlNHWXFOMjJCWUNZQXhQaWF4TC9zYW5kYm94LzJndkdhWGlJY2JxNUF0dlAycmNsTWgtaW1nLTFfMTc3MDgwMDUwODAwMF9uYTFmbl9hR1Z5YnkxaGNtTmhaR1UucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=nTbEBvwm5ChOvub7wedCQMyEBwIAY9Yq6ObAudIcHubjRSNUGOF89zeR6Ao20c7Er100ntL-zXZOOBUy1NhIx9AHVwmtCye7YSJZ2Jo4SQuAdgY5O~H6Mo08PhHf8Eebxu8v33ynfQggloMlk9cDoxQKd4nmxE-0lApXya4BsIaiy56QlGU0NZotn189Odye82Zs14FwXhx6b6EcqLXBuS-LlrJhVPrJcIk8BpOT4TWAV~uHebM-cDwvwqZb~BrmrbN7EMHoLTv4IB5hM9BVeOr10e96vW3uVOaaBboj5-PJ4W49jCIfBD3L7tOnljZDcPt0fLvP3dLXbfaS5JJTFg__";

const SNAKE_IMG = "https://private-us-east-1.manuscdn.com/sessionFile/47LZSGYqN22BYCYAxPiaxL/sandbox/2gvGaXiIcbq5AtvP2rclMh-img-2_1770800494000_na1fn_c25ha2UtY2FyZA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNDdMWlNHWXFOMjJCWUNZQXhQaWF4TC9zYW5kYm94LzJndkdhWGlJY2JxNUF0dlAycmNsTWgtaW1nLTJfMTc3MDgwMDQ5NDAwMF9uYTFmbl9jMjVoYTJVdFkyRnlaQS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=IFtrHIe4GqRSlCP6HyqVnTebyoHneu3KMFAb-AHNgB-yC9TpL9x-Ugqdi8KjPUjYT1WN8zE7nHks2pcBRJVgpwFEhwJLJ~KNhvO7a11PtvS80v3Y4Ukz6vAm-JGuGmt2LlHs77lP6m0lC28eKnZFBnNw02WNjgq5wCcmvdjlCzWrLQnFDRhawBC0Z-C-Z8rfgqMn4I2SHGTGHQkFj067OeNZIGI1ax4G-9WcJqPfH8zKI2ffxGRvQgycLXItoB6MOiRvIPBl0~ZeBnx2c1GTDHp9icBQfuOOJTYLh6PVJizj-nmkPj3bLUvvB2GiMGRbTEmn7lYIr8DB6E5q6awHmw__";

const FLAPPY_IMG = "https://private-us-east-1.manuscdn.com/sessionFile/47LZSGYqN22BYCYAxPiaxL/sandbox/2gvGaXiIcbq5AtvP2rclMh-img-3_1770800505000_na1fn_ZmxhcHB5LWNhcmQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNDdMWlNHWXFOMjJCWUNZQXhQaWF4TC9zYW5kYm94LzJndkdhWGlJY2JxNUF0dlAycmNsTWgtaW1nLTNfMTc3MDgwMDUwNTAwMF9uYTFmbl9abXhoY0hCNUxXTmhjbVEucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=PgzbLIfuh2ONYvYJ~WGXbc09iPjTPZ5s8JLDEqyeFyJSpVESxE-O18BSo6Z3B3ba1xn6txGmgM4KW4OWXjmylXOUfNfUSUcDLYMM5PmQ6e9nRvtUvHmLecJY3m23SHiWiknFFnu7Oc4szgGt281E4nDYz8zeLKj2hg5s5pop~QTcHWyupElB6mQL-vbVeEeQO~PxFldDBMuI779WmqvSLtAL6jD7DAd-SGBKVPxE9zi8mZeW7D3F~x3T3eLSudfm7Al3onZpd8C42mhkBXeQMqHm4NajX736EfrbNvTVbJm8lf5ucu4IPuQM8e~5pAYksMum3dUSlPWhwuK3zqiciQ__";

const DINO_IMG = "https://private-us-east-1.manuscdn.com/sessionFile/47LZSGYqN22BYCYAxPiaxL/sandbox/2gvGaXiIcbq5AtvP2rclMh-img-4_1770800509000_na1fn_ZGluby1jYXJk.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNDdMWlNHWXFOMjJCWUNZQXhQaWF4TC9zYW5kYm94LzJndkdhWGlJY2JxNUF0dlAycmNsTWgtaW1nLTRfMTc3MDgwMDUwOTAwMF9uYTFmbl9aR2x1YnkxallYSmsucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NcNFoLAqT0tcpQkEa01uRcX2KTUNWf2uL~3PxxoAbJafqUYfbeOAXetJsI7krB94qbBnjnadmvjlzwJbD3hjJaD1sAa2hCWHhhEaEfhREg~2FBFY9H8rrpaMtSr-ffBmSQC-NDUTbOis2I2Jy1e-oB3F1JfnNYESu4DZ6a9~p9rR0gYLkmaOzR5CAFyEG5mmkuqRUUDFFb4vB4XyAvleMy~8easMiyW31iJO-gwKX9NYwAmoIBFSSP~ilMn3wa4PpYnvSpBoymO4YGvhdXAW5N~NGWwsU~Gj4jjBk50c8jDH8i7AYwmRvEb2VXzpUDmX5okyWbE1k47X7XjJAqhp7w__";

const TETRIS_IMG = "https://private-us-east-1.manuscdn.com/sessionFile/47LZSGYqN22BYCYAxPiaxL/sandbox/UJghc7a41mXGL8ktRNJMM5-img-1_1770802241000_na1fn_dGV0cmlzLWNhcmQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNDdMWlNHWXFOMjJCWUNZQXhQaWF4TC9zYW5kYm94L1VKZ2hjN2E0MW1YR0w4a3RSTkpNTTUtaW1nLTFfMTc3MDgwMjI0MTAwMF9uYTFmbl9kR1YwY21sekxXTmhjbVEucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=pctJ6KGwyhJqp0WTkS7~XVVcQBawKC4GzrLnBzxujo-~Bt1ff~QAGcUHZIS5caZuP1uXh~tLHkiHHcgA~HYt-nwiZxIxFcXqKnvFK9zJYpYyykfVwQZOMbrBIu89JGwaP7XBeTsPyCiC9QgZJba44IDlLNqwAu1lPVHm4heaDFVbCb95dLnopv0~Rf2hWnWMSt9UvyE6cx5vS8KKeDqEesz672kZKnUJDDwM~rdsm7y8exgxJtigEvecj1JGODAzUNu3RmkTRiKsUD4d2HxAi~cV7jqF1s1I4808mvZEhU2SSpxgxAQAGNSGn4nH4iIxRWk84QghxAXzfXj6GRRjLw__";

const PONG_IMG = "https://private-us-east-1.manuscdn.com/sessionFile/47LZSGYqN22BYCYAxPiaxL/sandbox/UJghc7a41mXGL8ktRNJMM5-img-2_1770802272000_na1fn_cG9uZy1jYXJk.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNDdMWlNHWXFOMjJCWUNZQXhQaWF4TC9zYW5kYm94L1VKZ2hjN2E0MW1YR0w4a3RSTkpNTTUtaW1nLTJfMTc3MDgwMjI3MjAwMF9uYTFmbl9jRzl1WnkxallYSmsucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=grUtJxmCKqISGLTPwegleWpHr~YE~RLiLLHtNGVhU9NJLK2GtZ-FjbfXkN8M0c5Z5oGqvSJlCr7ROgzGHWE~CrypDEVPR2xWLjTobywhagwwhf~3aEZeXJ5tlO4tmleD65A~t0TUkRWTylijk0ZloZ-dT2hQ12sYGThIw0533gXTYmFZjwbqnSvTMQF7Jy3bCrIRsZgYLD9MZQOIpSbD1v8hpSuivrwurEb5d2f4fCbdo7sGLk1c3iB-~ExrzypTFzLyIUj9yawFnzsvcCzJMAnuWmAD5szuSR9Je6EFA3SRKnqoZDebCnS98H3qLhKEHlAMqWW9kZlEilvv2FcPsA__";

const INVADERS_IMG = "https://private-us-east-1.manuscdn.com/sessionFile/47LZSGYqN22BYCYAxPiaxL/sandbox/UJghc7a41mXGL8ktRNJMM5-img-3_1770802265000_na1fn_aW52YWRlcnMtY2FyZA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNDdMWlNHWXFOMjJCWUNZQXhQaWF4TC9zYW5kYm94L1VKZ2hjN2E0MW1YR0w4a3RSTkpNTTUtaW1nLTNfMTc3MDgwMjI2NTAwMF9uYTFmbl9hVzUyWVdSbGNuTXRZMkZ5WkEucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=Gkhr7bakTygMiyx9vUIo3wDad~l~gd5TYE4v~EFD2N9zBH7RId2d45Tlk1xmbExwo2yNaQzgPwCOE9wB1Ri7Dt3KV731X0vJFZ37QjIxCjoBl8JmaACChdwIMkD4LSL8b3KXoONKSJIJTAkaYedSTxu2y29Ibb2Zy78XI14rqtHI5feRmBAUAZr1pzfjDAypvxyZsZyQ-U6tydP6siW30ocwB~a6iG3u9SFaKFKlJhr6KVEv934nmcY1X2kVbKoHw9rb7N89NagdFblRACyNoEpdbMMqrn6Lgs-Q~Dq9-ubCXPuIu0XXhCVRsUWcl81J0oG3g-s31IcuPwbjpsDGPw__";

const games = [
  {
    id: "snake",
    title: "Snake",
    description: "Guide the snake, eat the apples, grow longer. Classic arcade fun with a modern twist.",
    path: "/snake",
    image: SNAKE_IMG,
    color: "mint" as const,
    tag: "Classic",
  },
  {
    id: "flappy",
    title: "Flappy Bird",
    description: "Tap to fly through the pipes. One wrong move and it's game over. How far can you go?",
    path: "/flappy-bird",
    image: FLAPPY_IMG,
    color: "coral" as const,
    tag: "Addictive",
  },
  {
    id: "dino",
    title: "Dino Jump",
    description: "Run, jump, and dodge obstacles in this endless desert runner. Beat your high score!",
    path: "/dino-jump",
    image: DINO_IMG,
    color: "indigo" as const,
    tag: "Endless",
  },
  {
    id: "tetris",
    title: "Tetris",
    description: "Stack the falling blocks, clear lines, and chase the high score. The ultimate puzzle game.",
    path: "/tetris",
    image: TETRIS_IMG,
    color: "coral" as const,
    tag: "Puzzle",
  },
  {
    id: "pong",
    title: "Pong",
    description: "The original arcade classic. Beat the AI in this fast-paced table tennis showdown.",
    path: "/pong",
    image: PONG_IMG,
    color: "mint" as const,
    tag: "Versus",
  },
  {
    id: "invaders",
    title: "Space Invaders",
    description: "Defend Earth from waves of alien invaders. Shoot, dodge, and survive as long as you can!",
    path: "/space-invaders",
    image: INVADERS_IMG,
    color: "indigo" as const,
    tag: "Shooter",
  },
];

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
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

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

      {/* Games Grid */}
      <section className="relative z-10 py-4 sm:py-8 md:py-12">
        <div className="container">
          <motion.div
            className="flex items-center gap-3 mb-4 sm:mb-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-1 h-6 sm:h-8 bg-arcade-coral rounded-full" />
            <h2 className="font-pixel text-base sm:text-lg md:text-xl text-foreground">SELECT GAME</h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {games.map((game) => {
              const colors = colorMap[game.color];
              return (
                <motion.div key={game.id} variants={itemVariants}>
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
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                          <span className={`font-pixel text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${colors.tagBg} ${colors.tagText}`}>
                            {game.tag}
                          </span>
                        </div>
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
                          <span className="transition-transform group-hover:translate-x-1">→</span>
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
          </motion.div>
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
