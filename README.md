# WPM Reading Time

Calculate reading time for selected text in Obsidian based on your custom words per minute (WPM) presets.

## Features

- Calculate reading time for selected text based on customizable WPM presets
- Create multiple reading speed presets (e.g., "My Reading Time", "My Speaking Time")
- Switch between presets using an intuitive dropdown menu
- View reading time in a dedicated sidebar panel
- Quick access to settings via gear icon in dropdown

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
3. The reading time will be displayed in a sidebar panel
4. Use the dropdown to switch between different reading speed presets

## Settings

Configure your reading speed presets in **Settings → WPM Reading Time Settings**:

- **Add multiple presets**: Create custom presets like "My Reading Time" (250 WPM), "My Speaking Time" (200 WPM), etc.
- **Preset name**: Give each preset a descriptive name
- **Reading speed (WPM)**: Set words per minute for each preset
- **Default preset**: Choose which preset is selected by default
- Quick access to settings is also available via the gear icon (⚙️) in the dropdown menu

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
