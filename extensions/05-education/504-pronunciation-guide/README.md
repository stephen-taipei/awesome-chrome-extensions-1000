# Pronunciation Guide

A Chrome extension to show pronunciation symbols and audio for words.

## Features

- **IPA Transcription**: View International Phonetic Alphabet notation
- **Audio Pronunciation**: Hear words spoken with adjustable speed
- **Syllable Breakdown**: See how words are divided into syllables
- **Phonetic Breakdown**: Understand each sound in a word
- **Pronunciation Tips**: Get helpful tips for tricky words
- **IPA Reference Chart**: Quick reference for vowel and consonant sounds
- **Search History**: Quick access to recently looked up words

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension's directory

## Usage

1. Click the extension icon to open the popup
2. Enter a word in the search box
3. View IPA transcription, syllables, and phonetic breakdown
4. Click the speaker icon to hear pronunciation
5. Adjust speech speed using the slider
6. Click IPA symbols to hear example words

## IPA Reference

The extension includes reference charts for:
- **Vowels**: iː, ɪ, e, æ, ɑː, ɒ, ɔː, ʊ, uː, ʌ, ɜː, ə
- **Consonants**: p, b, t, d, k, g, f, v, θ, ð, s, z, ʃ, ʒ, tʃ, dʒ

## File Structure

- `manifest.json` - Extension configuration
- `popup.html` - Main popup interface
- `popup.css` - Styles with dark theme
- `popup.js` - Pronunciation lookup and speech synthesis
- `README.md` - Documentation

## Permissions

- `storage` - Save search history
