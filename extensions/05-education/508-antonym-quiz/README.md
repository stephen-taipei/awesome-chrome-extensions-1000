# Antonym Quiz

A Chrome extension to match words with their antonyms in fun quizzes.

## Features

- **Three Game Modes**: Match, Quiz, and Speed Round
- **Match Game**: Connect words with their antonyms
- **Quiz Mode**: Multiple choice antonym questions
- **Speed Round**: Answer as many as possible in 30 seconds
- **High Score Tracking**: Beat your personal best
- **35+ Word Pairs**: Extensive antonym database

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension's directory

## Game Modes

### Match Game
- Match 5 pairs of words with their antonyms
- Click a word, then click its antonym
- Wrong matches show visual feedback
- 20 points per correct match

### Quiz Mode
- 10 multiple choice questions
- Choose the correct antonym from 4 options
- 10 points per correct answer

### Speed Round
- 30 seconds on the clock
- Answer as quickly as possible
- 10 points per correct answer
- Race against time!

## Scoring

- Match Game: 20 points per pair
- Quiz Mode: 10 points per question
- Speed Round: 10 points per answer

## File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.css` - Styles with dark theme
- `popup.js` - Game logic and antonym pairs
- `README.md` - Documentation

## Permissions

- `storage` - Save high scores
