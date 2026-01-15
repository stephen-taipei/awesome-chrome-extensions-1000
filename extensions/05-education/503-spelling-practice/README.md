# Spelling Practice

A Chrome extension to practice spelling words with audio and visual hints.

## Features

- **Audio Pronunciation**: Hear words spoken aloud
- **Visual Hints**: Get hints for first letter, word length, or vowels
- **Definition Hints**: Learn word meanings while practicing
- **Progress Tracking**: Track correct answers, attempts, and accuracy
- **Custom Word Lists**: Add your own words to practice
- **Instant Feedback**: See correct spelling immediately

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension's directory

## Usage

1. Click the extension icon to open the popup
2. Click "New Word" to get a word to spell
3. Use the speaker icon to hear pronunciation
4. Type your answer and click "Check"
5. Use hint buttons if you need help

## Hint System

- **First Letter**: Reveals the first letter
- **Word Length**: Shows the number of letters
- **Show Vowels**: Reveals all vowels in the word

## Managing Words

1. Click "Manage Word List" at the bottom
2. View all words in your practice list
3. Add new words with definitions
4. Delete words you no longer need

## File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.css` - Styles with dark theme
- `popup.js` - Spelling practice logic
- `README.md` - Documentation

## Permissions

- `storage` - Save word lists and statistics
