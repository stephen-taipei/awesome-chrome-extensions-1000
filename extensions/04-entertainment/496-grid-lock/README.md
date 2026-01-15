# Grid Lock

A sliding block puzzle where you move blocks to free the key block and reach the exit.

## Features

- Classic rush-hour style puzzle gameplay
- Multiple levels with increasing difficulty
- Drag blocks horizontally or vertically
- Move counter to track efficiency
- Level progress saved automatically

## How to Play

1. The red key block must reach the exit on the right
2. Drag blocks to slide them in their allowed direction
3. Horizontal blocks slide left/right only
4. Vertical blocks slide up/down only
5. Clear a path for the key block to exit

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
- `gridLockLevel` - Current level progress
