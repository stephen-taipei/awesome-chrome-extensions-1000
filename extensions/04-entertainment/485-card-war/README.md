# Card War

A classic card game where the higher card wins each round.

## Features
- Draw cards against the CPU
- Higher card value wins the round
- Track rounds won throughout the game
- Total wins persistence with chrome.storage.local
- Dark theme with gradient styling

## How to Play
1. Click "Draw Card" to draw
2. Both you and CPU reveal a card
3. Higher card wins the round
4. Play through the deck
5. Most rounds won = game winner

## Card Values
- 2-10: Face value
- J, Q, K: 11, 12, 13
- A: 14 (highest)

## Installation
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder

## Files
- manifest.json - Extension configuration
- popup.html - Game structure
- popup.css - Dark theme styling
- popup.js - Card game logic
