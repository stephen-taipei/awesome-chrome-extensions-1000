# Math Solver

A Chrome extension for solving basic linear and quadratic equations.

## Features

- **Linear Equations**: Solve equations in the form ax + b = c
- **Quadratic Equations**: Solve equations in the form ax² + bx + c = 0
- **Complex Roots**: Handles imaginary solutions for negative discriminants
- **History Tracking**: Keeps track of your recent calculations
- **Dark Theme**: Easy on the eyes with a modern dark interface

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension folder

## Usage

1. Click the extension icon in your browser toolbar
2. Select equation type (Linear or Quadratic)
3. Enter the coefficients
4. Click "Solve" to get the solution

## Equation Types

### Linear: ax + b = c
- Enter values for a, b, and c
- Solution: x = (c - b) / a

### Quadratic: ax² + bx + c = 0
- Uses the quadratic formula
- Handles real and complex roots
- Shows discriminant-based solutions

## Storage

Uses `chrome.storage.local` to persist calculation history across sessions.
