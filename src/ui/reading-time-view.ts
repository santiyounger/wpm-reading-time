import { ItemView, WorkspaceLeaf } from 'obsidian';

export const READING_TIME_VIEW_TYPE = 'reading-time-view';

export class ReadingTimeView extends ItemView {
	formatted: string = '';
	totalSeconds: number = 0;
	wpm: number = 0;
	wordCount: number = 0;

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

	updateContent(formatted: string, totalSeconds: number, wpm: number, wordCount: number): void {
		this.formatted = formatted;
		this.totalSeconds = totalSeconds;
		this.wpm = wpm;
		this.wordCount = wordCount;
		this.render();
	}

	private render(): void {
		const { contentEl } = this;
		contentEl.empty();

		const mainContent = contentEl.createDiv('reading-time-content');
		
		// Heading
		mainContent.createEl('div', { 
			text: 'This text would take you:', 
			cls: 'reading-time-heading' 
		});
		
		// Main time display
		const timeDisplay = mainContent.createDiv('reading-time-display');
		timeDisplay.createEl('div', { 
			text: this.formatted, 
			cls: 'reading-time-formatted' 
		});

		// "to read at your reading speed of:" combined
		const wpmDiv = timeDisplay.createDiv('reading-time-wpm');
		wpmDiv.createSpan({ text: 'to read at your reading speed of: ' });
		wpmDiv.createSpan({ text: `${this.wpm}`, cls: 'reading-time-number' });
		wpmDiv.createSpan({ text: ' ' });
		const wpmPhrase = wpmDiv.createSpan({ cls: 'reading-time-wpm-phrase' });
		wpmPhrase.createSpan({ text: 'W', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'ord ' });
		wpmPhrase.createSpan({ text: 'P', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'er ' });
		wpmPhrase.createSpan({ text: 'M', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'inute' });

		// "because it's:" and word count combined
		const becauseDiv = timeDisplay.createDiv('reading-time-because');
		becauseDiv.createSpan({ text: 'because it\'s: ' });
		becauseDiv.createSpan({ text: `${this.wordCount}`, cls: 'reading-time-number' });
		becauseDiv.createSpan({ text: ' words long' });
	}

	async onOpen(): Promise<void> {
		this.render();
	}

	async onClose(): Promise<void> {
		const { contentEl } = this;
		contentEl.empty();
	}
}

