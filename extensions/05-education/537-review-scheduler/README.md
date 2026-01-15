# Review Scheduler

A Chrome extension for spaced repetition scheduling to optimize review sessions.

## Features

- Add topics for spaced repetition review
- SM-2 inspired algorithm for interval calculation
- Rate recall quality (Hard, Good, Easy)
- View due and upcoming reviews
- Track review statistics
- Automatic interval adjustment based on performance

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder

## Usage

1. Click the extension icon
2. Add topics you want to review
3. When due, rate your recall (Hard/Good/Easy)
4. Interval adjusts automatically
5. Review consistently for best retention

## How Spaced Repetition Works

- Hard: Resets interval to 1 day
- Good: Increases interval moderately
- Easy: Increases interval significantly

## Permissions

- `storage`: Save review schedule locally
