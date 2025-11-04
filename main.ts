import { Plugin } from 'obsidian';
import { WPMTimeSettings, WPMTimePreset, DEFAULT_SETTINGS } from './src/settings';
import { registerReadingTimeCommand } from './src/commands/reading-time-command';
import { WPMTimeSettingTab } from './src/ui/settings-tab';
import { ReadingTimeView, READING_TIME_VIEW_TYPE } from './src/ui/reading-time-view';

export default class WPMTimePlugin extends Plugin {
	settings: WPMTimeSettings;
	view: ReadingTimeView | null = null;
	settingTab: WPMTimeSettingTab | null = null;

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
		this.settingTab = new WPMTimeSettingTab(this.app, this);
		this.addSettingTab(this.settingTab);
	}

	onunload() {
		// Note: Do not detach leaves here as it will reset the leaf position
		// The view will be cleaned up automatically when the plugin unloads
	}

	async loadSettings() {
		const loadedData = await this.loadData();
		let migratedData: Partial<WPMTimeSettings> = loadedData || {};
		
		// Migrate old settings format to new preset-based format
		if (loadedData && !('presets' in loadedData)) {
			// Old format: migrate readingSpeed/speakingSpeed or wpm to presets
			let readingSpeed = DEFAULT_SETTINGS.presets[0].speed;
			let speakingSpeed = DEFAULT_SETTINGS.presets[1].speed;
			
			if ('wpm' in loadedData && typeof loadedData.wpm === 'number') {
				speakingSpeed = loadedData.wpm;
			}
			if ('readingSpeed' in loadedData && typeof loadedData.readingSpeed === 'number') {
				readingSpeed = loadedData.readingSpeed;
			}
			if ('speakingSpeed' in loadedData && typeof loadedData.speakingSpeed === 'number') {
				speakingSpeed = loadedData.speakingSpeed;
			}
			
			migratedData.presets = [
				{ id: 'reading', name: 'My Reading Time', speed: readingSpeed },
				{ id: 'speaking', name: 'My Speaking Time', speed: speakingSpeed }
			];
			migratedData.selectedPresetId = 'reading';
		}
		
		// Ensure presets array exists and has at least default presets
		if (!migratedData.presets || !Array.isArray(migratedData.presets) || migratedData.presets.length === 0) {
			migratedData.presets = DEFAULT_SETTINGS.presets;
		}
		
		// Ensure selectedPresetId exists and is valid
		if (!migratedData.selectedPresetId) {
			migratedData.selectedPresetId = DEFAULT_SETTINGS.selectedPresetId;
		}
		
		// Validate that selectedPresetId exists in presets
		const presetIds = (migratedData.presets || []).map((p: WPMTimePreset) => p.id);
		if (!presetIds.includes(migratedData.selectedPresetId)) {
			migratedData.selectedPresetId = presetIds[0] || DEFAULT_SETTINGS.selectedPresetId;
		}
		
		this.settings = Object.assign({}, DEFAULT_SETTINGS, migratedData);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
