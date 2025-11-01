import { ItemView, WorkspaceLeaf } from 'obsidian';
import { WPMTimePreset } from '../settings';

export const READING_TIME_VIEW_TYPE = 'reading-time-view';

export class ReadingTimeView extends ItemView {
	presets: WPMTimePreset[] = [];
	selectedPresetId: string = '';
	presetTimes: Map<string, { formatted: string; seconds: number }> = new Map();
	wordCount: number = 0;
	onPresetChange?: (presetId: string) => void;
	dropdownCleanup?: () => void;

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
		// Clean up any existing dropdown listeners
		if (this.dropdownCleanup) {
			this.dropdownCleanup();
			this.dropdownCleanup = undefined;
		}
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
			text: 'You\'d read this in:', 
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
		
		// Custom dropdown container
		const dropdownContainer = speedDiv.createDiv('reading-time-dropdown-container');
		const dropdownButton = dropdownContainer.createDiv('reading-time-preset-select');
		
		// Display selected preset with styled WPM phrase
		const displayText = dropdownButton.createSpan();
		displayText.createSpan({ text: `at: ${currentPreset.speed} ` });
		const wpmPhrase = displayText.createSpan({ cls: 'reading-time-wpm-phrase' });
		wpmPhrase.createSpan({ text: 'W', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'ord ' });
		wpmPhrase.createSpan({ text: 'P', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'er ' });
		wpmPhrase.createSpan({ text: 'M', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'inute (`${currentPreset.name}`)` });
		
		// Dropdown arrow
		const arrow = dropdownButton.createSpan('reading-time-dropdown-arrow');
		arrow.textContent = '▼';
		
		// Dropdown menu (hidden by default)
		const dropdownMenu = dropdownContainer.createDiv('reading-time-dropdown-menu');
		dropdownMenu.style.display = 'none';
		
		// Create menu items for each preset
		for (const preset of this.presets) {
			const menuItem = dropdownMenu.createDiv('reading-time-dropdown-item');
			const itemText = menuItem.createSpan();
			itemText.createSpan({ text: `at: ${preset.speed} ` });
			const itemWpmPhrase = itemText.createSpan({ cls: 'reading-time-wpm-phrase' });
			itemWpmPhrase.createSpan({ text: 'W', cls: 'reading-time-accent' });
			itemWpmPhrase.createSpan({ text: 'ord ' });
			itemWpmPhrase.createSpan({ text: 'P', cls: 'reading-time-accent' });
			itemWpmPhrase.createSpan({ text: 'er ' });
			itemWpmPhrase.createSpan({ text: 'M', cls: 'reading-time-accent' });
			itemWpmPhrase.createSpan({ text: 'inute (`${preset.name}`)` });
			
			if (preset.id === this.selectedPresetId) {
				menuItem.classList.add('selected');
			}
			
			menuItem.addEventListener('click', (e) => {
				e.stopPropagation();
				if (this.onPresetChange && preset.id !== this.selectedPresetId) {
					this.selectedPresetId = preset.id;
					this.onPresetChange(preset.id);
					dropdownMenu.style.display = 'none';
					// Re-render to show new preset's time
					this.render();
				} else {
					dropdownMenu.style.display = 'none';
				}
			});
		}
		
		// Toggle dropdown menu
		let isOpen = false;
		const toggleDropdown = (e: MouseEvent) => {
			e.stopPropagation();
			isOpen = !isOpen;
			dropdownMenu.style.display = isOpen ? 'block' : 'none';
		};
		
		dropdownButton.addEventListener('click', toggleDropdown);
		
		// Close dropdown when clicking outside
		const closeDropdown = (e: MouseEvent) => {
			if (!dropdownContainer.contains(e.target as Node)) {
				isOpen = false;
				dropdownMenu.style.display = 'none';
			}
		};
		
		// Use a timeout to add the listener after current execution
		setTimeout(() => {
			document.addEventListener('click', closeDropdown);
		}, 0);
		
		// Store cleanup function
		this.dropdownCleanup = () => {
			document.removeEventListener('click', closeDropdown);
		};
	}

	async onOpen(): Promise<void> {
		this.render();
	}

	async onClose(): Promise<void> {
		const { contentEl } = this;
		if (this.dropdownCleanup) {
			this.dropdownCleanup();
			this.dropdownCleanup = undefined;
		}
		contentEl.empty();
	}
}
