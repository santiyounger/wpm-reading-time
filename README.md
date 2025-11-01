# How Long to Read (Reading Time WPM)

A powerful Obsidian plugin that calculates reading time for selected text based on customizable words per minute (WPM) presets. Perfect for writers, editors, and anyone who wants to know how long it takes to read their content.

## Features

- 📊 **Calculate reading time** - Instantly see how long it takes to read selected text
- 🎯 **Multiple presets** - Create custom reading speed presets (e.g., "My Reading Time", "My Speaking Time", "Slow Reader")
- 🔄 **Easy switching** - Switch between presets with an intuitive dropdown menu
- 📝 **Detailed information** - View reading time, word count, and reading speed all in one place
- ⚙️ **Quick settings access** - Open settings directly from the dropdown menu via gear icon
- 📱 **Mobile compatible** - Works on both desktop and mobile Obsidian apps
- 🎨 **Beautiful UI** - Clean, modern interface that matches Obsidian's design

## Installation

### From Community Plugins (Recommended)

1. Open Obsidian
2. Go to **Settings → Community plugins**
3. Make sure "Safe mode" is **off**
4. Click **Browse** and search for "How Long to Read (Reading Time WPM)"
5. Click **Install**, then **Enable**

### Manual Installation

1. Download the latest release from the [Releases page](https://github.com/yourusername/obsidian-plugin-wpm-time/releases)
2. Extract the ZIP file
3. Copy the following files to your vault:
   - `main.js`
   - `manifest.json`
   - `styles.css` (if included)
4. Navigate to: `.obsidian/plugins/wpm-time/`
5. Paste the files into this folder
6. Reload Obsidian (Ctrl/Cmd + R or restart the app)
7. Go to **Settings → Community plugins** and enable "How Long to Read (Reading Time WPM)"

## Usage

### Basic Usage

1. **Select text** in any note that you want to analyze
2. Open the **Command Palette** (Ctrl/Cmd + P)
3. Type and select **"Calculate reading time"**
4. A sidebar panel will appear showing:
   - Reading time (formatted as "X minutes & Y seconds" or "X seconds")
   - Word count
   - Current preset speed and name

### Switching Presets

- Click the dropdown button showing your current preset
- Select a different preset from the list
- The reading time will automatically update based on the new preset's speed

### Quick Settings Access

- Click the **⚙️ Settings** option at the bottom of the preset dropdown
- This will open the plugin settings tab where you can manage your presets

## Settings

Access settings via **Settings → Community plugins → How Long to Read (Reading Time WPM)**, or click the gear icon in the dropdown menu.

### Default Preset

Choose which preset should be selected by default when calculating reading time. This saves your preference for future calculations.

### Reading Speed Presets

Create and manage multiple reading speed presets. Each preset has:

- **Preset name** - A descriptive name (e.g., "My Reading Time", "My Speaking Time", "Slow Reader", "Fast Reader")
- **Reading speed (WPM)** - Words per minute for this preset

#### Default Presets

The plugin comes with two default presets:
- **My Reading Time**: 250 WPM (average silent reading speed)
- **My Speaking Time**: 200 WPM (average speaking/reading aloud speed)

#### Adding a New Preset

1. Click **"Add Preset"** button in the settings
2. Enter a name for your preset
3. Set the WPM (words per minute) value
4. Your new preset will appear in the dropdown menu

#### Editing a Preset

- Click on the preset name or speed field
- Type your changes
- Changes are saved automatically

#### Deleting a Preset

- Click the **"Delete"** button next to the preset
- You must have at least one preset (cannot delete if only one remains)

### Recommended WPM Values

- **Silent reading**: 200-300 WPM (average: 250 WPM)
- **Speaking/Reading aloud**: 150-200 WPM (average: 175 WPM)
- **Slow reading**: 100-150 WPM
- **Fast reading**: 300-400 WPM

## Understanding the Display

When you calculate reading time, you'll see:

```
You'd read this in:
53 seconds
because it's: 87 words long
at a speed of:
100 Words Per Minute
(slow)
```

- **"You'd read this in:"** - The estimated time to read your selected text
- **Time format** - Displays as "X seconds", "X minutes", or "X minutes & Y seconds"
- **Word count** - Total number of words in the selected text
- **Preset info** - Shows the speed (WPM) and preset name being used

## Tips

- **Create presets for different contexts**: Reading silently vs. reading aloud vs. presenting
- **Use descriptive names**: Name your presets clearly so you know when to use each one
- **Adjust speeds based on material**: Technical content may require slower speeds than casual reading
- **Quick calculations**: Select any text and run the command - no need to manually count words

## Troubleshooting

### Plugin doesn't appear in Community plugins

- Make sure you've reloaded Obsidian after installing
- Check that all files (`main.js`, `manifest.json`, `styles.css`) are in the correct folder
- Verify "Safe mode" is turned off in Community plugins settings

### Reading time seems inaccurate

- Adjust your WPM settings in the plugin settings
- Remember that reading speed varies by material (technical vs. casual content)
- Consider creating different presets for different types of content

### Dropdown not working

- Try reloading Obsidian
- Check that you have at least one preset configured
- Verify the plugin is enabled in Settings → Community plugins

### Settings not saving

- Make sure you're not editing preset names to empty values
- Check that WPM values are positive numbers
- Reload the plugin if settings seem stuck

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

This watches for file changes and automatically recompiles the plugin.

### Build

```bash
npm run build
```

Compiles TypeScript to JavaScript and bundles everything into `main.js`.

### Project Structure

```
.
├── main.ts              # Plugin entry point
├── manifest.json        # Plugin manifest
├── styles.css          # Plugin styles
├── src/
│   ├── commands/       # Command implementations
│   ├── ui/             # UI components (views, settings)
│   ├── utils/          # Utility functions
│   ├── settings.ts     # Settings interface
│   └── types.ts        # TypeScript type definitions
```

## Releasing

1. Update the `version` in `manifest.json` (follow Semantic Versioning)
2. Update `versions.json` with the new version mapping to `minAppVersion`
3. Run `npm run build` to create the latest `main.js`
4. Create a GitHub release:
   - Tag name: exactly match the version (e.g., `1.0.0`, no "v" prefix)
   - Upload `main.js`, `manifest.json`, and `styles.css` as release assets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

If you encounter any issues or have feature requests, please open an issue on the GitHub repository.

## Credits

Created by [Santi Younger](https://www.santiyounger.com/)
