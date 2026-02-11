# QA Notes v2 — After Adding 3 New Games

## Homepage
- All 6 game cards visible in 3x2 grid: Snake, Flappy Bird, Dino Jump, Tetris, Pong, Space Invaders
- Each card has unique pixel art image, tag, description, and Play button
- Hero banner looks great with pixel art arcade scene
- Nav shows "6 Games" count
- Footer visible

## Tetris (/tetris)
- Canvas renders with grid lines on dark background
- Start overlay shows "TETRIS" title, description, START button
- Score/Lines/Level/High Score bar visible
- Next piece preview canvas on the right
- Mobile touch controls: Left, Down, Right, Rotate, Hard Drop buttons
- Desktop controls hint shown

## Pong (/pong)
- Canvas renders with center line, paddles, and ball glow
- Start overlay shows "PONG" title with "First to 7 wins!" description
- Score display: YOU vs CPU with win counter
- Touch drag controls for mobile paddle movement
- Desktop controls hint shown

## Space Invaders (/space-invaders)
- Canvas renders with starfield background and player ship
- Start overlay shows "SPACE INVADERS" title
- Score/Wave/High Score bar visible
- Mobile touch controls: Left, Shoot, Right buttons
- Desktop controls hint shown

## All Games
- Zero TypeScript errors
- All game pages have back button and home navigation
- All canvases use responsive width with aspect ratio preservation
- Mobile touch controls visible on small screens, hidden on desktop
