# Crystal Match

A classic match-3 puzzle game where you swap adjacent crystals to create matches of 3 or more.

## Features

- 6x6 grid of colorful crystal emojis
- Swap adjacent crystals to match 3 or more
- Cascading matches for combo points
- Persistent high score tracking
- Dark theme with gradient styling

## How to Play

1. Click a crystal to select it
2. Click an adjacent crystal to swap
3. Match 3 or more identical crystals
4. Crystals disappear and new ones fall from above
5. Chain reactions earn bonus points

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
- `crystalBest` - Highest score achieved
