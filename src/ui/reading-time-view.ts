import { ItemView, WorkspaceLeaf } from 'obsidian';
import { WPMTimePreset } from '../settings';

export const READING_TIME_VIEW_TYPE = 'reading-time-view';

export class ReadingTimeView extends ItemView {
	presets: WPMTimePreset[] = [];
	selectedPresetId: string = '';
	presetTimes: Map<string, { formatted: string; seconds: number }> = new Map();
	wordCount: number = 0;
	onPresetChange?: (presetId: string) => void;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return READING_TIME_VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Reading Time';
	}

	getIcon(): string {
		return 'clock';
	}

	updateContent(
		presets: WPMTimePreset[],
		selectedPresetId: string,
		presetTimes: Map<string, { formatted: string; seconds: number }>,
		wordCount: number,
		onPresetChange: (presetId: string) => void
	): void {
		this.presets = presets;
		this.selectedPresetId = selectedPresetId;
		this.presetTimes = presetTimes;
		this.wordCount = wordCount;
		this.onPresetChange = onPresetChange;
		this.render();
	}

	private render(): void {
		const { contentEl } = this;
		contentEl.empty();

		if (this.presets.length === 0 || !this.selectedPresetId) {
			return;
		}

		const currentPreset = this.presets.find(p => p.id === this.selectedPresetId);
		const currentTime = this.presetTimes.get(this.selectedPresetId);
		
		if (!currentPreset || !currentTime) {
			return;
		}

		// Main content container
		const mainContent = contentEl.createDiv('reading-time-content');
		
		// Heading
		mainContent.createEl('div', { 
			text: 'You would read this in:', 
			cls: 'reading-time-heading' 
		});
		
		// Main time display
		const timeDisplay = mainContent.createDiv('reading-time-display');
		timeDisplay.createEl('div', { 
			text: currentTime.formatted, 
			cls: 'reading-time-formatted' 
		});

		// "because it's:" and word count combined
		const becauseDiv = timeDisplay.createDiv('reading-time-because');
		becauseDiv.createSpan({ text: 'because it\'s: ' });
		becauseDiv.createSpan({ text: `${this.wordCount}`, cls: 'reading-time-number' });
		becauseDiv.createSpan({ text: ' words long' });

		// Speed info with dropdown
		const speedDiv = timeDisplay.createDiv('reading-time-wpm');
		speedDiv.createSpan({ text: 'and you read at a speed of: ' });
		
		// Dropdown select element
		const select = speedDiv.createEl('select', { cls: 'reading-time-preset-select' });
		for (const preset of this.presets) {
			const option = select.createEl('option', { 
				text: `${preset.name}: ${preset.speed}`,
				value: preset.id 
			});
			if (preset.id === this.selectedPresetId) {
				option.selected = true;
			}
		}
		
		// Add WPM phrase after dropdown
		speedDiv.createSpan({ text: ' ' });
		const wpmPhrase = speedDiv.createSpan({ cls: 'reading-time-wpm-phrase' });
		wpmPhrase.createSpan({ text: 'W', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'ord ' });
		wpmPhrase.createSpan({ text: 'P', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'er ' });
		wpmPhrase.createSpan({ text: 'M', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'inute' });

		// Dropdown change handler
		select.addEventListener('change', (e) => {
			const target = e.target as HTMLSelectElement;
			const newPresetId = target.value;
			if (this.onPresetChange && newPresetId !== this.selectedPresetId) {
				this.selectedPresetId = newPresetId;
				this.onPresetChange(newPresetId);
				// Re-render to show new preset's time
				this.render();
			}
		});
	}

	async onOpen(): Promise<void> {
		this.render();
	}

	async onClose(): Promise<void> {
		const { contentEl } = this;
		contentEl.empty();
	}
}
