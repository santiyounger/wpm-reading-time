export interface WPMTimePreset {
	id: string;
	name: string;
	speed: number;
}

export interface WPMTimeSettings {
	presets: WPMTimePreset[];
	selectedPresetId: string;
}

export const DEFAULT_SETTINGS: WPMTimeSettings = {
	presets: [
		{ id: 'reading', name: 'My Reading Time', speed: 225 }
	],
	selectedPresetId: 'reading'
};
