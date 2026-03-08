# Tetris

A browser-based Tetris game built with vanilla HTML, CSS, and JavaScript.

## Overview

This project implements a playable Tetris experience with:

- Classic 10x20 board
- Piece rotation and movement
- Soft drop and hard drop
- Hold piece and next piece preview
- Score, lines, and level tracking
- Pause/resume and restart
- Local leaderboard (stored in browser `localStorage`)
- Debug mode toggle for input/state logging

## Controls

- `Left Arrow`: Move left
- `Right Arrow`: Move right
- `Down Arrow`: Soft drop
- `Up Arrow`: Rotate clockwise
- `Z`: Rotate counter-clockwise
- `Space`: Hard drop
- `C`: Hold piece
- `P`: Pause/resume
- `D`: Toggle debug logs

## Running Locally

No build step is required.

1. Clone the repository.
2. Open `index.html` in a browser.

For best compatibility, use a current Chromium, Firefox, or Safari release.

## Project Structure

- `index.html`: Game layout and UI elements
- `styles.css`: Visual styling
- `script.js`: Game logic, rendering, controls, and leaderboard handling

## Debug Mode

Debug mode can be toggled with the `D` key or the on-screen Debug button.
When enabled, gameplay events are logged in the browser console under the `[TetrisDebug]` prefix.

## Future Improvements

- Mobile touch controls
- Sound effects and music
- Better rotation kick system parity
- Optional persistent player profiles
- CI checks and automated browser tests

## License

No license has been specified yet. Add a `LICENSE` file if you want to define reuse terms.
