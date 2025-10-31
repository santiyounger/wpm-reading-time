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

		// "to read" text
		timeDisplay.createEl('div', { 
			text: 'to read', 
			cls: 'reading-time-to-read' 
		});

		// WPM info
		const wpmDiv = timeDisplay.createDiv('reading-time-wpm');
		wpmDiv.createSpan({ text: 'at your reading speed of: ' });
		wpmDiv.createSpan({ text: `${this.wpm} ` });
		wpmDiv.createSpan({ text: 'W', cls: 'reading-time-accent' });
		wpmDiv.createSpan({ text: 'ord ' });
		wpmDiv.createSpan({ text: 'P', cls: 'reading-time-accent' });
		wpmDiv.createSpan({ text: 'er ' });
		wpmDiv.createSpan({ text: 'M', cls: 'reading-time-accent' });
		wpmDiv.createSpan({ text: 'inute' });

		// "because it's:" text
		timeDisplay.createEl('div', { 
			text: 'because it\'s:', 
			cls: 'reading-time-because' 
		});

		// Word count
		timeDisplay.createEl('div', { 
			text: `${this.wordCount} words`, 
			cls: 'reading-time-words' 
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

