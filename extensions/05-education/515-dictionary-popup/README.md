# Dictionary Popup

A Chrome extension for quick dictionary lookup of word definitions.

## Features

- **Quick Lookup**: Fast word definition search
- **Phonetic Pronunciation**: IPA notation for each word
- **Multiple Definitions**: Grouped by part of speech
- **Example Sentences**: Usage examples for context
- **Audio Pronunciation**: Hear words spoken aloud
- **Save Words**: Build a personal vocabulary list
- **Search History**: Quick access to recent lookups
- **Copy Function**: Copy definitions to clipboard

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension's directory

## Usage

1. Click the extension icon to open the popup
2. Type a word in the search box
3. Press Enter or click "Look Up"
4. View phonetics and definitions
5. Click the speaker to hear pronunciation
6. Star words to save them

## Available Words

The built-in dictionary includes:
- hello, world, language, learn
- knowledge, study, education
- vocabulary, practice, understand

## Features Detail

- **Parts of Speech**: Definitions grouped by noun, verb, etc.
- **Examples**: Real usage examples in italics
- **Save System**: Star words to save for later
- **History**: Last 10 searches remembered

## File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.css` - Styles with dark theme
- `popup.js` - Dictionary data and lookup logic
- `README.md` - Documentation

## Permissions

- `storage` - Save words and history
