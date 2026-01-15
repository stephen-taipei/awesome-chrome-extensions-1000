# Reading Speed Trainer

A Chrome extension to test and improve your reading speed with timed exercises.

## Features

- **Speed Testing**: Measure your words per minute (WPM)
- **Three Difficulty Levels**: Easy, Medium, and Hard
- **Comprehension Questions**: Verify understanding after reading
- **Progress Tracking**: Track average WPM, best WPM, and tests completed
- **Timed Reading**: Accurate timing with visual display
- **Personalized Feedback**: Performance-based messages

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension's directory

## Usage

1. Click the extension icon to open the popup
2. Select a difficulty level
3. Click "Start Reading Test"
4. Press "Start" when ready to begin
5. Read the passage at your normal pace
6. Click "Done" when finished
7. Answer comprehension questions
8. View your results and WPM score

## Difficulty Levels

- **Easy**: Simple vocabulary, short sentences
- **Medium**: Mixed content, moderate complexity
- **Hard**: Complex text, academic vocabulary

## Reading Speed Benchmarks

- 300+ WPM: Excellent (above average)
- 200-299 WPM: Good (average adult speed)
- 150-199 WPM: Below average
- Under 150 WPM: Developing reader

## File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.css` - Styles with dark theme
- `popup.js` - Reading test logic and passages
- `README.md` - Documentation

## Permissions

- `storage` - Save reading statistics
