/**
 * GameLayout — Shared wrapper for all game pages
 * Provides consistent nav, back button, and game container styling
 */
import { Link } from "wouter";
import { ArrowLeft, Gamepad2, Home } from "lucide-react";

interface GameLayoutProps {
  title: string;
  color: "mint" | "coral" | "indigo";
  children: React.ReactNode;
}

const colorClasses = {
  mint: {
    text: "text-arcade-mint",
    glow: "text-glow-mint",
    border: "border-arcade-mint/30",
    bg: "bg-arcade-mint/10",
  },
  coral: {
    text: "text-arcade-coral",
    glow: "text-glow-coral",
    border: "border-arcade-coral/30",
    bg: "bg-arcade-coral/10",
  },
  indigo: {
    text: "text-arcade-indigo",
    glow: "text-glow-indigo",
    border: "border-arcade-indigo/30",
    bg: "bg-arcade-indigo/10",
  },
};

export default function GameLayout({ title, color, children }: GameLayoutProps) {
  const colors = colorClasses[color];

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <h1 className={`font-pixel text-sm sm:text-base ${colors.text}`}>
              {title}
            </h1>
          </div>
          <Link href="/">
            <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <Home className="w-4 h-4" />
              <Gamepad2 className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </nav>

      {/* Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
