# Change Guide (AI)

## Safe Extension Points

- UI text/style updates in `index.html` and `styles.css`
- Additional debug events in `script.js`
- New control bindings that call existing action functions
- Leaderboard display formatting

## Risky Areas

- `collides()` and board bounds checks
- `lockPiece()` / `spawnPiece()` lifecycle
- `gameLoop()` timing and null-piece guards
- Rotation behavior (`rotatePiece()` + kicks)
- Input gating (`canAcceptInput()`, pause/overlay checks)

## Expected Post-Change Validation

After gameplay-related edits, manually verify:

1. Start game, piece falls visually
2. Move left/right, rotate CW/CCW
3. Soft drop increments score
4. Hard drop locks and spawns new piece
5. Hold works once per active piece
6. Pause/resume works from desktop and mobile controls
7. Touch controls and gestures work on mobile viewport
8. Mobile Next preview is visible above the active play area during gameplay
9. Game over modal appears and restart path works

## Local Verification Commands

- Syntax check: `node --check script.js`
- Review changed files: `git status --short`
