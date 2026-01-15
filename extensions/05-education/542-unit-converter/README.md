# Unit Converter

A Chrome extension for converting between common units of length, weight, and temperature.

## Features

- **Length Conversion**: Convert between meters, kilometers, centimeters, millimeters, miles, yards, feet, and inches
- **Weight Conversion**: Convert between kilograms, grams, milligrams, pounds, ounces, and metric tons
- **Temperature Conversion**: Convert between Celsius, Fahrenheit, and Kelvin
- **History Tracking**: Keeps track of recent conversions
- **Dark Theme**: Modern dark interface

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension folder

## Usage

1. Click the extension icon in your browser toolbar
2. Select the conversion type (Length, Weight, or Temp)
3. Enter the value to convert
4. Select the source and target units
5. Click "Convert" to see the result

## Supported Units

### Length
- Meters (m)
- Kilometers (km)
- Centimeters (cm)
- Millimeters (mm)
- Miles (mi)
- Yards (yd)
- Feet (ft)
- Inches (in)

### Weight
- Kilograms (kg)
- Grams (g)
- Milligrams (mg)
- Pounds (lb)
- Ounces (oz)
- Metric Tons

### Temperature
- Celsius (°C)
- Fahrenheit (°F)
- Kelvin (K)

## Storage

Uses `chrome.storage.local` to persist conversion history across sessions.
