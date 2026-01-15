# Percentage Calculator

A Chrome extension for quick percentage calculations covering common scenarios.

## Features

- **X% of Y**: Calculate what percentage of a number equals
- **X is what % of Y**: Find what percentage one number is of another
- **Percentage Change**: Calculate increase or decrease percentage between two values
- **Increase/Decrease by %**: Apply percentage increases or decreases to values
- **History Tracking**: Keeps track of recent calculations
- **Dark Theme**: Modern dark interface

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension folder

## Usage

1. Click the extension icon in your browser toolbar
2. Select the type of percentage calculation you need
3. Enter the values
4. Click "=" to calculate

## Calculation Types

### What is X% of Y?
Find a percentage of a number.
Example: What is 15% of 200? = 30

### X is what % of Y?
Find what percentage one number is of another.
Example: 30 is what % of 200? = 15%

### Percentage Change
Calculate the percentage change from one value to another.
Example: From 100 to 150 = 50% increase

### Increase/Decrease by %
Apply a percentage increase or decrease to a value.
Example: 100 + 20% = 120

## Storage

Uses `chrome.storage.local` to persist calculation history across sessions.
