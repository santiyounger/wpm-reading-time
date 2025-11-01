# How Long to Read This Text (WPM Reading Time)

**Know exactly how long your notes take to read.**

Stop guessing reading times. How Long to Read calculates estimates for any selected text using your personalized reading speed presets. Useful for writers, content strategists, and knowledge workers who need timing information.

## Who is this for?

### Bloggers & Writers
Know how long your articles will take to read. Useful for optimizing content length and setting reader expectations.

### Content Strategists
Plan your presentations and speeches with confidence. Calculate reading time for speaking presets to nail your timing.

### Knowledge Workers
Estimate how long it takes to review documents, research notes, or any text in your vault.

## Features

### Smart Calculations
Instantly calculates reading time based on word count and your personalized WPM settings. No manual counting needed.

### Multiple Presets
Create multiple presets for different scenarios: silent reading, speaking, slow reading, fast reading, and more. Each preset can have its own custom name and WPM value.

### Easy Preset Switching
Switch between presets via dropdown menu. Useful when you need different speeds for different content types.

### Detailed Analytics
See reading time, word count, and your current reading speed all displayed clearly in one place.

### Cross-Platform
Designed to work on desktop and mobile. Your presets will sync if you use Obsidian Sync.

### Native Design
Matches Obsidian's design language. Feels like a built-in feature.

## Installation

1. Open **Settings → Community plugins**
2. Turn off **Safe mode**
3. Select **Browse** and search for "How Long to Read This Text (WPM Reading Time)"
4. Select **Install**, then **Enable**

## How it works

### 1. Select your text
Highlight any text in your Obsidian note that you want to analyze.

### 2. Run the command
Open **Command Palette** (Ctrl/Cmd + P) and run **"Calculate reading time"**.

### 3. Choose your preset
Select from your custom presets using the dropdown menu. Switch anytime to see different estimates.

### 4. Get instant results
View reading time, word count, and speed information displayed clearly in the sidebar.

## Finding your reading speed

To get the most accurate reading time estimates, you'll want to know your personal reading speed (WPM).

**Need help calculating your WPM?** Use our [companion web app](https://www.santiyounger.com/) to determine your words per minute reading speed. Once you know your WPM number, enter it in the Obsidian plugin settings for accurate, personalized reading time estimates.

## Settings

Access settings via **Settings → Community plugins → How Long to Read This Text (WPM Reading Time)**, or select the gear icon in the dropdown menu.

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

1. Select **"Add Preset"** button in the settings
2. Enter a name for your preset
3. Set the WPM (words per minute) value
4. Your new preset will appear in the dropdown menu

#### Editing a Preset

- Select the preset name or speed field
- Type your changes
- Changes are saved automatically

#### Deleting a Preset

- Select the **"Delete"** button next to the preset
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
- **Personalize your WPM**: Use the companion web app to find your actual reading speed for more accurate estimates

## Contributing

Contributions are welcome! If you'd like to contribute to this plugin, please feel free to submit a Pull Request or open an issue on the [GitHub repository](https://github.com/santiyounger/wpm-reading-time).

## License

MIT

## Support

If you encounter any issues or have feature requests, please open an issue on the [GitHub repository](https://github.com/santiyounger/wpm-reading-time).

## Credits

Created by [Santi Younger](https://www.santiyounger.com/) to help writers and knowledge workers better understand their content's reading time.
