import { useCallback, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getAchievementDef } from "../../../shared/achievements";
import { toast } from "sonner";

type GameId = "snake" | "flappy-bird" | "dino-jump" | "tetris" | "pong" | "space-invaders";

interface SubmitOptions {
  game: GameId;
  score: number;
  wave?: number;
  lines?: number;
  extras?: {
    playerScore?: number;
    aiScore?: number;
    fourLineClears?: number;
  };
}

export function useScoreSubmit() {
  const { user } = useAuth();
  const submitMutation = trpc.leaderboard.submitScore.useMutation();
  const submittingRef = useRef(false);

  const submitScore = useCallback(
    async (options: SubmitOptions) => {
      if (!user || submittingRef.current) return null;
      submittingRef.current = true;

      try {
        const result = await submitMutation.mutateAsync(options);

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
        // Silently fail — don't interrupt gameplay
        console.error("[ScoreSubmit] Failed:", error);
        return null;
      } finally {
        submittingRef.current = false;
      }
    },
    [user, submitMutation]
  );

  return { submitScore, isLoggedIn: !!user };
}
