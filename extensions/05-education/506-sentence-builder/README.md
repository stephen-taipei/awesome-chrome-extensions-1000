# Sentence Builder

A Chrome extension to practice grammar by constructing sentences from words.

## Features

- **Interactive Word Tiles**: Click to arrange words into sentences
- **Three Difficulty Levels**: Easy, Medium, and Hard
- **Scoring System**: Earn points based on difficulty
- **Streak Tracking**: Build consecutive correct answers
- **Level Progression**: Advance levels with streaks
- **Hint System**: Get grammatical structure hints

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension's directory

## Usage

1. Click the extension icon to open the popup
2. Select your difficulty level
3. Click words from the word bank to build a sentence
4. Click words in the sentence zone to remove them
5. Click "Check" to verify your answer
6. Use "New Sentence" for a fresh challenge

## Difficulty Levels

- **Easy**: Simple sentences with basic structure
- **Medium**: Compound sentences and verb tenses
- **Hard**: Complex sentences with clauses

## Scoring

- Easy sentences: 10 points
- Medium sentences: 20 points
- Hard sentences: 30 points
- Level up every 5 correct answers in a row

## File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.css` - Styles with dark theme
- `popup.js` - Game logic and sentence database
- `README.md` - Documentation

## Permissions

- `storage` - Save scores and progress
