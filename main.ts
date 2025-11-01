import { Plugin } from 'obsidian';
import { WPMTimeSettings, DEFAULT_SETTINGS } from './src/settings';
import { registerReadingTimeCommand } from './src/commands/reading-time-command';
import { WPMTimeSettingTab } from './src/ui/settings-tab';
import { ReadingTimeView, READING_TIME_VIEW_TYPE } from './src/ui/reading-time-view';

export default class WPMTimePlugin extends Plugin {
	settings: WPMTimeSettings;
	view: ReadingTimeView | null = null;

	async onload() {
		await this.loadSettings();

		// Register the view
		this.registerView(
			READING_TIME_VIEW_TYPE,
			(leaf) => new ReadingTimeView(leaf)
		);

		// Register the reading time command
		registerReadingTimeCommand(this);

		// Add settings tab
		this.addSettingTab(new WPMTimeSettingTab(this.app, this));
	}

	async onunload() {
		// Cleanup view
		this.app.workspace.detachLeavesOfType(READING_TIME_VIEW_TYPE);
	}

	async loadSettings() {
		const loadedData = await this.loadData();
		
		// Migrate old settings format (wpm) to new format (speakingSpeed, readingSpeed)
		if (loadedData && 'wpm' in loadedData && !('speakingSpeed' in loadedData)) {
			loadedData.speakingSpeed = loadedData.wpm;
			delete loadedData.wpm;
		}
		if (!loadedData || !('readingSpeed' in loadedData)) {
			loadedData.readingSpeed = DEFAULT_SETTINGS.readingSpeed;
		}
		if (!loadedData || !('speakingSpeed' in loadedData)) {
			loadedData.speakingSpeed = DEFAULT_SETTINGS.speakingSpeed;
		}
		
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
