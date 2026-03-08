# Rendering and Loop (AI)

## Rendering Entry Point

`drawBoard()` is responsible for full-frame canvas drawing.

Draw order:
1. Clear game canvas
2. Draw locked board cells
3. Draw ghost piece (alpha)
4. Draw active piece
5. Draw grid lines
6. Draw pause overlay text if paused

## Preview Rendering

`drawPreviews()` updates:

- desktop next piece canvas
- mobile next piece canvas (small panel above board on mobile viewport)
- hold piece canvas

`drawPreview(ctx, type)` centers a piece in the preview panel.

## Frame Loop

`gameLoop(timestamp)`:

1. Computes elapsed frame time
2. Advances gravity timer (`dropAccumulator`) if active piece exists
3. Applies repeated gravity drops while accumulator exceeds interval
4. Locks and respawns piece when downward movement fails
5. Calls `drawBoard()`
6. Requests the next frame

## Timing Behavior

- Drop interval starts at `1000ms` and scales by `SPEED_MULTIPLIER (0.9)` per level.
- Level progression affects gravity speed.

## Known Critical Guard

Any lock/merge path must not run when `currentPiece` is `null`.
This is already guarded in `lockPiece()` and loop gating.
