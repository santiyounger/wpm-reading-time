import { ItemView, WorkspaceLeaf } from 'obsidian';
import { WPMTimePreset } from '../settings';

export const READING_TIME_VIEW_TYPE = 'reading-time-view';

export class ReadingTimeView extends ItemView {
	presets: WPMTimePreset[] = [];
	selectedPresetId: string = '';
	presetTimes: Map<string, { formatted: string; seconds: number }> = new Map();
	wordCount: number = 0;
	isWholeNote: boolean = false;
	noteTitle: string = '';
	onPresetChange?: (presetId: string) => void;
	onOpenSettings?: () => void;
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
		onPresetChange: (presetId: string) => void,
		onOpenSettings?: () => void,
		isWholeNote: boolean = false,
		noteTitle: string = ''
	): void {
		this.presets = presets;
		this.selectedPresetId = selectedPresetId;
		this.presetTimes = presetTimes;
		this.wordCount = wordCount;
		this.isWholeNote = isWholeNote;
		this.noteTitle = noteTitle;
		this.onPresetChange = onPresetChange;
		this.onOpenSettings = onOpenSettings;
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
		
		// Note title header (only shown when analyzing whole note)
		if (this.isWholeNote && this.noteTitle) {
			const noteTitleDiv = mainContent.createDiv('reading-time-note-title');
			noteTitleDiv.createSpan({ text: 'You can select text and then run this plugin' });
			noteTitleDiv.createEl('br');
			noteTitleDiv.createSpan({ text: 'Right now we are using this whole note: ' });
			const noteLink = noteTitleDiv.createSpan({ cls: 'reading-time-accent' });
			noteLink.textContent = `[[${this.noteTitle}]]`;
		}
		
		// Heading
		mainContent.createEl('div', { 
			text: 'You\'d read this in:', 
			cls: 'reading-time-heading' 
		});
		
		// Main time display
		const timeDisplay = mainContent.createDiv('reading-time-display');
		const formattedDiv = timeDisplay.createDiv('reading-time-formatted');
		
		// Parse and render time with proper line-break handling
		// Format can be: "4 seconds", "1 minute", or "1 minute & 4 seconds"
		const formatted = currentTime.formatted;
		if (formatted.includes(' & ')) {
			// Has both minutes and seconds: "1 minute & 4 seconds"
			const parts = formatted.split(' & ');
			const minutesPart = parts[0]; // "1 minute" or "1 minutes"
			const secondsPart = parts[1]; // "4 seconds"
			
			// Minutes part - can break, but keep number+unit together
			const minutesSpan = formattedDiv.createSpan('reading-time-unit-group');
			minutesSpan.textContent = minutesPart;
			
			// Ampersand with space - can break here
			formattedDiv.createSpan({ text: ' & ', cls: 'reading-time-separator' });
			
			// Seconds part - keep number+unit together, don't break
			const secondsSpan = formattedDiv.createSpan('reading-time-unit-group reading-time-seconds');
			secondsSpan.textContent = secondsPart;
		} else {
			// Only one unit: "4 seconds" or "1 minute" - keep together
			const unitSpan = formattedDiv.createSpan('reading-time-unit-group');
			unitSpan.textContent = formatted;
		}

		// "because it's:" and word count combined
		const becauseDiv = timeDisplay.createDiv('reading-time-because');
		becauseDiv.createSpan({ text: 'because it\'s: ' });
		becauseDiv.createSpan({ text: `${this.wordCount}`, cls: 'reading-time-number' });
		becauseDiv.createSpan({ text: ' words long' });

		// Speed info with dropdown
		const speedDiv = timeDisplay.createDiv('reading-time-wpm');
		speedDiv.createEl('div', { text: 'at a speed of:', cls: 'reading-time-speed-label' });
		
		// Custom dropdown container
		const dropdownContainer = speedDiv.createDiv('reading-time-dropdown-container');
		const dropdownButton = dropdownContainer.createDiv('reading-time-preset-select');
		
		// Display selected preset with styled WPM phrase - two line layout
		const displayContent = dropdownButton.createDiv('reading-time-dropdown-content');
		
		// First line: "[speed] Words Per Minute"
		const firstLine = displayContent.createDiv('reading-time-dropdown-line');
		firstLine.createSpan({ text: `${currentPreset.speed} ` });
		const wpmPhrase = firstLine.createSpan({ cls: 'reading-time-wpm-phrase' });
		wpmPhrase.createSpan({ text: 'W', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'ords ' });
		wpmPhrase.createSpan({ text: 'P', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'er ' });
		wpmPhrase.createSpan({ text: 'M', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'inute' });
		
		// Second line: "(preset name)"
		const secondLine = displayContent.createDiv('reading-time-dropdown-line');
		secondLine.createSpan({ text: `(${currentPreset.name})` });
		
		// Dropdown arrow
		const arrow = dropdownButton.createSpan('reading-time-dropdown-arrow');
		arrow.textContent = '▼';
		
		// Dropdown menu (hidden by default)
		const dropdownMenu = dropdownContainer.createDiv('reading-time-dropdown-menu');
		dropdownMenu.style.display = 'none';
		
		// Create menu items for each preset
		for (const preset of this.presets) {
			const menuItem = dropdownMenu.createDiv('reading-time-dropdown-item');
			const itemText = menuItem.createSpan('reading-time-dropdown-item-text');
			itemText.createSpan({ text: `${preset.speed} WPM ` });
			itemText.createSpan({ text: `(${preset.name})` });
			
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
		
		// Settings option at the bottom
		if (this.onOpenSettings) {
			const settingsDivider = dropdownMenu.createDiv('reading-time-dropdown-divider');
			
			const settingsItem = dropdownMenu.createDiv('reading-time-dropdown-item reading-time-dropdown-settings');
			const settingsContent = settingsItem.createSpan('reading-time-dropdown-item-text');
			settingsContent.createSpan({ text: '⚙️ ' });
			settingsContent.createSpan({ text: 'Settings' });
			
			settingsItem.addEventListener('click', (e) => {
				e.stopPropagation();
				dropdownMenu.style.display = 'none';
				if (this.onOpenSettings) {
					this.onOpenSettings();
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
