# Design System: Pixel Playground — Mini Games Arcade

## 1. Visual Theme & Atmosphere

The Pixel Playground arcade embodies a **Neo-Retro Flat with Depth** aesthetic — a deliberate fusion of clean modern flat design with nostalgic pixel art accents and bold geometric color blocking. The overall atmosphere is **dark, immersive, and energetic**, evoking the feeling of stepping into a premium indie game launcher rather than a traditional retro arcade. The design is playful and sophisticated simultaneously — fun without being childish, modern without losing its retro soul.

The visual density is **medium-high**: generous whitespace between sections prevents claustrophobia, while vibrant accent colors and animated background elements maintain visual energy. Floating blurred gradient orbs drift slowly across the dark canvas, creating a subtle sense of depth and life. The dark base acts as a stage, letting the triadic accent palette and pixel art imagery take center stage.

The design philosophy can be summarized as: **"A midnight arcade reimagined by a modern design studio."**

## 2. Color Palette & Roles

The color system is built on a **dark charcoal foundation** with three vibrant **triadic accent colors** that rotate across game cards and UI elements. All colors are defined in OKLCH color space for perceptual uniformity.

### Foundation Colors

| Color Name | Value | Role |
|---|---|---|
| **Midnight Canvas** | `oklch(0.13 0.02 280)` / ~#1a1a2e | Primary background in dark mode. The stage upon which all content performs. Deep enough to make accents pop without being pure black. |
| **Deep Void** | `oklch(0.12 0.02 280)` / ~#151528 | Darkest surface, used for the deepest background layer and button text on mint/coral accents. |
| **Charcoal Surface** | `oklch(0.18 0.025 280)` / ~#252540 | Card backgrounds and elevated surfaces. Slightly lighter than the canvas to create subtle layering. Also used for the game tutorial overlay cards. |
| **Slate Muted** | `oklch(0.5 0.02 280)` / ~#6b6b80 | Muted text, secondary labels, and de-emphasized UI elements. |
| **Soft Frost** | `oklch(0.95 0.005 280)` / ~#f0f0f5 | Primary foreground text in dark mode. Near-white with a cool tint for readability. |

### Accent Colors (Triadic System)

| Color Name | Value | Role |
|---|---|---|
| **Electric Indigo** | `oklch(0.55 0.25 275)` / ~#6C63FF | Primary brand accent. Used for the PIXELPLAY logo highlight, primary actions, navigation hover states, and the "Puzzle" / "Endless" / "Shooter" game category cards. Conveys intelligence and depth. |
| **Coral Flame** | `oklch(0.7 0.2 25)` / ~#FF6B6B | Secondary accent for energy and urgency. Used for the "Addictive" / "Action" / "Brain" game cards, the game count badge, settings icon hover, and destructive states. Conveys warmth and excitement. |
| **Mint Breeze** | `oklch(0.75 0.14 175)` / ~#4ECDC4 | Tertiary accent for freshness and reward. Used for "Classic" / "Strategy" / "Reflex" game cards, achievement badges, and positive feedback states. Conveys calm energy and success. |

### Badge Colors

| Color Name | Approximate Value | Role |
|---|---|---|
| **New Green** | `#22c55e` (Tailwind green-500) | "NEW" badge background on recently added game cards. Paired with white text and a spring-bounce entrance animation. |
| **Hot Orange** | `#f97316` (Tailwind orange-500) | "HOT" badge background on popular game cards (5+ leaderboard plays). Paired with white text and a pulse animation. |

### Light Mode Overrides

In light mode, the foundation inverts: backgrounds become near-white (`oklch(0.97 0.005 280)`), cards become pure white (`oklch(0.99 0.002 280)`), and foreground text becomes the dark charcoal. Accent colors remain identical, ensuring brand consistency across themes.

### Color Assignment Strategy

Each game card is assigned one of the three accent colors in a rotating pattern (mint → coral → indigo → repeat), creating visual rhythm across the grid. The color assignment also extends to card borders (30% opacity at rest, 60% on hover), tag badge backgrounds (20% opacity), "Play" button fills, text glow effects on game page titles, and card hover glow box-shadows.

## 3. Typography Rules

The typography system uses a **dual-font pairing** that bridges the retro-modern divide:

### Display Font: Silkscreen
- **Family:** "Silkscreen", monospace (Google Fonts)
- **Weights used:** 400 (Regular), 700 (Bold)
- **Role:** All headings, game titles, navigation brand text, category tags, filter tabs, and any text that should feel "arcade-authentic"
- **Character:** Blocky pixel-grid letterforms that immediately signal "retro gaming." Used sparingly and intentionally — never for body text or long-form content.
- **Sizing:** Ranges from 10px (mobile tags) to 48px (hero title on desktop). Always uppercase via content convention.
- **Applied via:** `.font-pixel` utility class → `font-family: "Silkscreen", monospace`

### Body Font: Outfit
- **Family:** "Outfit", sans-serif (Google Fonts)
- **Weights used:** 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold), 900 (Black)
- **Role:** All body text, descriptions, UI labels, buttons, form inputs, and any text requiring readability
- **Character:** Modern geometric sans-serif with friendly rounded terminals. Feels contemporary and approachable — the perfect counterbalance to Silkscreen's rigid pixel grid.
- **Applied via:** Global `body` rule → `font-family: "Outfit", sans-serif`

### Typography Hierarchy

| Element | Font | Weight | Size (Mobile → Desktop) |
|---|---|---|---|
| Hero Title | Silkscreen | 400 | 18px → 48px |
| Section Headings | Silkscreen | 400 | 16px → 20px |
| Game Card Titles | Silkscreen | 400 | 14px → 20px |
| Category Filter Tabs | Silkscreen | 400 | 11px → 13px |
| Category Tags | Silkscreen | 400 | 10px → 12px |
| Nav Brand | Silkscreen | 400 | 14px → 18px |
| Body / Descriptions | Outfit | 400 | 11px → 14px |
| Button Labels | Outfit | 600 | 10px → 14px |
| Muted Labels | Outfit | 400 | 10px → 12px |
| Tutorial Controls | Outfit | 500 | 12px → 14px |

## 4. Component Stylings

### Buttons
- **Shape:** Subtly rounded corners (`rounded-md` to `rounded-lg`, ~6-8px radius). Never pill-shaped, never sharp.
- **Primary (Play buttons):** Solid fill using the parent card's accent color (mint, coral, or indigo). Text is dark (`arcade-darker`) for mint/coral, white for indigo. Includes a right-arrow icon that translates right on hover.
- **Secondary (Nav icons):** 28-32px square with 1px border at 50% opacity. Transparent background. Icon color transitions to the associated accent on hover, with border color following.
- **Interaction:** `whileTap={{ scale: 0.97 }}` spring compression. No outline focus rings — uses color-shift focus indicators.

### Cards (Game Cards)
- **Corner Roundness:** Gently rounded (`rounded-lg` to `rounded-xl`, 8-12px). More rounded on desktop, slightly tighter on mobile.
- **Background:** `bg-card` semantic token — charcoal surface in dark mode, white in light mode.
- **Border:** 1px solid using the card's accent color at 30% opacity. Intensifies to 60% on hover.
- **Shadow / Glow:** No shadow at rest. On hover, a colored glow box-shadow appears: `0 0 30px {accent}/15%, 0 4px 20px black/30%`. This creates a "neon sign turning on" effect.
- **Image Area:** Top portion (112px mobile → 192px desktop) with `object-cover` and a gradient overlay fading from card background upward. Image scales to 110% on hover with a 500ms transition.
- **Content Area:** 12-20px padding. Title → description (2-line clamp) → play button stack.
- **Favorite Star:** Positioned absolute top-right of the card image area. Heart icon with accent color fill when active, semi-transparent when inactive. Includes a scale bounce on toggle.
- **Badges:** "NEW" (green, spring animation) and "HOT" (orange, pulse animation) badges positioned absolute top-left of the card image area with rounded-full pill shape.

### Search Bar
- **Structure:** Full-width input with a search icon on the left and a clear button (X) on the right when text is present.
- **Background:** `bg-card` with 1px border at `border-border/50` opacity.
- **Typography:** Outfit, placeholder text in muted-foreground.
- **Border radius:** `rounded-lg` for soft corners.
- **Focus state:** Ring highlight using the primary accent color.

### Category Filter Tabs
- **Structure:** Horizontal scrollable row of pill-shaped buttons below the search bar.
- **Active state:** Solid accent-colored background (indigo) with white text.
- **Inactive state:** Transparent background with muted border and muted-foreground text.
- **Font:** Silkscreen for the arcade aesthetic, uppercase text.
- **Special tab:** "FAVS" tab with a star icon prefix, only visible to authenticated users.

### Navigation Bar
- **Structure:** Sticky top bar with `backdrop-blur-md` and semi-transparent background (`bg-background/60`). Bottom border at 50% opacity.
- **Height:** ~48px mobile, ~56px desktop.
- **Left:** Brand logo (Gamepad2 icon in indigo-tinted square + PIXELPLAY text). Right: Icon button row (Leaderboard, Achievements, Profile, Settings).
- **Game pages:** Simplified nav with back arrow, game title in accent color, and condensed icon row.

### Game Tutorial Overlay
- **Background:** Full-screen semi-transparent black overlay (`bg-black/60`) with backdrop blur.
- **Card:** Explicit dark background (`bg-[#1e1e38]`) with indigo-tinted border. Max-width 420px, centered.
- **Sections:** Three collapsible sections — Desktop Controls, Mobile Controls, Tips — each with a colored icon header (indigo, coral, mint respectively).
- **Controls display:** Keyboard keys rendered as inline `<kbd>` elements with dark background and subtle border.
- **Dismiss:** "GOT IT" button with indigo fill. Also dismissible via ESC, Enter, or backdrop click.
- **Persistence:** Seen-state stored in localStorage per game. Only shows on first visit.

### Game Over Overlay
- **Background:** Semi-transparent black (`bg-black/70`) covering the full game canvas.
- **Content:** Centered white text with Silkscreen font. "GAME OVER" as large heading, score display, and action buttons.
- **Buttons:** Accent-colored solid fills matching the game's assigned color.
- **Share Score:** Expandable share button row with Twitter/X, Facebook, and Copy Link options. Animated slide-in transition with staggered delays.

### Share Score Component
- **Trigger:** "SHARE" button with Share2 icon in accent color.
- **Expanded state:** Three icon buttons (Twitter/X blue, Facebook blue, Copy link in accent) that slide in with staggered animation.
- **Copy feedback:** "Copied!" text replaces the copy icon briefly with a check mark.
- **Share text:** Includes game name, score, emoji, and a high score indicator when applicable.

### Score Display Bar
- **Structure:** Horizontal bar above the game canvas showing Score, Best Score, and game-specific stats.
- **Typography:** Silkscreen for labels, Outfit for numeric values.
- **Background:** Transparent or subtle accent tint at 10% opacity.

### Settings Page
- **Structure:** Vertical stack of setting sections within a GameLayout wrapper.
- **Sections:** Theme toggle (Light/Dark/System), Sound settings (SFX/Music volume sliders), Reset Tutorial section.
- **Reset Tutorial:** Grid of game cards showing tutorial seen-state with individual reset buttons and a "Reset All" option.

## 5. Layout Principles

### Grid System
- **Homepage game grid:** `grid-cols-2` on mobile, `grid-cols-2` on tablet (sm), `grid-cols-3` on desktop (lg). Gap scales from 12px → 16px → 24px.
- **Container:** Max-width 1280px on desktop, centered with auto margins. Horizontal padding: 16px mobile → 24px tablet → 32px desktop.

### Whitespace Strategy
- **Section spacing:** 16px → 32px → 48px vertical padding scaling from mobile to desktop.
- **Card internal padding:** 12px → 16px → 20px.
- **Nav padding:** 12px → 16px vertical.
- **Philosophy:** Generous but not wasteful. Whitespace increases proportionally with screen size — mobile is tighter to maximize content density on small screens.

### Responsive Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| Base (mobile) | < 640px | 2-column grid, compact cards, smaller fonts, touch-optimized controls |
| sm (tablet) | >= 640px | 2-column grid, larger card images, expanded padding |
| md | >= 768px | Intermediate sizing adjustments |
| lg (desktop) | >= 1024px | 3-column grid, full-size hero, maximum whitespace |

### Game Canvas Sizing
- **Mobile:** Canvas scales to `min(calc(100vw - 2rem), calc(100vh - 10rem))` — fills available viewport minus nav and controls.
- **Desktop:** Canvas scales up to `min(700px, calc(100vh - 10rem), calc(100vw - 4rem))` — significantly larger than mobile but capped to prevent overflow.
- **Pixel rendering:** `image-rendering: pixelated; image-rendering: crisp-edges` for authentic retro canvas rendering.

### Section Dividers
- **Hero to Grid:** No explicit divider — the hero's bottom gradient blends into the background.
- **Grid to Footer:** Subtle 1px top border at 30% opacity with 24-32px margin above.

## 6. Animation & Motion

### Philosophy
Motion is **spring-based and playful** — elements feel bouncy and alive, as if eager to be interacted with. Animations are never gratuitous; they serve to guide attention, provide feedback, and reinforce the arcade personality.

### Animation Catalog

| Element | Trigger | Animation | Library |
|---|---|---|---|
| Background orbs | Continuous | Slow drift (x/y oscillation over 20-25s) | framer-motion |
| Game cards (entrance) | Page load | Staggered fade-up (0.1s delay between cards, 40px y-offset) | framer-motion variants |
| Game cards (hover) | Mouse enter | `scale: 1.02` spring | framer-motion whileHover |
| Game cards (tap) | Click/touch | `scale: 0.97` compression | framer-motion whileTap |
| Card image (hover) | Mouse enter | `scale: 1.1` over 500ms | CSS transition |
| Card glow (hover) | Mouse enter | Opacity 0 → 1 over 500ms | CSS transition |
| Play arrow (hover) | Card hover | `translateX: 4px` | CSS transition |
| Hero title | Page load | Fade-up from 20px offset, 0.6s duration, 0.2s delay | framer-motion |
| Section heading | Page load | Slide-in from left (-20px), 0.4s delay | framer-motion |
| NEW badge | Card mount | Spring bounce (`scale: 0 → 1`, type: spring, stiffness: 500) | framer-motion |
| HOT badge | Continuous | Pulse animation (`scale: 1 → 1.1 → 1`, 2s loop) | framer-motion |
| Favorite star | Toggle | Scale bounce (`1 → 1.3 → 1`, 300ms) | framer-motion |
| Share buttons | Expand | Staggered slide-in from left with opacity fade, 50ms delay per button | framer-motion |
| Tutorial overlay | Mount | Fade-in backdrop + scale-up card from 95% | CSS transition |
| Search clear button | Text present | Fade-in with slight scale | CSS transition |

### Sound Design
All games integrate a **Web Audio API-based sound engine** generating procedural 8-bit sounds:
- **Score/collect:** Short ascending bleep
- **Game over:** Descending tone sequence
- **Start game:** Ascending fanfare
- **Hit/bounce:** Quick percussive blip
- **Background music:** Procedural chiptune loops (toggleable)
- Volume controlled globally via Settings page sliders

## 7. Theming Architecture

The design supports **switchable dark/light themes** via a CSS class strategy:

- **Dark mode (default):** `.dark` class on the root element. Deep charcoal backgrounds, light foreground text, full accent vibrancy.
- **Light mode:** No class modifier. Near-white backgrounds, dark foreground text, same accent colors.
- **Persistence:** Theme choice stored in `localStorage` and applied on page load.
- **Toggle:** Available in Settings page with Sun/Moon/Monitor icons for Light/Dark/System.

All semantic colors (`--background`, `--foreground`, `--card`, etc.) are defined as CSS custom properties in both `:root` (light) and `.dark` (dark) scopes, ensuring every component automatically adapts.

## 8. Iconography

- **Icon library:** Lucide React (consistent stroke-based icons)
- **Icon sizing:** 14-20px depending on context (nav icons: 14-16px, feature icons: 16-20px)
- **Icon style:** 1.5px stroke weight, rounded joins — matches Outfit's friendly geometry
- **Key icons:** Gamepad2 (brand), Trophy (leaderboard), Award (achievements), User (profile), Settings (gear), Zap (game count), ArrowLeft (back navigation), Heart (favorites), Star (favorites tab), Share2 (social sharing), Flame (HOT badge), Sparkles (NEW badge), Search (search bar), X (clear/close)

## 9. Feature Components

### Favorites System
- **Database-backed:** Favorites stored in a `favorites` table with user-game association.
- **Star toggle:** Heart icon on each game card, positioned over the card image. Filled accent color when favorited, semi-transparent outline when not.
- **Filter tab:** "FAVS" tab in the category filter row, only visible to authenticated users. Shows favorited games or an empty state with a message prompting the user to star games.
- **Optimistic updates:** Star toggle uses tRPC optimistic mutations for instant feedback.

### Game Tutorials
- **First-play overlay:** Shows on first visit to each game. Dismissed via button, ESC, Enter, or backdrop click.
- **Content:** Desktop controls (keyboard shortcuts), mobile controls (touch gestures), and gameplay tips.
- **Persistence:** Seen-state stored in `localStorage` with key pattern `tutorial_seen_{gameId}`.
- **Reset:** Available in Settings page — individual game reset or "Reset All" button.

### Social Sharing
- **Platforms:** Twitter/X, Facebook, and clipboard copy.
- **Context-aware:** Share text includes game name, score, and game-specific details (level, wave, moves, etc.).
- **High score indicator:** Adds a trophy emoji and "NEW HIGH SCORE!" text when the player beats their personal best.

### Leaderboard & Achievements
- **Leaderboard:** Per-game score rankings with player names and timestamps.
- **Achievements:** Unlockable badges for gameplay milestones (first game, high scores, streaks, etc.).
- **Profile:** Player statistics, achievement showcase, and game history.
