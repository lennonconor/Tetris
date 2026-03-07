const COLS = 10;
const ROWS = 20;
const BLOCK = 30;
const PREVIEW_BLOCK = 24;
const MAX_LEVEL = 20;
const LINES_PER_LEVEL = 15;
const BASE_DROP_MS = 1000;
const SPEED_MULTIPLIER = 0.9;
const LEADERBOARD_KEY = "tetrisLeaderboardV1";

const PIECES = {
  I: {
    color: "#22d3ee",
    rotations: [
      [[0, 1], [1, 1], [2, 1], [3, 1]],
      [[2, 0], [2, 1], [2, 2], [2, 3]],
      [[0, 2], [1, 2], [2, 2], [3, 2]],
      [[1, 0], [1, 1], [1, 2], [1, 3]],
    ],
  },
  O: {
    color: "#facc15",
    rotations: [
      [[1, 0], [2, 0], [1, 1], [2, 1]],
      [[1, 0], [2, 0], [1, 1], [2, 1]],
      [[1, 0], [2, 0], [1, 1], [2, 1]],
      [[1, 0], [2, 0], [1, 1], [2, 1]],
    ],
  },
  T: {
    color: "#a78bfa",
    rotations: [
      [[1, 0], [0, 1], [1, 1], [2, 1]],
      [[1, 0], [1, 1], [2, 1], [1, 2]],
      [[0, 1], [1, 1], [2, 1], [1, 2]],
      [[1, 0], [0, 1], [1, 1], [1, 2]],
    ],
  },
  S: {
    color: "#4ade80",
    rotations: [
      [[1, 0], [2, 0], [0, 1], [1, 1]],
      [[1, 0], [1, 1], [2, 1], [2, 2]],
      [[1, 1], [2, 1], [0, 2], [1, 2]],
      [[0, 0], [0, 1], [1, 1], [1, 2]],
    ],
  },
  Z: {
    color: "#f87171",
    rotations: [
      [[0, 0], [1, 0], [1, 1], [2, 1]],
      [[2, 0], [1, 1], [2, 1], [1, 2]],
      [[0, 1], [1, 1], [1, 2], [2, 2]],
      [[1, 0], [0, 1], [1, 1], [0, 2]],
    ],
  },
  J: {
    color: "#60a5fa",
    rotations: [
      [[0, 0], [0, 1], [1, 1], [2, 1]],
      [[1, 0], [2, 0], [1, 1], [1, 2]],
      [[0, 1], [1, 1], [2, 1], [2, 2]],
      [[1, 0], [1, 1], [0, 2], [1, 2]],
    ],
  },
  L: {
    color: "#fb923c",
    rotations: [
      [[2, 0], [0, 1], [1, 1], [2, 1]],
      [[1, 0], [1, 1], [1, 2], [2, 2]],
      [[0, 1], [1, 1], [2, 1], [0, 2]],
      [[0, 0], [1, 0], [1, 1], [1, 2]],
    ],
  },
};

const SCORE_BY_CLEAR = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

const gameCanvas = document.getElementById("gameCanvas");
const nextCanvas = document.getElementById("nextCanvas");
const holdCanvas = document.getElementById("holdCanvas");
const gameCtx = gameCanvas.getContext("2d");
const nextCtx = nextCanvas.getContext("2d");
const holdCtx = holdCanvas.getContext("2d");

const scoreLabel = document.getElementById("scoreLabel");
const linesLabel = document.getElementById("linesLabel");
const levelLabel = document.getElementById("levelLabel");
const playerNameLabel = document.getElementById("playerNameLabel");
const leaderboardList = document.getElementById("leaderboardList");

const overlay = document.getElementById("overlay");
const startModal = document.getElementById("startModal");
const gameOverModal = document.getElementById("gameOverModal");
const playerNameInput = document.getElementById("playerNameInput");
const startBtn = document.getElementById("startBtn");
const gameOverText = document.getElementById("gameOverText");
const saveScoreBtn = document.getElementById("saveScoreBtn");
const skipSaveBtn = document.getElementById("skipSaveBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const debugBtn = document.getElementById("debugBtn");

let board = createBoard();
let playerName = "";
let score = 0;
let linesCleared = 0;
let level = 1;
let isPaused = false;
let isOver = false;
let dropAccumulator = 0;
let lastFrameTime = 0;
let holdType = null;
let canHold = true;
let pendingSaveScore = 0;
let debugMode = false;

let pieceQueue = [];
let currentPiece = null;

function describePiece(piece = currentPiece) {
  if (!piece) {
    return null;
  }
  return {
    type: piece.type,
    rotation: piece.rotation,
    x: piece.x,
    y: piece.y,
  };
}

function debugLog(eventName, extra = {}) {
  if (!debugMode) {
    return;
  }
  console.log("[TetrisDebug]", eventName, { piece: describePiece(), ...extra });
}

function toggleDebugMode() {
  debugMode = !debugMode;
  debugBtn.textContent = `Debug: ${debugMode ? "On" : "Off"}`;
  console.log("[TetrisDebug]", `Debug mode ${debugMode ? "enabled" : "disabled"}`);
}

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function getDropInterval() {
  return BASE_DROP_MS * Math.pow(SPEED_MULTIPLIER, level - 1);
}

function clonePiece(piece) {
  return {
    type: piece.type,
    rotation: piece.rotation,
    x: piece.x,
    y: piece.y,
  };
}

function getCells(piece) {
  const shape = PIECES[piece.type].rotations[piece.rotation];
  return shape.map(([dx, dy]) => [piece.x + dx, piece.y + dy]);
}

function collides(piece) {
  const cells = getCells(piece);
  return cells.some(([x, y]) => {
    if (x < 0 || x >= COLS || y >= ROWS) {
      return true;
    }
    if (y < 0) {
      return false;
    }
    return board[y][x] !== null;
  });
}

function mergePiece(piece) {
  const cells = getCells(piece);
  for (const [x, y] of cells) {
    if (y >= 0) {
      board[y][x] = piece.type;
    }
  }
}

function clearLines() {
  let cleared = 0;
  for (let y = ROWS - 1; y >= 0; y -= 1) {
    if (board[y].every((cell) => cell !== null)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      cleared += 1;
      y += 1;
    }
  }

  if (cleared > 0) {
    linesCleared += cleared;
    const base = SCORE_BY_CLEAR[cleared] || 0;
    score += base * level;
    level = Math.min(MAX_LEVEL, Math.floor(linesCleared / LINES_PER_LEVEL) + 1);
    updateHud();
  }
}

function makeBag() {
  const types = Object.keys(PIECES);
  for (let i = types.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }
  return types;
}

function ensureQueue() {
  while (pieceQueue.length < 5) {
    pieceQueue.push(...makeBag());
  }
}

function spawnPiece() {
  ensureQueue();
  const type = pieceQueue.shift();
  const piece = {
    type,
    rotation: 0,
    x: 3,
    y: -1,
  };

  if (collides(piece)) {
    triggerGameOver();
    return;
  }

  currentPiece = piece;
  canHold = true;
  drawPreviews();
  debugLog("spawnPiece", { queueNext: pieceQueue[0] || null });
}

function movePiece(dx, dy) {
  if (!currentPiece || isPaused || isOver) {
    return false;
  }

  const moved = clonePiece(currentPiece);
  moved.x += dx;
  moved.y += dy;
  if (!collides(moved)) {
    currentPiece = moved;
    debugLog("movePiece", { dx, dy });
    return true;
  }
  debugLog("moveBlocked", { dx, dy });
  return false;
}

function rotatePiece(direction) {
  if (!currentPiece || isPaused || isOver) {
    return;
  }

  const rotated = clonePiece(currentPiece);
  rotated.rotation = (rotated.rotation + direction + 4) % 4;

  const kicks = [0, -1, 1, -2, 2];
  for (const offset of kicks) {
    const test = clonePiece(rotated);
    test.x += offset;
    if (!collides(test)) {
      currentPiece = test;
      debugLog("rotatePiece", { direction, kick: offset });
      return;
    }
  }
  debugLog("rotateBlocked", { direction });
}

function lockPiece() {
  if (!currentPiece) {
    return;
  }
  debugLog("lockPiece");
  mergePiece(currentPiece);
  clearLines();
  spawnPiece();
}

function hardDrop() {
  if (!currentPiece || isPaused || isOver) {
    return;
  }
  let distance = 0;
  while (movePiece(0, 1)) {
    distance += 1;
  }
  score += distance * 2;
  updateHud();
  debugLog("hardDrop", { distance });
  lockPiece();
  dropAccumulator = 0;
}

function softDrop() {
  if (movePiece(0, 1)) {
    score += 1;
    updateHud();
    debugLog("softDropScored", { score });
  }
}

function holdCurrentPiece() {
  if (!currentPiece || !canHold || isPaused || isOver) {
    return;
  }

  const oldType = holdType;
  holdType = currentPiece.type;

  if (oldType) {
    currentPiece = {
      type: oldType,
      rotation: 0,
      x: 3,
      y: -1,
    };
    if (collides(currentPiece)) {
      triggerGameOver();
      return;
    }
  } else {
    spawnPiece();
  }

  canHold = false;
  drawPreviews();
  debugLog("holdCurrentPiece", { holdType, swappedWith: oldType || null });
}

function getGhostPiece() {
  if (!currentPiece) {
    return null;
  }
  const ghost = clonePiece(currentPiece);
  while (!collides({ ...ghost, y: ghost.y + 1 })) {
    ghost.y += 1;
  }
  return ghost;
}

function drawCell(ctx, x, y, color, size, alpha = 1) {
  const px = x * size;
  const py = y * size;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(px + 1, py + 1, size - 2, size - 2);
  ctx.restore();
}

function drawBoard() {
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      if (board[y][x]) {
        drawCell(gameCtx, x, y, PIECES[board[y][x]].color, BLOCK);
      }
    }
  }

  const ghost = getGhostPiece();
  if (ghost) {
    for (const [x, y] of getCells(ghost)) {
      if (y >= 0) {
        drawCell(gameCtx, x, y, PIECES[ghost.type].color, BLOCK, 0.2);
      }
    }
  }

  if (currentPiece) {
    for (const [x, y] of getCells(currentPiece)) {
      if (y >= 0) {
        drawCell(gameCtx, x, y, PIECES[currentPiece.type].color, BLOCK);
      }
    }
  }

  gameCtx.strokeStyle = "#1f2937";
  gameCtx.lineWidth = 1;
  for (let x = 0; x <= COLS; x += 1) {
    gameCtx.beginPath();
    gameCtx.moveTo(x * BLOCK, 0);
    gameCtx.lineTo(x * BLOCK, ROWS * BLOCK);
    gameCtx.stroke();
  }
  for (let y = 0; y <= ROWS; y += 1) {
    gameCtx.beginPath();
    gameCtx.moveTo(0, y * BLOCK);
    gameCtx.lineTo(COLS * BLOCK, y * BLOCK);
    gameCtx.stroke();
  }

  if (isPaused && !isOver) {
    gameCtx.fillStyle = "rgba(0, 0, 0, 0.6)";
    gameCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    gameCtx.fillStyle = "#e5e7eb";
    gameCtx.font = "bold 30px sans-serif";
    gameCtx.textAlign = "center";
    gameCtx.fillText("Paused", gameCanvas.width / 2, gameCanvas.height / 2);
  }
}

function drawPreview(ctx, type) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (!type) {
    return;
  }

  const shape = PIECES[type].rotations[0];
  const minX = Math.min(...shape.map(([x]) => x));
  const maxX = Math.max(...shape.map(([x]) => x));
  const minY = Math.min(...shape.map(([, y]) => y));
  const maxY = Math.max(...shape.map(([, y]) => y));
  const pieceWidth = (maxX - minX + 1) * PREVIEW_BLOCK;
  const pieceHeight = (maxY - minY + 1) * PREVIEW_BLOCK;

  const offsetX = (ctx.canvas.width - pieceWidth) / 2 - minX * PREVIEW_BLOCK;
  const offsetY = (ctx.canvas.height - pieceHeight) / 2 - minY * PREVIEW_BLOCK;

  for (const [x, y] of shape) {
    ctx.fillStyle = PIECES[type].color;
    ctx.fillRect(
      offsetX + x * PREVIEW_BLOCK + 1,
      offsetY + y * PREVIEW_BLOCK + 1,
      PREVIEW_BLOCK - 2,
      PREVIEW_BLOCK - 2
    );
  }
}

function drawPreviews() {
  drawPreview(nextCtx, pieceQueue[0]);
  drawPreview(holdCtx, holdType);
}

function updateHud() {
  scoreLabel.textContent = String(score);
  linesLabel.textContent = String(linesCleared);
  levelLabel.textContent = String(level);
  playerNameLabel.textContent = playerName || "-";
}

function loadLeaderboard() {
  const raw = localStorage.getItem(LEADERBOARD_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((item) => item && typeof item.name === "string" && typeof item.score === "number")
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch {
    return [];
  }
}

function saveLeaderboard(entries) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries.slice(0, 10)));
}

function renderLeaderboard() {
  const entries = loadLeaderboard();
  leaderboardList.innerHTML = "";

  if (entries.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No scores yet";
    leaderboardList.appendChild(li);
    return;
  }

  entries.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${entry.name} - ${entry.score}`;
    leaderboardList.appendChild(li);
  });
}

function addScoreToLeaderboard(name, value) {
  const entries = loadLeaderboard();
  entries.push({ name, score: value, at: Date.now() });
  entries.sort((a, b) => b.score - a.score);
  saveLeaderboard(entries);
  renderLeaderboard();
}

function showStartModal() {
  overlay.classList.add("visible");
  startModal.classList.remove("hidden");
  gameOverModal.classList.add("hidden");
}

function showGameOverModal() {
  overlay.classList.add("visible");
  startModal.classList.add("hidden");
  gameOverModal.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.remove("visible");
}

function triggerGameOver() {
  isOver = true;
  pendingSaveScore = score;
  gameOverText.textContent = `${playerName}, your score is ${score}.`;
  debugLog("triggerGameOver", { score });
  showGameOverModal();
}

function resetGameState() {
  board = createBoard();
  score = 0;
  linesCleared = 0;
  level = 1;
  isPaused = false;
  isOver = false;
  dropAccumulator = 0;
  lastFrameTime = 0;
  holdType = null;
  canHold = true;
  pieceQueue = [];
  currentPiece = null;
  ensureQueue();
  spawnPiece();
  updateHud();
  drawBoard();
}

function gameLoop(timestamp) {
  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }

  const delta = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  if (!isPaused && !isOver && currentPiece) {
    dropAccumulator += delta;
    const interval = getDropInterval();

    while (dropAccumulator >= interval) {
      dropAccumulator -= interval;
      if (!movePiece(0, 1)) {
        lockPiece();
        break;
      }
    }
  }

  drawBoard();
  requestAnimationFrame(gameLoop);
}

function togglePause() {
  if (isOver || !playerName) {
    return;
  }
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";
}

function restartGame() {
  if (!playerName) {
    showStartModal();
    return;
  }
  hideOverlay();
  resetGameState();
  pauseBtn.textContent = "Pause";
  gameCanvas.focus();
}

function handleKey(event) {
  if (!playerName || (overlay.classList.contains("visible") && !startModal.classList.contains("hidden"))) {
    return;
  }

  const key = event.key;
  if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " ", "Space", "Spacebar", "z", "Z", "c", "C", "p", "P", "d", "D"].includes(key)) {
    event.preventDefault();
  }
  if (debugMode) {
    console.log("[TetrisDebug]", "keydown", key);
  }

  if (key === "d" || key === "D") {
    toggleDebugMode();
    return;
  }

  if (key === "p" || key === "P") {
    togglePause();
    return;
  }

  if (isPaused || isOver) {
    return;
  }

  switch (key) {
    case "ArrowLeft":
      movePiece(-1, 0);
      break;
    case "ArrowRight":
      movePiece(1, 0);
      break;
    case "ArrowDown":
      softDrop();
      break;
    case "ArrowUp":
      rotatePiece(1);
      break;
    case "z":
    case "Z":
      rotatePiece(-1);
      break;
    case " ":
    case "Space":
    case "Spacebar":
      hardDrop();
      break;
    case "c":
    case "C":
      holdCurrentPiece();
      break;
    default:
      break;
  }
}

startBtn.addEventListener("click", () => {
  const name = playerNameInput.value.trim();
  if (!name) {
    playerNameInput.focus();
    return;
  }

  playerName = name;
  hideOverlay();
  resetGameState();
  pauseBtn.textContent = "Pause";
  gameCanvas.focus();
});

saveScoreBtn.addEventListener("click", () => {
  addScoreToLeaderboard(playerName, pendingSaveScore);
  hideOverlay();
  resetGameState();
});

skipSaveBtn.addEventListener("click", () => {
  hideOverlay();
  resetGameState();
});

pauseBtn.addEventListener("click", togglePause);
restartBtn.addEventListener("click", restartGame);
debugBtn.addEventListener("click", toggleDebugMode);
playerNameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    startBtn.click();
  }
});
window.addEventListener("keydown", handleKey);

renderLeaderboard();
showStartModal();
updateHud();
requestAnimationFrame(gameLoop);
