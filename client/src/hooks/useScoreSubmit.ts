import { useCallback, useRef } from "react";
import { submitScore as storeSubmitScore, getAchievementDef } from "@/lib/gameStore";
import { toast } from "sonner";

interface SubmitOptions {
  game: string;
  score: number;
  wave?: number;
  lines?: number;
  extras?: {
    playerScore?: number;
    aiScore?: number;
    fourLineClears?: number;
    difficulty?: string;
    maxTile?: number;
  };
}

export function useScoreSubmit() {
  const submittingRef = useRef(false);

  const submitScore = useCallback(async (options: SubmitOptions) => {
    if (submittingRef.current) return null;
    submittingRef.current = true;

    try {
      const result = storeSubmitScore(options.game, options.score, {
        wave: options.wave,
        lines: options.lines,
        ...options.extras,
      });

      // Show achievement toasts
      if (result.newAchievements && result.newAchievements.length > 0) {
        for (const achievementId of result.newAchievements) {
          const def = getAchievementDef(achievementId);
          if (def) {
            toast.success(`${def.icon} Achievement Unlocked!`, {
              description: `${def.title} — ${def.description}`,
              duration: 5000,
            });
          }
        }
      }

      return result;
    } catch (error) {
      console.error("[ScoreSubmit] Failed:", error);
      return null;
    } finally {
      submittingRef.current = false;
    }
  }, []);

  return { submitScore, isLoggedIn: true };
}
