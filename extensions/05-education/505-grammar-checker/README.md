# Grammar Checker

A Chrome extension for basic grammar tips and common error detection.

## Features

- **Error Detection**: Find common grammar and spelling mistakes
- **Suggestions**: Get helpful correction suggestions
- **Issue Categories**: Errors, warnings, and style improvements
- **Grammar Tips**: Learn about common errors, punctuation, and style
- **Character Count**: Track text length while typing

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension's directory

## Usage

1. Click the extension icon to open the popup
2. Enter or paste text in the input area
3. Click "Check Grammar" to analyze
4. Review issues and suggestions
5. Reference grammar tips at the bottom

## Detected Issues

### Errors
- Their/there/they're confusion
- Your/you're confusion
- Its/it's confusion
- Effect/affect misuse
- Common spelling errors (alot, definately, seperate)
- "Could of" instead of "could have"

### Warnings
- Redundant phrases (very unique, past history)
- Capitalization issues

### Style
- Wordy phrases (at this point in time, in order to)
- Multiple spaces

## File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.css` - Styles with dark theme
- `popup.js` - Grammar checking logic
- `README.md` - Documentation

## Permissions

- `storage` - Save preferences
