import { ItemView, WorkspaceLeaf } from 'obsidian';

export const READING_TIME_VIEW_TYPE = 'reading-time-view';

export class ReadingTimeView extends ItemView {
	readingFormatted: string = '';
	readingSeconds: number = 0;
	readingSpeed: number = 0;
	speakingFormatted: string = '';
	speakingSeconds: number = 0;
	speakingSpeed: number = 0;
	wordCount: number = 0;
	activeTab: 'reading' | 'speaking' = 'reading';

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
		readingFormatted: string, readingSeconds: number, readingSpeed: number,
		speakingFormatted: string, speakingSeconds: number, speakingSpeed: number,
		wordCount: number
	): void {
		this.readingFormatted = readingFormatted;
		this.readingSeconds = readingSeconds;
		this.readingSpeed = readingSpeed;
		this.speakingFormatted = speakingFormatted;
		this.speakingSeconds = speakingSeconds;
		this.speakingSpeed = speakingSpeed;
		this.wordCount = wordCount;
		this.render();
	}

	private renderTabContent(container: HTMLElement, isReading: boolean): void {
		const formatted = isReading ? this.readingFormatted : this.speakingFormatted;
		const speed = isReading ? this.readingSpeed : this.speakingSpeed;
		const heading = isReading 
			? 'You would read this in:' 
			: 'You would read this out loud in:';
		const speedText = isReading
			? 'and you read at a speed of:'
			: 'and you read out loud at a speed of:';

		// Heading
		container.createEl('div', { 
			text: heading, 
			cls: 'reading-time-heading' 
		});
		
		// Main time display
		const timeDisplay = container.createDiv('reading-time-display');
		timeDisplay.createEl('div', { 
			text: formatted, 
			cls: 'reading-time-formatted' 
		});

		// "because it's:" and word count combined
		const becauseDiv = timeDisplay.createDiv('reading-time-because');
		becauseDiv.createSpan({ text: 'because it\'s: ' });
		becauseDiv.createSpan({ text: `${this.wordCount}`, cls: 'reading-time-number' });
		becauseDiv.createSpan({ text: ' words long' });

		// Speed info
		const speedDiv = timeDisplay.createDiv('reading-time-wpm');
		speedDiv.createSpan({ text: `${speedText} ` });
		speedDiv.createSpan({ text: `${speed}`, cls: 'reading-time-number' });
		speedDiv.createSpan({ text: ' ' });
		const wpmPhrase = speedDiv.createSpan({ cls: 'reading-time-wpm-phrase' });
		wpmPhrase.createSpan({ text: 'W', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'ord ' });
		wpmPhrase.createSpan({ text: 'P', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'er ' });
		wpmPhrase.createSpan({ text: 'M', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'inute' });
	}

	private render(): void {
		const { contentEl } = this;
		contentEl.empty();

		// Tab buttons
		const tabContainer = contentEl.createDiv('reading-time-tabs');
		const readingTab = tabContainer.createDiv('reading-time-tab');
		readingTab.textContent = 'Reading Time';
		readingTab.classList.add(this.activeTab === 'reading' ? 'active' : '');
		
		const speakingTab = tabContainer.createDiv('reading-time-tab');
		speakingTab.textContent = 'Speaking Time';
		speakingTab.classList.add(this.activeTab === 'speaking' ? 'active' : '');

		// Tab content container
		const mainContent = contentEl.createDiv('reading-time-content');
		const readingContent = mainContent.createDiv('reading-time-tab-content');
		const speakingContent = mainContent.createDiv('reading-time-tab-content');
		
		readingContent.style.display = this.activeTab === 'reading' ? 'flex' : 'none';
		speakingContent.style.display = this.activeTab === 'speaking' ? 'flex' : 'none';

		// Render content for both tabs
		this.renderTabContent(readingContent, true);
		this.renderTabContent(speakingContent, false);

		// Tab click handlers
		readingTab.onclick = () => {
			this.activeTab = 'reading';
			readingTab.classList.add('active');
			speakingTab.classList.remove('active');
			readingContent.style.display = 'flex';
			speakingContent.style.display = 'none';
		};

		speakingTab.onclick = () => {
			this.activeTab = 'speaking';
			speakingTab.classList.add('active');
			readingTab.classList.remove('active');
			speakingContent.style.display = 'flex';
			readingContent.style.display = 'none';
		};
	}

	async onOpen(): Promise<void> {
		this.render();
	}

	async onClose(): Promise<void> {
		const { contentEl } = this;
		contentEl.empty();
	}
}
