# Number Slide

A classic sliding puzzle game where you arrange numbered tiles in order by sliding them into the empty space.

## Features

- 4x4 grid with 15 numbered tiles
- Slide tiles into the empty space
- Visual feedback for correctly placed tiles
- Move counter with best score tracking
- Dark theme with gradient styling

## How to Play

1. Click a tile adjacent to the empty space to slide it
2. Arrange tiles in order from 1-15
3. The empty space should end in the bottom-right corner
4. Complete the puzzle in as few moves as possible

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
- `slideBest` - Fewest moves to complete puzzle
