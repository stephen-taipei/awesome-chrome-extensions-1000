# Shape Fit

A shape matching game where you select shapes and fit them into their matching holes before time runs out.

## Features

- Match colorful shape emojis to their holes
- Timed gameplay (30 seconds)
- Progressive difficulty with more holes as score increases
- Decoy shapes to add challenge
- High score tracking with persistent storage

## How to Play

1. Click "Start Game" to begin
2. Click a shape from the bottom panel to select it
3. Click the matching hole at the top to place it
4. Complete all matches for bonus points
5. Beat the clock and set a high score

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
- `shapeFitBest` - Highest score achieved
