# Final Challenge

The ultimate mini-game collection featuring four different challenge modes to test your skills.

## Games Included

### Reaction Test
Test your reflexes - click when the box turns green as fast as possible.

### Memory Match
Classic memory card game - find all matching pairs in minimum moves.

### Quick Math
Solve arithmetic problems quickly - addition, subtraction, and multiplication.

### Sequence
Simon-style pattern memory - repeat increasingly long color sequences.

## Features

- Four unique mini-games in one extension
- Combined scoring system across all games
- Best score tracking
- Dark gradient theme with colorful game buttons
- Persistent storage for all scores

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder

## Files

- `manifest.json` - Extension configuration
- `popup.html` - Game interface
- `popup.css` - Dark theme styling
- `popup.js` - All game logic

## Storage

Uses `chrome.storage.local` to save:
- `finalChallengeTotal` - Cumulative score across all games
- `finalChallengeBest` - Best single game score
