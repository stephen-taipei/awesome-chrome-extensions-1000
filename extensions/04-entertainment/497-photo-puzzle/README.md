# Photo Puzzle

A jigsaw-style puzzle game where you arrange emoji pieces to match the target pattern.

## Features

- 3x3 grid with themed emoji patterns
- Multiple pattern themes (flowers, fruits, animals, etc.)
- Click to swap pieces
- Visual feedback for correctly placed pieces
- Move counter with best score tracking

## How to Play

1. View the target pattern in the preview
2. Click a piece to select it
3. Click another piece to swap positions
4. Arrange all pieces to match the pattern
5. Complete in as few moves as possible

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder

## Files

- `manifest.json` - Extension configuration
- `popup.html` - Game interface
- `popup.css` - Dark theme styling
- `popup.js` - Game logic

## Storage

Uses `chrome.storage.local` to save:
- `photoPuzzleBest` - Fewest moves to solve
