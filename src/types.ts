import { Plugin } from 'obsidian';
import { WPMTimeSettings } from './settings';

export interface WPMTimePlugin extends Plugin {
	settings: WPMTimeSettings;
	saveSettings: () => Promise<void>;
}

