# Debugging Guide (AI)

## Enable Debug Mode

- Press `D` on keyboard, or
- Click/tap the `Debug: Off` / `Debug: On` button

Logs appear in browser console with prefix:

- `[TetrisDebug]`

## Logged Event Names

From gameplay:

- `spawnPiece`
- `movePiece`
- `moveBlocked`
- `rotatePiece`
- `rotateBlocked`
- `lockPiece`
- `hardDrop`
- `softDropScored`
- `holdCurrentPiece`
- `triggerGameOver`

Keyboard diagnostics:

- `keydown` entries are emitted when debug mode is enabled

## First Checks for Regressions

1. Input works but visuals do not update:
   - confirm no runtime error in console
   - check loop/lock null guards
2. Controls ignored:
   - verify overlay/start modal state
   - verify `playerName` is set
3. Mobile controls flaky:
   - verify `touch-action: none`
   - verify pointer events are firing
4. Piece behavior wrong:
   - inspect collision and rotation kick logic

