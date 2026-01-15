# Maze Gen

Navigate through procedurally generated mazes using keyboard or on-screen controls.

## Features

- Randomly generated mazes using recursive backtracking
- Keyboard controls (WASD or Arrow keys)
- On-screen directional buttons
- Neon-styled visual theme
- Level tracking with persistent storage

## How to Play

1. Use WASD, arrow keys, or click buttons to move
2. Navigate from the green player to the red exit
3. Complete mazes to advance levels
4. Try to minimize your moves

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder

## Files

- `manifest.json` - Extension configuration
- `popup.html` - Game interface
- `popup.css` - Dark neon theme styling
- `popup.js` - Maze generation and game logic

## Storage

Uses `chrome.storage.local` to save:
- `mazeGenLevel` - Number of mazes completed
