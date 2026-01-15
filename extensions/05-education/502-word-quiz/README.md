# Word Quiz

A Chrome extension to test word meanings with multiple choice quizzes.

## Features

- **Multiple Choice Quizzes**: Test your vocabulary knowledge
- **Three Difficulty Levels**: Easy, Medium, and Hard
- **Score Tracking**: Track current score, streak, and high score
- **Instant Feedback**: See correct answers immediately
- **Progress Bar**: Visual quiz progress indicator
- **Persistent High Scores**: Best scores saved locally

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension's directory

## Usage

1. Click the extension icon to open the popup
2. Select your difficulty level (Easy, Medium, or Hard)
3. Click "Start Quiz" to begin
4. Choose the correct definition for each word
5. Track your progress and try to beat your high score

## Word Categories

- **Easy**: Common everyday vocabulary
- **Medium**: Intermediate academic words
- **Hard**: Advanced vocabulary and SAT/GRE words

## Scoring

- Each correct answer adds 1 to your score
- Maintain a streak by answering correctly in a row
- High scores are saved between sessions

## File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.css` - Styles with dark theme
- `popup.js` - Quiz logic and word database
- `README.md` - Documentation

## Permissions

- `storage` - Save high scores locally
