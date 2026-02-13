import { ItemView, WorkspaceLeaf, TFile, setIcon } from 'obsidian';
import { WPMTimePreset } from '../settings';

export const READING_TIME_VIEW_TYPE = 'reading-time-view';

export class ReadingTimeView extends ItemView {
	presets: WPMTimePreset[] = [];
	selectedPresetId: string = '';
	presetTimes: Map<string, { formatted: string; seconds: number }> = new Map();
	wordCount: number = 0;
	isWholeNote: boolean = false;
	noteTitle: string = '';
	noteFile: TFile | null = null;
	onPresetChange?: (presetId: string) => void;
	onOpenSettings?: () => void;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return READING_TIME_VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Reading time';
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
		noteTitle: string = '',
		noteFile: TFile | null = null
	): void {
		this.presets = presets;
		this.selectedPresetId = selectedPresetId;
		this.presetTimes = presetTimes;
		this.wordCount = wordCount;
		this.isWholeNote = isWholeNote;
		this.noteTitle = noteTitle;
		this.noteFile = noteFile;
		this.onPresetChange = onPresetChange;
		this.onOpenSettings = onOpenSettings;
		this.setupDynamicNoteTitle();
		this.render();
	}

	private getCurrentNoteTitle(): string {
		if (!this.noteFile) {
			return this.noteTitle;
		}
		// Try to get title from metadata cache (Obsidian's standard way)
		const metadata = this.app.metadataCache.getFileCache(this.noteFile);
		if (metadata?.frontmatter?.title) {
			const title = metadata.frontmatter.title as unknown;
			return typeof title === 'string' ? title : this.noteFile.basename;
		}
		// Use file basename (filename without extension)
		return this.noteFile.basename;
	}

	private setupDynamicNoteTitle(): void {
		// Only set up listeners if we're tracking a whole note
		if (!this.isWholeNote || !this.noteFile) {
			return;
		}

		// Store the original file path for rename tracking
		const originalFilePath = this.noteFile.path;

		// Listen for metadata changes (including frontmatter title changes)
		this.registerEvent(
			this.app.metadataCache.on('changed', (file: TFile) => {
				// Check if this is our file (compare by path)
				if (file.path === this.noteFile?.path || file.path === originalFilePath) {
					// Update the file reference in case it changed
					this.noteFile = file;
					const newTitle = this.getCurrentNoteTitle();
					if (newTitle !== this.noteTitle) {
						this.noteTitle = newTitle;
						// Update only the note title part without re-rendering everything
						this.updateNoteTitleDisplay();
					}
				}
			})
		);

		// Listen for file renames
		this.registerEvent(
			this.app.vault.on('rename', (file: TFile, oldPath: string) => {
				// Check if the renamed file matches our tracked file
				if (oldPath === originalFilePath || oldPath === this.noteFile?.path) {
					this.noteFile = file;
					const newTitle = this.getCurrentNoteTitle();
					this.noteTitle = newTitle;
					// Update only the note title part without re-rendering everything
					this.updateNoteTitleDisplay();
				}
			})
		);

		// Also listen for workspace active leaf changes to catch file switches and renames in real-time
		const workspaceHandler = () => {
			// Refresh the title display when workspace changes
			if (this.noteFile) {
				// Check if file still exists and update title
				const file = this.app.vault.getAbstractFileByPath(this.noteFile.path);
				if (file instanceof TFile) {
					this.noteFile = file;
					const newTitle = this.getCurrentNoteTitle();
					if (newTitle !== this.noteTitle) {
						this.noteTitle = newTitle;
						this.updateNoteTitleDisplay();
					}
				}
			}
		};

		// Listen to multiple workspace events for better real-time updates
		this.registerEvent(this.app.workspace.on('active-leaf-change', workspaceHandler));
		this.registerEvent(this.app.workspace.on('file-open', workspaceHandler));

		// Periodically check for title changes (as a fallback for any missed events)
		// Use a more frequent check for real-time updates
		this.registerInterval(
			window.setInterval(() => {
				if (this.noteFile && this.isWholeNote) {
					const currentTitle = this.getCurrentNoteTitle();
					if (currentTitle !== this.noteTitle) {
						this.noteTitle = currentTitle;
						this.updateNoteTitleDisplay();
					}
				}
			}, 500) // Check every 500ms for near real-time updates
		);
	}

	private updateNoteTitleDisplay(): void {
		if (!this.isWholeNote || !this.noteTitle) {
			return;
		}
		// Find the note title div and update only the note link part
		const noteTitleDiv = this.contentEl.querySelector('.reading-time-note-title');
		if (noteTitleDiv) {
			// Find the accent span that contains the note link
			const noteLink = noteTitleDiv.querySelector('.reading-time-accent.reading-time-note-link') as HTMLElement;
			if (noteLink) {
				noteLink.textContent = `[[${this.noteTitle}]]`;
				// Ensure click handler is still attached (in case element was recreated)
				if (!noteLink.dataset.clickHandlerAttached) {
					noteLink.classList.add('reading-time-note-link');
					noteLink.addEventListener('click', (e) => {
						e.preventDefault();
						void (async () => {
							if (this.noteFile) {
								// Open the note file directly
								const leaf = this.app.workspace.getMostRecentLeaf();
								if (leaf) {
									await leaf.openFile(this.noteFile);
								} else {
									// Fallback: create new leaf if none exists
									const newLeaf = this.app.workspace.getLeaf(false);
									await newLeaf.openFile(this.noteFile);
								}
							} else if (this.noteTitle) {
								// Fallback: try to open by title/name using link format
								await this.app.workspace.openLinkText(this.noteTitle, '', false);
							}
						})();
					});
					noteLink.dataset.clickHandlerAttached = 'true';
				}
			}
		}
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
		
		// Plugin title at the top
		const pluginTitle = mainContent.createDiv('reading-time-plugin-title');

		// Clock icon
		const clockIconContainer = pluginTitle.createSpan({ cls: 'reading-time-icon-inline' });
		setIcon(clockIconContainer, 'clock');

		pluginTitle.createSpan({ text: 'WPM Reading Time - How Long to Read This Text' });
		
		// Note title header (shown when analyzing whole note or selected text from a note)
		if (this.noteTitle) {
			const noteTitleContainer = mainContent.createDiv('reading-time-note-title');
			
			// Single line with text and note link
			const messageText = this.isWholeNote 
				? 'You can also select specific text next time. Currently, calculating this full note: '
				: 'You are using some selected text from this note: ';
			noteTitleContainer.createSpan({ text: messageText });
			const noteLink = noteTitleContainer.createSpan({ cls: 'reading-time-accent reading-time-note-link' });
			noteLink.textContent = `[[${this.noteTitle}]]`;
			
			// Check if note link would overflow and force it to its own line
			setTimeout(() => {
				const container = noteTitleContainer.getBoundingClientRect();
				const linkTextWidth = noteLink.scrollWidth;
				
				// If link text is wider than available space, put it on its own line
				if (linkTextWidth > container.width * 0.85) {
					noteLink.classList.add('reading-time-note-link-block');
				}
			}, 0);
			noteLink.addEventListener('click', (e) => {
				e.preventDefault();
				void (async () => {
					if (this.noteFile) {
						// Open the note file directly
						const leaf = this.app.workspace.getMostRecentLeaf();
						if (leaf) {
							await leaf.openFile(this.noteFile);
						} else {
							// Fallback: create new leaf if none exists
							const newLeaf = this.app.workspace.getLeaf(false);
							await newLeaf.openFile(this.noteFile);
						}
					} else if (this.noteTitle) {
						// Fallback: try to open by title/name using link format
						await this.app.workspace.openLinkText(this.noteTitle, '', false);
					}
				})();
			});
		}
		
		// Centered content wrapper for everything below the title
		const centeredContent = mainContent.createDiv('reading-time-centered-content');
		
		// Heading
		centeredContent.createEl('div', { 
			text: 'You\'d read this in', 
			cls: 'reading-time-heading' 
		});
		
		// Main time display
		const timeDisplay = centeredContent.createDiv('reading-time-display');
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

		// "because it's:" and word count combined with speed label
		const becauseDiv = timeDisplay.createDiv('reading-time-heading');
		becauseDiv.createSpan({ text: 'because it\'s: ' });
		becauseDiv.createSpan({ text: `${this.wordCount}`, cls: 'reading-time-number' });
		becauseDiv.createSpan({ text: ' words long' });
		becauseDiv.createEl('br');
		becauseDiv.createSpan({ text: 'at a speed of: ' });

		// Speed info with dropdown
		const speedDiv = timeDisplay.createDiv('reading-time-wpm');
		
		// Custom dropdown container
		const dropdownContainer = speedDiv.createDiv('reading-time-dropdown-container');
		const dropdownButton = dropdownContainer.createDiv('reading-time-preset-select');
		
		// Display selected preset with styled WPM phrase - two line layout
		const displayContent = dropdownButton.createDiv('reading-time-dropdown-content');
		
		// First line: "[speed] (Words Per Minute)"
		const firstLine = displayContent.createDiv('reading-time-dropdown-line');
		firstLine.createSpan({ text: `${currentPreset.speed} `, cls: 'reading-time-accent' });
		firstLine.createSpan({ text: '(' });
		const wpmPhrase = firstLine.createSpan({ cls: 'reading-time-wpm-phrase' });
		wpmPhrase.createSpan({ text: 'W', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'ords ' });
		wpmPhrase.createSpan({ text: 'P', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'er ' });
		wpmPhrase.createSpan({ text: 'M', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'inute' });
		firstLine.createSpan({ text: ')' });
		
		// Second line: "(preset name)"
		const secondLine = displayContent.createDiv('reading-time-dropdown-line');
		secondLine.createSpan({ text: `(${currentPreset.name})`, cls: 'reading-time-accent' });
		
		// Dropdown arrow
		const arrow = dropdownButton.createSpan('reading-time-dropdown-arrow');
		arrow.textContent = '▼';
		
		// Dropdown menu (hidden by default)
		const dropdownMenu = dropdownContainer.createDiv('reading-time-dropdown-menu reading-time-dropdown-menu-hidden');
		
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
					dropdownMenu.classList.remove('reading-time-dropdown-menu-visible');
					dropdownMenu.classList.add('reading-time-dropdown-menu-hidden');
					// Re-render to show new preset's time
					this.render();
				} else {
					dropdownMenu.classList.remove('reading-time-dropdown-menu-visible');
					dropdownMenu.classList.add('reading-time-dropdown-menu-hidden');
				}
			});
		}
		
		// Settings option at the bottom
		if (this.onOpenSettings) {
			dropdownMenu.createDiv('reading-time-dropdown-divider');
			
			const settingsItem = dropdownMenu.createDiv('reading-time-dropdown-item reading-time-dropdown-settings');
			const settingsContent = settingsItem.createSpan('reading-time-dropdown-item-text');
			settingsContent.createSpan({ text: '⚙️ ' });
			settingsContent.createSpan({ text: 'Settings' });
			
			settingsItem.addEventListener('click', (e) => {
				e.stopPropagation();
				dropdownMenu.classList.remove('reading-time-dropdown-menu-visible');
				dropdownMenu.classList.add('reading-time-dropdown-menu-hidden');
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
			
			if (isOpen) {
				// First show it to measure its height
				dropdownMenu.classList.remove('reading-time-dropdown-menu-hidden');
				dropdownMenu.classList.add('reading-time-dropdown-menu-measuring');
				
				// Calculate available space below and above the dropdown button
				const buttonRect = dropdownButton.getBoundingClientRect();
				const menuRect = dropdownMenu.getBoundingClientRect();
				const viewportHeight = window.innerHeight;
				
				const spaceBelow = viewportHeight - buttonRect.bottom;
				const spaceAbove = buttonRect.top;
				const menuHeight = menuRect.height;
				
				// If not enough space below but enough space above, open upwards
				if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
					dropdownMenu.classList.remove('reading-time-dropdown-menu-down');
					dropdownMenu.classList.add('reading-time-dropdown-menu-up');
				} else {
					dropdownMenu.classList.remove('reading-time-dropdown-menu-up');
					dropdownMenu.classList.add('reading-time-dropdown-menu-down');
				}
				
				// Make it visible now
				dropdownMenu.classList.remove('reading-time-dropdown-menu-measuring');
				dropdownMenu.classList.add('reading-time-dropdown-menu-visible');
			} else {
				dropdownMenu.classList.remove('reading-time-dropdown-menu-visible');
				dropdownMenu.classList.add('reading-time-dropdown-menu-hidden');
			}
		};
		
		dropdownButton.addEventListener('click', toggleDropdown);

		// Close dropdown when clicking outside
		const closeDropdown = (e: MouseEvent) => {
			if (!dropdownContainer.contains(e.target as Node)) {
				isOpen = false;
				dropdownMenu.classList.remove('reading-time-dropdown-menu-visible');
				dropdownMenu.classList.add('reading-time-dropdown-menu-hidden');
			}
		};

		// Register DOM event for automatic cleanup
		this.registerDomEvent(document, 'click', closeDropdown);
		
		// Settings link below dropdown
		if (this.onOpenSettings) {
			const settingsLink = speedDiv.createDiv('reading-time-settings-link reading-time-settings-link-wrapper');
			
			// Wrapper span for underline effect that covers everything
			const underlineWrapper = settingsLink.createSpan('reading-time-underline-wrapper');

			// Gear icon
			const gearIconContainer = underlineWrapper.createSpan();
			setIcon(gearIconContainer, 'settings');

			underlineWrapper.createSpan({ text: 'You can change this ' });

			// Arrow up icon after "this"
			const arrowIconContainer = underlineWrapper.createSpan({ cls: 'reading-time-arrow-icon' });
			setIcon(arrowIconContainer, 'arrow-up');

			underlineWrapper.createSpan({ text: ' in the settings' });
			
			settingsLink.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				if (this.onOpenSettings) {
					this.onOpenSettings();
				}
			});
		}
	}

	onOpen(): Promise<void> {
		this.render();
		return Promise.resolve();
	}

	onClose(): Promise<void> {
		const { contentEl } = this;
		contentEl.empty();
		return Promise.resolve();
	}
}
