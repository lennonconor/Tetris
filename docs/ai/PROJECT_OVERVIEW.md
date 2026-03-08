# Project Overview (AI)

## Purpose

This repository is a browser Tetris game implemented with plain HTML, CSS, and JavaScript. There is no build system or framework.

## Runtime Model

- UI and game board are declared in `index.html`.
- Styling and responsive/mobile layout are in `styles.css`.
- All game logic, rendering, and input handling are in `script.js`.
- The app runs entirely client-side in the browser.

## Key Features Implemented

- Classic 10x20 Tetris board
- 7-bag piece randomization
- Piece movement, rotation (with simple wall kicks), soft drop, hard drop
- Hold piece and next-piece preview
- Score/lines/level progression
- Pause/resume and restart
- Local leaderboard via `localStorage`
- Desktop keyboard controls
- Mobile controls (buttons + gestures)
- Debug logging mode

## Main Game Loop

`requestAnimationFrame(gameLoop)` runs continuously.

Per frame:
1. Compute `delta` time
2. If active (`!isPaused && !isOver && currentPiece`) accumulate drop time
3. Apply gravity steps based on `getDropInterval()`
4. Lock piece if downward movement fails
5. Draw board/piece/ghost/grid overlay

## Important Files

- `index.html`: DOM structure, canvases, modals, desktop/mobile controls
- `styles.css`: desktop/mobile layout, panel styles, touch-related CSS (`touch-action`)
- `script.js`: game state, piece physics, rendering, input mapping, leaderboard, debug

