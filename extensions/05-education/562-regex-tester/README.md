# Regex Tester

A Chrome extension to test and validate regular expressions with real-time matching.

## Features

- Real-time regex testing and validation
- Support for all regex flags (g, i, m, s, u, y)
- Visual highlighting of matches
- Match count and index display
- Quick patterns for common use cases
- Pattern history for quick access
- Syntax error display
- Dark theme interface

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this extension folder

## Usage

1. Click the extension icon to open the popup
2. Enter your regex pattern between the slashes
3. Add flags as needed (g for global, i for case-insensitive, etc.)
4. Enter test text in the textarea
5. See matches highlighted in real-time
6. Use quick patterns for common regex needs

## Quick Patterns

- Email addresses
- URLs
- Phone numbers
- ZIP codes
- Hex colors
- Dates

## Storage

Pattern history is stored locally using Chrome's storage API.

## Permissions

- `storage`: For saving pattern history
