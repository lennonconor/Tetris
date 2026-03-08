# Input Map (AI)

## Keyboard Controls

- `ArrowLeft` -> `movePiece(-1, 0)`
- `ArrowRight` -> `movePiece(1, 0)`
- `ArrowDown` -> `softDrop()`
- `ArrowUp` -> `rotatePiece(1)`
- `z` / `Z` -> `rotatePiece(-1)`
- `Space` / `" "` / `Spacebar` -> `hardDrop()`
- `c` / `C` -> `holdCurrentPiece()`
- `p` / `P` -> `togglePause()`
- `d` / `D` -> `toggleDebugMode()`

## Mobile Buttons

- Left button -> repeat `movePiece(-1, 0)`
- Right button -> repeat `movePiece(1, 0)`
- Soft drop button -> repeat `softDrop()`
- Rotate CW button -> single `rotatePiece(1)`
- Rotate CCW button -> single `rotatePiece(-1)`
- Hard drop button -> single `hardDrop()`
- Hold button -> single `holdCurrentPiece()`
- Pause button -> single `togglePause()`

## Mobile Gesture Controls (on game canvas)

- Tap -> rotate clockwise
- Swipe left/right -> move left/right
- Swipe down -> hard drop
- Swipe up -> rotate counter-clockwise

## Input Timing / Threshold Constants

- `REPEAT_DELAY_MS = 170`
- `REPEAT_INTERVAL_MS = 70`
- `GESTURE_TAP_MAX_DISTANCE = 12`
- `GESTURE_SWIPE_MIN_DISTANCE = 24`

## Input Guard Conditions

Most actions are ignored when:

- no `playerName` (game not started)
- start overlay is active
- `isOver` is true
- `isPaused` is true (except pause toggles)

