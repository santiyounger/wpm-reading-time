# WPM Reading Time

Calculate reading time for selected text in Obsidian based on your custom words per minute (WPM) settings.

## Features

- Calculate reading time for selected text based on customizable WPM settings
- Separate settings for silent reading speed and speaking/reading aloud speed
- View reading time in a dedicated sidebar panel
- Switch between reading time and speaking time calculations

## Installation

### From Community Plugins

1. Open **Settings → Community plugins**
2. Click **Browse** and search for "WPM Reading Time"
3. Click **Install**, then **Enable**

### Manual Installation

1. Download the latest release from GitHub
2. Extract the files to your vault's `.obsidian/plugins/wpm-time/` folder
3. Reload Obsidian and enable the plugin in **Settings → Community plugins**

## Usage

1. Select any text in your note
2. Run the command **Calculate reading time** from the command palette (Ctrl/Cmd + P)
3. The reading time will be displayed in a sidebar panel with both reading and speaking time estimates

## Settings

Configure your reading speeds in **Settings → WPM Reading Time Settings**:

- **Reading speed (WPM)**: Your silent reading speed in words per minute (default: 250 WPM)
- **Speaking speed (WPM)**: Your speaking/reading aloud speed in words per minute (default: 200 WPM)

## Development

### Prerequisites

- Node.js v16 or higher
- npm

### Setup

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

This will watch for changes and automatically recompile the plugin.

### Build

```bash
npm run build
```

## Releasing

1. Update the `version` in `manifest.json`
2. Update `versions.json` with the new version mapping
3. Create a GitHub release with the version tag (no `v` prefix)
4. Upload `main.js`, `manifest.json`, and `styles.css` as release assets

## License

MIT
