export interface WPMTimeSettings {
	speakingSpeed: number; // WPM for speaking out loud
	readingSpeed: number; // WPM for silent reading
}

export const DEFAULT_SETTINGS: WPMTimeSettings = {
	speakingSpeed: 200,
	readingSpeed: 250
};

