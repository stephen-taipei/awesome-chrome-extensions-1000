# Tab Stash

One-click tab stashing to save and restore browsing sessions.

## Features

- **One-Click Stash**: Save all open tabs instantly to free up memory
- **Named Stash Groups**: Organize stashed tabs with custom names
- **Export/Import**: Backup stashes as JSON or HTML bookmark format
- **Auto-Organize**: Tabs are automatically sorted by date
- **Quick Restore**: Restore individual tabs or entire stash groups
- **Drag & Drop**: Reorder tabs within stash groups

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" and select this extension folder
4. The Tab Stash icon will appear in your toolbar

## Usage

### Stashing Tabs
1. Click the extension icon to open the popup
2. Enter a name for your stash group (optional)
3. Click "Stash All Tabs" to save all open tabs
4. Tabs will be closed and saved to the stash

### Restoring Tabs
1. Click on a stash group to expand it
2. Click on individual tabs to restore them
3. Use "Restore All" to open all tabs in a stash group
4. Use "Restore & Delete" to restore and remove from stash

### Managing Stashes
- **Rename**: Click the edit icon to rename a stash group
- **Delete**: Click the trash icon to delete a stash group
- **Export**: Use the export button to save stashes as JSON/HTML

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+S` | Stash all tabs |
| `Enter` | Restore selected tab |
| `Delete` | Delete selected stash |

## Permissions

| Permission | Purpose |
|------------|---------|
| `tabs` | Read and close tabs for stashing |
| `storage` | Store settings and preferences |

Note: Tab data is stored locally using IndexedDB for large dataset support.

## Technical Details

- **Manifest Version**: 3
- **Storage**: IndexedDB for tab data, Chrome Storage for settings
- **Export Formats**: JSON (full backup), HTML (browser bookmarks compatible)

## Privacy

- All data is stored locally on your device
- No data is sent to external servers
- No analytics or tracking

## License

MIT License - Feel free to modify and distribute.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.
