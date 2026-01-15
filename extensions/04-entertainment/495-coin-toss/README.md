# Coin Toss

A simple yet addictive guessing game where you predict coin toss outcomes and build winning streaks.

## Features

- Animated coin flip with visual feedback
- Track your current streak and best streak
- Visual history of recent tosses
- Persistent streak and history tracking
- Gold and silver themed dark interface

## How to Play

1. Click "HEADS" or "TAILS" to make your guess
2. Watch the coin flip animation
3. Build consecutive correct guesses for streaks
4. Try to beat your best streak record

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
- `coinTossBest` - Longest winning streak
- `coinHistory` - Recent toss results
