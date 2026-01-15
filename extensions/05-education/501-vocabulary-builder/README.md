# Vocabulary Builder

A Chrome extension for learning vocabulary using flash cards with spaced repetition.

## Features

- **Flash Card System**: Create and study vocabulary flash cards
- **Spaced Repetition**: Smart scheduling based on your performance
- **Progress Tracking**: Track total cards, mastered cards, and due reviews
- **Examples Support**: Add usage examples to reinforce learning
- **Review Quality Rating**: Rate your recall as Again, Hard, Good, or Easy
- **Persistent Storage**: All cards saved locally

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension's directory

## Usage

1. Click the extension icon to open the popup
2. Click "Add Card" to create new vocabulary cards
3. Enter the word, definition, and optional example
4. Click "Study Now" to review due cards
5. Click the card to flip and reveal the definition
6. Rate your recall to schedule the next review

## Spaced Repetition Algorithm

- **Again**: Reset to level 0, review in 1 hour
- **Hard**: Decrease level, shorter interval
- **Good**: Increase level, longer interval
- **Easy**: Increase level by 2, much longer interval

## File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.css` - Styles with dark theme
- `popup.js` - Flash card and spaced repetition logic
- `README.md` - Documentation

## Permissions

- `storage` - Save vocabulary cards locally
