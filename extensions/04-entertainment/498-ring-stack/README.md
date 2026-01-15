# Ring Stack

A Tower of Hanoi-style puzzle game where you stack colored rings on the correct peg in size order.

## Features

- Classic stacking puzzle mechanics
- Colorful graduated ring sizes
- Multiple levels with increasing ring counts
- Only smaller rings can be placed on larger ones
- Level progress saved automatically

## How to Play

1. Click a peg to select its top ring
2. Click another peg to move the ring there
3. Smaller rings must go on top of larger ones
4. Stack all rings on the rightmost peg in order
5. Large rings on bottom, small on top

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
- `ringStackLevel` - Current level progress
