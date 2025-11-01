import { Plugin } from 'obsidian';
import { WPMTimeSettings } from './settings';
import { WPMTimeSettingTab } from './ui/settings-tab';

export interface WPMTimePlugin extends Plugin {
	settings: WPMTimeSettings;
	saveSettings: () => Promise<void>;
	settingTab: WPMTimeSettingTab | null;
}

