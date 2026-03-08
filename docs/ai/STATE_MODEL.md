# State Model (AI)

## Core State Variables

Defined in `script.js`:

- `board`: `ROWS x COLS` grid of `null | pieceType`
- `currentPiece`: active falling piece or `null`
- `pieceQueue`: queue of upcoming piece types
- `holdType`: held piece type or `null`
- `canHold`: hold availability flag for current turn
- `score`, `linesCleared`, `level`
- `isPaused`, `isOver`
- `dropAccumulator`, `lastFrameTime`
- `playerName`, `pendingSaveScore`
- `debugMode`
- Mobile input state: `repeatState`, `gestureState`

## Piece Object Shape

Active pieces are plain objects:

- `type`: one of `I O T S Z J L`
- `rotation`: integer `0..3`
- `x`, `y`: board offsets

## Core Invariants

- Board dimensions are fixed by `COLS=10`, `ROWS=20`.
- `board[y][x]` is either `null` or a valid piece type key.
- `currentPiece` may be `null` before game start or after reset, but game loop movement logic must guard for null.
- `canHold` resets to `true` after each spawn and is consumed after a hold action.
- Level is capped by `MAX_LEVEL`.

## State Transition Flow

1. Start/restart -> `resetGameState()`
2. `spawnPiece()` creates active piece from queue
3. Input/gravity updates `currentPiece` position/rotation
4. Collision on downward move -> `lockPiece()`
5. `mergePiece()` into board
6. `clearLines()` updates score/lines/level
7. `spawnPiece()` next active piece
8. If spawn collides -> `triggerGameOver()`

## Scoring Rules

- Soft drop: `+1` per successful manual step
- Hard drop: `+2` per dropped row
- Line clear (base): 1=`100`, 2=`300`, 3=`500`, 4=`800`
- Clear score multiplied by current level

