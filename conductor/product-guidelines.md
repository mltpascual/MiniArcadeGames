# Product Guidelines — Pixel Playground

## Brand Voice

The Pixel Playground brand voice is **playful, nostalgic, and encouraging**. It evokes the excitement of classic arcades while feeling modern and accessible.

| Attribute | Do | Don't |
|-----------|-----|-------|
| Playful | "Ready to beat your high score?" | "Please submit your score" |
| Encouraging | "Nice run! Try again?" | "You lost. Game over." |
| Concise | "Tap to fly" | "Press the screen to make the bird fly upward" |
| Retro-flavored | "INSERT COIN", "GAME OVER", "NEW HIGH SCORE!" | Generic modern phrasing |

## Terminology

| Term | Usage |
|------|-------|
| Game | Always "game", never "app" or "application" |
| Player | Always "player", never "user" when referring to gameplay |
| Score | Numeric result of a game session |
| High Score | Personal best score for a specific game |
| Leaderboard | Ranked list of top scores |
| Achievement | Unlockable badge earned through gameplay milestones |
| Arcade | The overall collection/hub of games |

## UI Copy Standards

### Game-Over Screen

```
GAME OVER
Score: {score}
Best: {highScore}
[RETRY] [SHARE] [HOME]
```

### Tutorial Overlay

```
HOW TO PLAY
Desktop: {controls}
Mobile: {controls}
Tips: {tips}
[GOT IT, LET'S PLAY!]
```

### Toast Messages

- Success: "Score submitted!" / "Achievement unlocked!"
- Error: "Could not save score. Try again."
- Info: "Feature coming soon"

### Empty States

- No favorites: "No favorites yet. Tap the star on any game to add it here."
- No scores: "No scores yet. Be the first to play!"
- No search results: "No games match your search. Try a different term."

## Error Message Conventions

- Keep under 80 characters
- State what happened, not technical details
- Suggest an action when possible
- Never expose stack traces or error codes to players

## Documentation Style

- Use present tense ("The game renders..." not "The game will render...")
- Use second person for instructions ("Run `pnpm test`" not "One should run...")
- Code examples use TypeScript with proper types
- Tables for structured comparisons, paragraphs for explanations
