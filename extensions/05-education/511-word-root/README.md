# Word Root Explorer

A Chrome extension to learn word roots, prefixes, and origins to expand vocabulary.

## Features

- **Three Categories**: Roots, Prefixes, and Suffixes
- **Etymology Info**: Greek and Latin origins
- **Example Words**: See how roots are used in words
- **Highlighted Roots**: Root parts are highlighted in examples
- **Progress Tracking**: Mark roots as learned
- **Search Function**: Find specific roots quickly
- **Navigation**: Browse through all entries

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension's directory

## Usage

1. Click the extension icon to open the popup
2. Select category: Roots, Prefixes, or Suffixes
3. Browse entries using navigation buttons
4. Click "Random" for a random entry
5. Mark entries as learned to track progress
6. Search for specific roots

## Categories

### Roots (12 entries)
- bio, graph, phon, aud, vis/vid
- dict, ject, port, scrib/script
- chron, geo, therm

### Prefixes (10 entries)
- un-, re-, pre-, mis-, anti-
- auto-, bi-, sub-, trans-, inter-

### Suffixes (10 entries)
- -tion/-sion, -able/-ible, -ful, -less
- -ment, -ness, -ly, -ology, -er/-or, -ist

## File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.css` - Styles with dark theme
- `popup.js` - Root data and interaction logic
- `README.md` - Documentation

## Permissions

- `storage` - Save learning progress
