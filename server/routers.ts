import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  submitScore,
  getTopScores,
  getUserBestScore,
  getUserAllBestScores,
  unlockAchievement,
  getUserAchievements,
  getUserRecentScores,
  getUserTotalGamesPlayed,
  getUserGameStats,
} from "./db";
import { checkAchievements } from "../shared/achievements";

const VALID_GAMES = ["snake", "flappy-bird", "dino-jump", "tetris", "pong", "space-invaders", "minesweeper", "breakout", "2048", "memory-match", "whack-a-mole"] as const;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  leaderboard: router({
    /** Get top 10 scores for a specific game */
    getTopScores: publicProcedure
      .input(z.object({ game: z.enum(VALID_GAMES), limit: z.number().min(1).max(50).optional() }))
      .query(async ({ input }) => {
        return getTopScores(input.game, input.limit ?? 10);
      }),

    /** Submit a score (requires login) */
    submitScore: protectedProcedure
      .input(
        z.object({
          game: z.enum(VALID_GAMES),
          score: z.number().int().min(0),
          wave: z.number().int().optional(),
          lines: z.number().int().optional(),
          extras: z.object({
            playerScore: z.number().optional(),
            aiScore: z.number().optional(),
            fourLineClears: z.number().optional(),
          }).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Submit the score
        await submitScore({
          userId: ctx.user.id,
          game: input.game,
          score: input.score,
          wave: input.wave ?? null,
          lines: input.lines ?? null,
        });

        // Check for achievements
        const achievementIds = checkAchievements(input.game, input.score, {
          lines: input.lines,
          wave: input.wave,
          playerScore: input.extras?.playerScore,
          aiScore: input.extras?.aiScore,
          fourLineClears: input.extras?.fourLineClears,
        });

        const newlyUnlocked: string[] = [];
        for (const achievementId of achievementIds) {
          const isNew = await unlockAchievement({ userId: ctx.user.id, achievementId });
          if (isNew) newlyUnlocked.push(achievementId);
        }

        // Get user's best score for this game
        const best = await getUserBestScore(ctx.user.id, input.game);

        return {
          submitted: true,
          bestScore: best?.score ?? input.score,
          newAchievements: newlyUnlocked,
        };
      }),

    /** Get the current user's best scores across all games */
    getMyBestScores: protectedProcedure.query(async ({ ctx }) => {
      return getUserAllBestScores(ctx.user.id);
    }),
  }),

  achievements: router({
    /** Get the current user's unlocked achievements */
    getMyAchievements: protectedProcedure.query(async ({ ctx }) => {
      return getUserAchievements(ctx.user.id);
    }),

    /** Check all games played (for the "all-games" achievement) */
    checkAllGames: protectedProcedure.mutation(async ({ ctx }) => {
      const bestScores = await getUserAllBestScores(ctx.user.id);
      const gamesPlayed = new Set(bestScores.map(s => s.game));
      if (gamesPlayed.size >= 6) {
        const isNew = await unlockAchievement({ userId: ctx.user.id, achievementId: "all-games" });
        return { unlocked: isNew, achievementId: "all-games" };
      }
      return { unlocked: false, gamesPlayed: gamesPlayed.size };
    }),
  }),

  profile: router({
    /** Get the current user's full profile data (stats, game history, achievements) */
    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      const [gameStats, recentScores, totalGamesPlayed, achievements, bestScores] = await Promise.all([
        getUserGameStats(ctx.user.id),
        getUserRecentScores(ctx.user.id, 30),
        getUserTotalGamesPlayed(ctx.user.id),
        getUserAchievements(ctx.user.id),
        getUserAllBestScores(ctx.user.id),
      ]);

      // Calculate aggregate stats
      const totalScore = bestScores.reduce((sum, s) => sum + (s.score ?? 0), 0);
      const gamesWithScores = bestScores.length;

      return {
        user: {
          id: ctx.user.id,
          name: ctx.user.name,
          email: ctx.user.email,
          createdAt: ctx.user.createdAt,
        },
        stats: {
          totalGamesPlayed,
          gamesWithScores,
          totalBestScore: totalScore,
          achievementsUnlocked: achievements.length,
        },
        gameStats,
        recentScores,
        achievements,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
