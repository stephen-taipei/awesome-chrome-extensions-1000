# Tab Search

Fast tab search with fuzzy matching, regex support, and keyboard navigation.

## Features

- **Fuzzy Search**: Find tabs even with partial or misspelled queries
- **Regex Support**: Use regular expressions for advanced pattern matching
- **Exact Search**: Match exact text in title or URL
- **Keyboard Navigation**: Navigate and switch tabs without using mouse
- **Domain Filter**: Filter tabs by website domain
- **Window Filter**: Filter tabs by browser window
- **Live Results**: Instant search results as you type
- **Smart Ranking**: Results sorted by relevance score

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension folder
4. The Tab Search icon will appear in your toolbar

## Usage

### Opening Tab Search
- Click the extension icon in the toolbar
- Or use keyboard shortcut: `Ctrl+Shift+F` (Windows/Linux) or `Cmd+Shift+F` (Mac)

### Search Modes
1. **Fuzzy Mode** (default): Matches characters in sequence, tolerates typos
2. **Exact Mode**: Finds exact substring matches
3. **Regex Mode**: Use regular expression patterns

Toggle between modes by clicking the mode button or checking the `.*` checkbox.

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `↑` / `↓` | Navigate through results |
| `Enter` | Switch to selected tab |
| `Ctrl+Delete` | Close selected tab |
| `Escape` | Close popup |

### Search Tips
- Start typing to filter tabs instantly
- Use domain filter to narrow down to specific websites
- Use window filter when working with multiple browser windows
- Enable case-sensitive search with the `Aa` toggle

## Examples

| Query | Mode | Matches |
|-------|------|---------|
| `gmail` | Fuzzy | Gmail, any URL with "gmail" |
| `^https://github` | Regex | URLs starting with https://github |
| `\.pdf$` | Regex | URLs ending with .pdf |
| `react docs` | Fuzzy | "React Documentation", "ReactJS Docs" |

## Permissions

| Permission | Purpose |
|------------|---------|
| `tabs` | Read tab titles and URLs for searching |
| `storage` | Save search preferences |

## Technical Details

- **Manifest Version**: 3
- **Search Algorithm**: Custom fuzzy matching with relevance scoring
- **Word boundary bonus**: Matches at start of words score higher
- **Consecutive match bonus**: Sequential character matches score higher

## Privacy

- All searches are performed locally
- No data is sent to external servers
- No analytics or tracking

## License

MIT License - Feel free to modify and distribute.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
