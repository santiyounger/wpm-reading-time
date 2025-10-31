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
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
