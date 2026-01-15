# Text Simplifier

A Chrome extension to simplify complex text for easier understanding.

## Features

- **Three Simplification Levels**: Light, Medium, and Heavy
- **Word Replacement**: Complex words replaced with simpler alternatives
- **Grade Level Analysis**: Shows reading level before and after
- **Change Tracking**: See all word substitutions made
- **Copy Function**: Easy copy to clipboard
- **Character/Word Count**: Track input text length

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension's directory

## Usage

1. Click the extension icon to open the popup
2. Paste or type complex text in the input area
3. Select simplification level
4. Click "Simplify Text"
5. View simplified text and analysis
6. Copy result if needed

## Simplification Levels

### Light
- Basic word replacements
- Minimal changes

### Medium
- More word substitutions
- Sentence breaking at conjunctions

### Heavy
- Maximum simplification
- Jargon removal
- Sentence restructuring

## Analysis Metrics

- **Original Grade Level**: Flesch-Kincaid grade level
- **Simplified Grade Level**: Post-simplification grade
- **Words Simplified**: Number of replacements
- **Reduction**: Word count change percentage

## File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.css` - Styles with dark theme
- `popup.js` - Simplification logic
- `README.md` - Documentation

## Permissions

- `storage` - Save preferences
