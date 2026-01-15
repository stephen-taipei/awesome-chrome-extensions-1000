# Translation Helper

A Chrome extension for quick translation of common phrases.

## Features

- **Four Languages**: English, Spanish, French, and German
- **Language Swap**: Quick swap source and target languages
- **Common Phrases**: Pre-built phrase categories
- **Audio Pronunciation**: Hear translations spoken
- **Copy Function**: Copy translations to clipboard
- **Translation History**: Access recent translations

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension's directory

## Usage

1. Click the extension icon to open the popup
2. Select source and target languages
3. Type or select a phrase
4. Click "Translate" or press Enter
5. Listen or copy the translation

## Phrase Categories

### Greetings
- Hello, Good morning, Good night
- How are you?, Nice to meet you, Goodbye

### Travel
- Where is...?, How much does it cost?
- Train station, Airport, Hotel

### Dining
- Menu please, Water please
- The check please, I am vegetarian

### Emergency
- Help!, Call the police
- I need a doctor, Hospital

## Languages Supported

- English (en)
- Spanish (es)
- French (fr)
- German (de)

## File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.css` - Styles with dark theme
- `popup.js` - Translation data and logic
- `README.md` - Documentation

## Permissions

- `storage` - Save translation history
