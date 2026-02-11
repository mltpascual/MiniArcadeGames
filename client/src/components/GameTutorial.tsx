/**
 * GameTutorial — Overlay component that shows on first play for each game.
 * Displays controls and gameplay tips. Stores completion state in localStorage.
 */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gamepad2, Keyboard, Smartphone, Lightbulb } from "lucide-react";

export interface TutorialControl {
  icon?: "keyboard" | "mouse" | "touch" | "gamepad";
  key: string;
  action: string;
}

export interface TutorialTip {
  text: string;
}

export interface GameTutorialProps {
  gameId: string;
  gameName: string;
  controls: {
    desktop: TutorialControl[];
    mobile: TutorialControl[];
  };
  tips: TutorialTip[];
  onDismiss?: () => void;
}

const TUTORIAL_STORAGE_KEY = "pixel-playground-tutorials-seen";

function getTutorialsSeen(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function markTutorialSeen(gameId: string) {
  try {
    const seen = getTutorialsSeen();
    seen[gameId] = true;
    localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(seen));
  } catch {
    // localStorage unavailable
  }
}

export function hasTutorialBeenSeen(gameId: string): boolean {
  return getTutorialsSeen()[gameId] === true;
}

export default function GameTutorial({
  gameId,
  gameName,
  controls,
  tips,
  onDismiss,
}: GameTutorialProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasTutorialBeenSeen(gameId)) {
      setVisible(true);
    }
  }, [gameId]);

  const dismiss = useCallback(() => {
    markTutorialSeen(gameId);
    setVisible(false);
    onDismiss?.();
  }, [gameId, onDismiss]);

  // Also dismiss on Escape key
  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [visible, dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={dismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Tutorial Card */}
          <motion.div
            className="relative w-full max-w-md bg-[#1a1a2e] text-white border border-arcade-indigo/30 rounded-2xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="relative px-5 pt-5 pb-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-arcade-indigo/20 border border-arcade-indigo/30 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-arcade-indigo" />
                  </div>
                  <div>
                    <h2 className="font-pixel text-sm sm:text-base text-white">
                      HOW TO PLAY
                    </h2>
                    <p className="text-xs text-white/50">{gameName}</p>
                  </div>
                </div>
                <button
                  onClick={dismiss}
                  className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Controls - Desktop */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center gap-2 mb-3">
                <Keyboard className="w-4 h-4 text-arcade-mint" />
                <span className="font-pixel text-[10px] sm:text-xs text-arcade-mint">
                  DESKTOP CONTROLS
                </span>
              </div>
              <div className="space-y-2">
                {controls.desktop.map((ctrl, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <kbd className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-white/10 border border-white/20 font-mono text-[11px] sm:text-xs text-white font-semibold">
                      {ctrl.key}
                    </kbd>
                    <span className="text-xs sm:text-sm text-white/60">
                      {ctrl.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls - Mobile */}
            <div className="px-5 pt-3 pb-2">
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="w-4 h-4 text-arcade-coral" />
                <span className="font-pixel text-[10px] sm:text-xs text-arcade-coral">
                  MOBILE CONTROLS
                </span>
              </div>
              <div className="space-y-2">
                {controls.mobile.map((ctrl, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <kbd className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-white/10 border border-white/20 font-mono text-[11px] sm:text-xs text-white font-semibold">
                      {ctrl.key}
                    </kbd>
                    <span className="text-xs sm:text-sm text-white/60">
                      {ctrl.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            {tips.length > 0 && (
              <div className="px-5 pt-3 pb-2">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <span className="font-pixel text-[10px] sm:text-xs text-yellow-400">
                    TIPS
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {tips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs sm:text-sm text-white/60"
                    >
                      <span className="text-arcade-indigo mt-0.5">▸</span>
                      {tip.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dismiss Button */}
            <div className="px-5 pt-4 pb-5">
              <button
                onClick={dismiss}
                className="w-full py-2.5 rounded-xl bg-arcade-indigo text-white font-pixel text-xs sm:text-sm hover:bg-arcade-indigo/90 transition-colors"
              >
                GOT IT — LET'S PLAY!
              </button>
              <p className="text-center text-[10px] text-white/30 mt-2">
                Press ESC, Enter, or tap anywhere to dismiss
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
