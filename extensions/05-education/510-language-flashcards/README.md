# Language Flashcards

A Chrome extension for multi-language flashcard vocabulary learning.

## Features

- **5 Languages**: Spanish, French, German, Italian, Japanese
- **4 Categories**: Greetings, Numbers, Colors, Food
- **Spaced Repetition**: Rate cards as Hard, Good, or Easy
- **Audio Pronunciation**: Hear words in the target language
- **Pronunciation Hints**: Phonetic guides for each word
- **Progress Tracking**: Track learned, studying, and mastered words
- **Shuffle & Reset**: Randomize or restart card order

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension's directory

## Usage

1. Click the extension icon to open the popup
2. Select your target language from the dropdown
3. Choose a vocabulary category
4. Click the card or "Flip" to reveal the translation
5. Rate your recall (Hard, Good, Easy)
6. Use navigation buttons to move between cards

## Languages Supported

- Spanish
- French
- German
- Italian
- Japanese (with kanji and hiragana)

## Categories

- **Greetings**: Hello, goodbye, please, thank you
- **Numbers**: One through five
- **Colors**: Red, blue, green, yellow
- **Food**: Water, bread, apple, coffee

## File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.css` - Styles with dark theme
- `popup.js` - Flashcard logic and vocabulary data
- `README.md` - Documentation

## Permissions

- `storage` - Save learning progress
