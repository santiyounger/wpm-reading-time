import { Plugin } from 'obsidian';
import { WPMTimeSettings, DEFAULT_SETTINGS } from './src/settings';
import { registerReadingTimeCommand } from './src/commands/reading-time-command';
import { WPMTimeSettingTab } from './src/ui/settings-tab';

export default class WPMTimePlugin extends Plugin {
	settings: WPMTimeSettings;

	async onload() {
		await this.loadSettings();

		// Register the reading time command
		registerReadingTimeCommand(this);

		// Add settings tab
		this.addSettingTab(new WPMTimeSettingTab(this.app, this));
	}

	onunload() {
		// Cleanup is handled automatically by Obsidian's register* methods
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
