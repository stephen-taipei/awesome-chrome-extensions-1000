# Letter Drop

A fast-paced word game where you catch falling letters to spell target words.

## Features

- Letters fall from top of screen
- Catch letters in order to spell words
- Color-coded letters (green = needed, yellow = part of word)
- Progressive difficulty
- High score tracking with persistent storage

## How to Play

1. Click "Start Game" to begin
2. A target word appears at the top
3. Click falling letters to catch them
4. Catch letters in the correct order to spell the word
5. Complete words for bonus points
6. Avoid clicking wrong letters

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
- `letterDropBest` - Highest score achieved
