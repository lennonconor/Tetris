# AGENTS.md

## Purpose

This file gives AI/code agents project-specific guidance for working in this repository.

## Project Snapshot

- Stack: plain `HTML/CSS/JavaScript`
- Entry files: `index.html`, `styles.css`, `script.js`
- Runtime: browser only, no bundler/build step
- Primary domain: Tetris gameplay logic + rendering + user input

## Where to Start

1. Read `README.md` for user-facing features and controls.
2. Read `docs/ai/PROJECT_OVERVIEW.md` and `docs/ai/STATE_MODEL.md`.
3. Inspect `script.js` for gameplay behavior changes.

## Change Guidelines

- Keep gameplay logic in `script.js` cohesive; avoid scattering state across files.
- Preserve null guards around `currentPiece` lifecycle paths.
- Maintain both desktop keyboard and mobile touch compatibility.
- Keep input changes consistent with docs in `docs/ai/INPUT_MAP.md`.

## Validation

Before finalizing changes, run:

- `node --check script.js`
- `git status --short`

For gameplay-affecting changes, manually test:

- start/pause/restart flow
- move/rotate/soft drop/hard drop
- hold behavior
- mobile controls and gestures

