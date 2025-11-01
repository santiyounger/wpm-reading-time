import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';
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
	dropdownCleanup?: () => void;
	metadataCleanup?: () => void;
	renameCleanup?: () => void;
	workspaceCleanup?: () => void;

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
			return metadata.frontmatter.title;
		}
		// Use file basename (filename without extension)
		return this.noteFile.basename;
	}

	private setupDynamicNoteTitle(): void {
		// Clean up existing listeners
		if (this.metadataCleanup) {
			this.metadataCleanup();
			this.metadataCleanup = undefined;
		}
		if (this.renameCleanup) {
			this.renameCleanup();
			this.renameCleanup = undefined;
		}
		if (this.workspaceCleanup) {
			this.workspaceCleanup();
			this.workspaceCleanup = undefined;
		}

		// Only set up listeners if we're tracking a whole note
		if (!this.isWholeNote || !this.noteFile) {
			return;
		}

		// Store the original file path for rename tracking
		const originalFilePath = this.noteFile.path;

		// Listen for metadata changes (including frontmatter title changes)
		const metadataHandler = (file: TFile) => {
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
		};
		this.app.metadataCache.on('changed', metadataHandler);
		this.metadataCleanup = () => {
			this.app.metadataCache.off('changed', metadataHandler);
		};

		// Listen for file renames
		const renameHandler = (file: TFile, oldPath: string) => {
			// Check if the renamed file matches our tracked file
			if (oldPath === originalFilePath || oldPath === this.noteFile?.path) {
				this.noteFile = file;
				const newTitle = this.getCurrentNoteTitle();
				this.noteTitle = newTitle;
				// Update only the note title part without re-rendering everything
				this.updateNoteTitleDisplay();
			}
		};
		this.app.vault.on('rename', renameHandler);
		this.renameCleanup = () => {
			this.app.vault.off('rename', renameHandler);
		};

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
		this.app.workspace.on('active-leaf-change', workspaceHandler);
		this.app.workspace.on('file-open', workspaceHandler);
		this.workspaceCleanup = () => {
			this.app.workspace.off('active-leaf-change', workspaceHandler);
			this.app.workspace.off('file-open', workspaceHandler);
		};

		// Periodically check for title changes (as a fallback for any missed events)
		// Use a more frequent check for real-time updates
		const intervalId = window.setInterval(() => {
			if (this.noteFile && this.isWholeNote) {
				const currentTitle = this.getCurrentNoteTitle();
				if (currentTitle !== this.noteTitle) {
					this.noteTitle = currentTitle;
					this.updateNoteTitleDisplay();
				}
			}
		}, 500); // Check every 500ms for near real-time updates

		// Store interval cleanup in metadataCleanup (will be cleaned up together)
		const originalMetadataCleanup = this.metadataCleanup;
		this.metadataCleanup = () => {
			if (originalMetadataCleanup) originalMetadataCleanup();
			window.clearInterval(intervalId);
		};
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
					noteLink.style.cursor = 'pointer';
					noteLink.addEventListener('click', async (e) => {
						e.preventDefault();
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
					});
					noteLink.dataset.clickHandlerAttached = 'true';
				}
			}
		}
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
		
		// Plugin title at the top
		const pluginTitle = mainContent.createDiv('reading-time-plugin-title');
		
		// Clock icon
		const clockIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		clockIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		clockIcon.setAttribute('width', '20');
		clockIcon.setAttribute('height', '20');
		clockIcon.setAttribute('viewBox', '0 0 24 24');
		clockIcon.setAttribute('fill', 'none');
		clockIcon.setAttribute('stroke', 'currentColor');
		clockIcon.setAttribute('stroke-width', '1.5');
		clockIcon.setAttribute('stroke-linecap', 'round');
		clockIcon.setAttribute('stroke-linejoin', 'round');
		clockIcon.classList.add('svg-icon');
		clockIcon.classList.add('lucide-clock');
		clockIcon.style.display = 'inline-block';
		clockIcon.style.verticalAlign = 'middle';
		clockIcon.style.marginRight = '4px';
		
		const clockCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		clockCircle.setAttribute('cx', '12');
		clockCircle.setAttribute('cy', '12');
		clockCircle.setAttribute('r', '10');
		clockIcon.appendChild(clockCircle);
		
		const clockPolyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
		clockPolyline.setAttribute('points', '12 6 12 12 16 14');
		clockIcon.appendChild(clockPolyline);
		
		pluginTitle.appendChild(clockIcon);
		pluginTitle.createSpan({ text: 'How Long to Read This Text' });
		
		// Centered content wrapper for everything below the title
		const centeredContent = mainContent.createDiv('reading-time-centered-content');
		
		// Note title header (only shown when analyzing whole note)
		if (this.isWholeNote && this.noteTitle) {
			const noteTitleContainer = centeredContent.createDiv('reading-time-note-title');
			
			// Single line with text and note link
			noteTitleContainer.createSpan({ text: 'Next time you can select some text, right now we are using this full note: ' });
			const noteLink = noteTitleContainer.createSpan({ cls: 'reading-time-accent reading-time-note-link' });
			noteLink.textContent = `[[${this.noteTitle}]]`;
			
			// Check if note link would overflow and force it to its own line
			setTimeout(() => {
				const container = noteTitleContainer.getBoundingClientRect();
				const linkTextWidth = noteLink.scrollWidth;
				
				// If link text is wider than available space, put it on its own line
				if (linkTextWidth > container.width * 0.85) {
					noteLink.style.display = 'block';
					noteLink.style.marginTop = '0.25rem';
				}
			}, 0);
			noteLink.style.cursor = 'pointer';
			noteLink.addEventListener('click', async (e) => {
				e.preventDefault();
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
			});
		}
		
		// Heading
		centeredContent.createEl('div', { 
			text: 'You\'d read this in:', 
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
		const becauseDiv = timeDisplay.createDiv('reading-time-because');
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
		
		// First line: "[speed] Words Per Minute"
		const firstLine = displayContent.createDiv('reading-time-dropdown-line');
		firstLine.createSpan({ text: `${currentPreset.speed} `, cls: 'reading-time-accent' });
		const wpmPhrase = firstLine.createSpan({ cls: 'reading-time-wpm-phrase' });
		wpmPhrase.createSpan({ text: 'W', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'ords ' });
		wpmPhrase.createSpan({ text: 'P', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'er ' });
		wpmPhrase.createSpan({ text: 'M', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'inute' });
		
		// Second line: "(preset name)"
		const secondLine = displayContent.createDiv('reading-time-dropdown-line');
		secondLine.createSpan({ text: `(${currentPreset.name})`, cls: 'reading-time-accent' });
		
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
			
			if (isOpen) {
				// First show it to measure its height
				dropdownMenu.style.display = 'block';
				dropdownMenu.style.visibility = 'hidden';
				
				// Calculate available space below and above the dropdown button
				const buttonRect = dropdownButton.getBoundingClientRect();
				const menuRect = dropdownMenu.getBoundingClientRect();
				const viewportHeight = window.innerHeight;
				
				const spaceBelow = viewportHeight - buttonRect.bottom;
				const spaceAbove = buttonRect.top;
				const menuHeight = menuRect.height;
				
				// If not enough space below but enough space above, open upwards
				if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
					dropdownMenu.classList.add('reading-time-dropdown-menu-up');
					dropdownMenu.style.top = 'auto';
					dropdownMenu.style.bottom = '100%';
					dropdownMenu.style.marginTop = '0';
					dropdownMenu.style.marginBottom = '0.25rem';
				} else {
					dropdownMenu.classList.remove('reading-time-dropdown-menu-up');
					dropdownMenu.style.top = '100%';
					dropdownMenu.style.bottom = 'auto';
					dropdownMenu.style.marginTop = '0.25rem';
					dropdownMenu.style.marginBottom = '0';
				}
				
				// Make it visible now
				dropdownMenu.style.visibility = 'visible';
			} else {
				dropdownMenu.style.display = 'none';
				dropdownMenu.style.visibility = '';
			}
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
		
		// Settings link below dropdown
		if (this.onOpenSettings) {
			const settingsLink = speedDiv.createDiv('reading-time-settings-link');
			settingsLink.style.cursor = 'pointer';
			settingsLink.style.display = 'flex';
			settingsLink.style.alignItems = 'center';
			settingsLink.style.justifyContent = 'center';
			settingsLink.style.gap = '0.375rem';
			settingsLink.style.marginTop = '0.5rem';
			settingsLink.style.fontSize = '0.875rem';
			settingsLink.style.color = 'var(--text-muted)';
			settingsLink.style.transition = 'color 0.15s ease';
			
			// Wrapper span for underline effect that covers everything
			const underlineWrapper = settingsLink.createSpan();
			underlineWrapper.style.display = 'inline-flex';
			underlineWrapper.style.alignItems = 'baseline';
			underlineWrapper.style.gap = '0.375rem';
			underlineWrapper.style.borderBottom = '1px solid currentColor';
			underlineWrapper.style.paddingBottom = '0.05em';
			
			// Create gear icon SVG
			const gearIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			gearIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			gearIcon.setAttribute('width', '14');
			gearIcon.setAttribute('height', '14');
			gearIcon.setAttribute('viewBox', '0 0 24 24');
			gearIcon.setAttribute('fill', 'none');
			gearIcon.setAttribute('stroke', 'currentColor');
			gearIcon.setAttribute('stroke-width', '1.5');
			gearIcon.setAttribute('stroke-linecap', 'round');
			gearIcon.setAttribute('stroke-linejoin', 'round');
			gearIcon.classList.add('svg-icon');
			gearIcon.classList.add('lucide-settings');
			
			// Gear icon paths (lucide-settings icon)
			const gearPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			gearPath1.setAttribute('d', 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z');
			gearIcon.appendChild(gearPath1);
			
			const gearCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			gearCircle.setAttribute('cx', '12');
			gearCircle.setAttribute('cy', '12');
			gearCircle.setAttribute('r', '3');
			gearIcon.appendChild(gearCircle);
			
			underlineWrapper.appendChild(gearIcon);
			underlineWrapper.createSpan({ text: 'You can change this ' });
			
			// Arrow up icon after "this"
			const arrowUpIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			arrowUpIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
			arrowUpIcon.setAttribute('width', '12');
			arrowUpIcon.setAttribute('height', '12');
			arrowUpIcon.setAttribute('viewBox', '0 0 24 24');
			arrowUpIcon.setAttribute('fill', 'none');
			arrowUpIcon.setAttribute('stroke', 'currentColor');
			arrowUpIcon.setAttribute('stroke-width', '1.5');
			arrowUpIcon.setAttribute('stroke-linecap', 'round');
			arrowUpIcon.setAttribute('stroke-linejoin', 'round');
			arrowUpIcon.classList.add('svg-icon');
			arrowUpIcon.classList.add('lucide-arrow-up');
			arrowUpIcon.style.display = 'inline-block';
			arrowUpIcon.style.verticalAlign = 'middle';
			arrowUpIcon.style.marginLeft = '0.125rem';
			arrowUpIcon.style.marginRight = '0.125rem';
			
			const arrowUpPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			arrowUpPath.setAttribute('d', 'm5 12 7-7 7 7');
			arrowUpIcon.appendChild(arrowUpPath);
			
			const arrowUpLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
			arrowUpLine.setAttribute('x1', '12');
			arrowUpLine.setAttribute('x2', '12');
			arrowUpLine.setAttribute('y1', '19');
			arrowUpLine.setAttribute('y2', '5');
			arrowUpIcon.appendChild(arrowUpLine);
			
			underlineWrapper.appendChild(arrowUpIcon);
			underlineWrapper.createSpan({ text: ' in the settings' });
			
			settingsLink.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				if (this.onOpenSettings) {
					this.onOpenSettings();
				}
			});
			
			settingsLink.addEventListener('mouseenter', () => {
				settingsLink.style.color = 'var(--text-normal)';
			});
			
			settingsLink.addEventListener('mouseleave', () => {
				settingsLink.style.color = 'var(--text-muted)';
			});
		}
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
		if (this.metadataCleanup) {
			this.metadataCleanup();
			this.metadataCleanup = undefined;
		}
		if (this.renameCleanup) {
			this.renameCleanup();
			this.renameCleanup = undefined;
		}
		if (this.workspaceCleanup) {
			this.workspaceCleanup();
			this.workspaceCleanup = undefined;
		}
		contentEl.empty();
	}
}
