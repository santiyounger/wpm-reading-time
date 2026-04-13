import { Plugin } from 'obsidian';
import { WPMTimeSettings, WPMTimePreset, DEFAULT_SETTINGS } from './settings';
import { registerReadingTimeCommand } from './commands/reading-time-command';
import { WPMTimeSettingTab } from './ui/settings-tab';
import { ReadingTimeView, READING_TIME_VIEW_TYPE } from './ui/reading-time-view';

export default class WPMTimePlugin extends Plugin {
	settings: WPMTimeSettings;
	settingTab: WPMTimeSettingTab | null = null;

	async onload() {
		await this.loadSettings();

		this.registerView(
			READING_TIME_VIEW_TYPE,
			(leaf) => new ReadingTimeView(leaf)
		);

		registerReadingTimeCommand(this);

		this.settingTab = new WPMTimeSettingTab(this.app, this);
		this.addSettingTab(this.settingTab);
	}

	onunload() {
		// Do not detach leaves here; Obsidian handles view cleanup on unload.
	}

	async loadSettings() {
		const loadedData = await this.loadData() as Partial<WPMTimeSettings> | null;
		const migratedData: Partial<WPMTimeSettings> = loadedData || {};

		if (loadedData && !('presets' in loadedData)) {
			const oldData = loadedData as Record<string, unknown>;
			let readingSpeed = DEFAULT_SETTINGS.presets[0]?.speed ?? 225;
			let speakingSpeed = 200;

			if ('wpm' in oldData && typeof oldData.wpm === 'number') {
				speakingSpeed = oldData.wpm;
			}
			if ('readingSpeed' in oldData && typeof oldData.readingSpeed === 'number') {
				readingSpeed = oldData.readingSpeed;
			}
			if ('speakingSpeed' in oldData && typeof oldData.speakingSpeed === 'number') {
				speakingSpeed = oldData.speakingSpeed;
			}

			migratedData.presets = [
				{ id: 'reading', name: 'My reading time', speed: readingSpeed },
				{ id: 'speaking', name: 'My speaking time', speed: speakingSpeed }
			];
			migratedData.selectedPresetId = 'reading';
		}

		if (!migratedData.presets || !Array.isArray(migratedData.presets) || migratedData.presets.length === 0) {
			migratedData.presets = [...DEFAULT_SETTINGS.presets];
		}

		if (!migratedData.selectedPresetId) {
			migratedData.selectedPresetId = DEFAULT_SETTINGS.selectedPresetId;
		}

		const presetIds = (migratedData.presets || []).map((preset: WPMTimePreset) => preset.id);
		if (!presetIds.includes(migratedData.selectedPresetId)) {
			migratedData.selectedPresetId = presetIds[0] || DEFAULT_SETTINGS.selectedPresetId;
		}

		this.settings = Object.assign({}, DEFAULT_SETTINGS, migratedData);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
