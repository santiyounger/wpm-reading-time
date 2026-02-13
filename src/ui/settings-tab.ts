import { App, Notice, PluginSettingTab, Setting, setIcon, setTooltip } from 'obsidian';
import { WPMTimePlugin } from '../types';
import { WPMTimePreset } from '../settings';

export class WPMTimeSettingTab extends PluginSettingTab {
	plugin: WPMTimePlugin;
	private eventCleanups: Array<() => void> = [];

	constructor(app: App, plugin: WPMTimePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		// Reset cleanup array when re-rendering
		this.eventCleanups = [];

		containerEl.empty();

		// Links container at top
		const linksContainer = containerEl.createDiv('setting-item-description reading-time-links-container reading-time-links-container-flex');

		// Contact Santi link
		const supportLink = linksContainer.createEl('a', {
			href: 'https://www.santiyounger.com/contact',
			attr: {
				'aria-label': 'Contact santi (author)',
				'target': '_blank',
				'rel': 'noopener'
			},
			cls: 'reading-time-link'
		});
		const mailIconContainer = supportLink.createSpan();
		setIcon(mailIconContainer, 'mail');
		supportLink.createSpan({ text: 'Contact Santi (author)' });

		// GitHub link
		const githubLink = linksContainer.createEl('a', {
			href: 'https://github.com/santiyounger/wpm-reading-time',
			attr: {
				'aria-label': 'See code (GitHub)',
				'target': '_blank',
				'rel': 'noopener'
			},
			cls: 'reading-time-link'
		});
		const githubIconContainer = githubLink.createSpan();
		setIcon(githubIconContainer, 'github');
		githubLink.createSpan({ text: 'See code (GitHub)' });

		// Presets section
		const presetsContainer = containerEl.createDiv('reading-time-presets-container');

		// Header row
		const headerRow = presetsContainer.createDiv('reading-time-preset-header-row');
		
		// Default header with icon and subtitle
		const defaultHeader = headerRow.createDiv('reading-time-header-default');
		const defaultHeaderTitle = defaultHeader.createDiv('reading-time-header-default-title reading-time-header-with-icon');
		const starIconContainer = defaultHeaderTitle.createSpan();
		setIcon(starIconContainer, 'star');
		defaultHeaderTitle.createSpan({ text: 'Default' });
		defaultHeader.createEl('div', { text: 'Pick your default', cls: 'reading-time-header-default-subtitle' });
		
		// Speed header with subheading and icon
		const speedHeader = headerRow.createDiv('reading-time-header-speed');
		const speedHeaderTitle = speedHeader.createDiv('reading-time-header-speed-title reading-time-header-with-icon');
		const gaugeIconContainer = speedHeaderTitle.createSpan();
		setIcon(gaugeIconContainer, 'gauge');
		speedHeaderTitle.createSpan({ text: 'Speed' });
		const speedSubtitle = speedHeader.createEl('div', { cls: 'reading-time-header-speed-subtitle' });
		speedSubtitle.createSpan({ text: 'WPM stands for: ' });
		speedSubtitle.createEl('br');
		speedSubtitle.createSpan({ text: 'Words per minute' });
		
		// Title header with icon and subtitle
		const nameHeader = headerRow.createDiv('reading-time-header-name');
		const nameHeaderTitle = nameHeader.createDiv('reading-time-header-name-title reading-time-header-with-icon');
		const fileIconContainer = nameHeaderTitle.createSpan();
		setIcon(fileIconContainer, 'file-text');
		nameHeaderTitle.createSpan({ text: 'Title' });
		const nameSubtitle = nameHeader.createEl('div', { cls: 'reading-time-header-name-subtitle' });
		nameSubtitle.createSpan({ text: 'You can add an optional title' });
		nameSubtitle.createEl('br');
		nameSubtitle.createSpan({ text: 'Example: My speaking speed' });
		headerRow.createEl('div', { text: '', cls: 'reading-time-header-delete' }); // Empty for delete button column

		// Display all presets
		this.plugin.settings.presets.forEach((preset, index) => {
			this.renderPresetSetting(presetsContainer, preset, index);
		});

		// Add new preset button with calculator on the left
		const addPresetSetting = new Setting(presetsContainer);
		// Layout: calculator flush-left, button flush-right
		addPresetSetting.controlEl.classList.add('reading-time-add-preset-control');
		
		// WPM calculator link (on the left side of the add button)
		const wpmCalculatorLink = addPresetSetting.controlEl.createDiv('reading-time-wpm-calculator reading-time-wpm-calculator-flex');
		const calcIconContainer = wpmCalculatorLink.createSpan();
		setIcon(calcIconContainer, 'calculator');
		wpmCalculatorLink.createSpan({ text: 'To find out your reading speed (' });
		const wpmPhrase = wpmCalculatorLink.createSpan({ cls: 'reading-time-wpm-phrase' });
		wpmPhrase.createSpan({ text: 'W', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'ords ' });
		wpmPhrase.createSpan({ text: 'P', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'er ' });
		wpmPhrase.createSpan({ text: 'M', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'inute' });
		wpmCalculatorLink.createSpan({ text: '), ' });
		wpmCalculatorLink.createEl('br');
		wpmCalculatorLink.createSpan({ text: 'use ' });
		const calcLink = wpmCalculatorLink.createEl('a', {
			href: 'https://www.santiyounger.com/wpm-calculator',
			attr: { target: '_blank', rel: 'noopener' }
		});
		calcLink.textContent = 'This free calculator';
		wpmCalculatorLink.createSpan({ text: '.' });
		
		addPresetSetting.addButton(button => button
			.setIcon('plus')
			.setTooltip('To find out your reading speed, use the calculator. Select to add a new preset')
				.setCta()
				.onClick(() => {
					const newPreset: WPMTimePreset = {
						id: `preset-${Date.now()}`,
					name: '',
					speed: 0  // Start with 0 instead of auto-filling
					};
					this.plugin.settings.presets.push(newPreset);
					void this.plugin.saveSettings().then(() => {
						this.display(); // Refresh the settings view
					});
				}));

		// Learn more about my work section
		const learnMoreContainer = containerEl.createDiv('reading-time-learn-more');
		
		const learnMoreInner = learnMoreContainer.createDiv('reading-time-learn-more-inner');
		
		const learnMoreText = learnMoreInner.createDiv('reading-time-learn-more-text');

		// Briefcase icon
		const briefcaseIconContainer = learnMoreText.createSpan();
		setIcon(briefcaseIconContainer, 'briefcase');

		learnMoreText.createEl('span', { text: 'Check out my work at:' });

		// External link icon
		const learnMoreLink = learnMoreInner.createEl('a', {
			href: 'https://santiyounger.com/',
			attr: { target: '_blank', rel: 'noopener' }
		});
		const externalIconContainer = learnMoreLink.createSpan();
		setIcon(externalIconContainer, 'external-link');
		learnMoreLink.createEl('span', { text: 'Santiyounger.com' });
	}

	private renderPresetSetting(containerEl: HTMLElement, preset: WPMTimePreset, index: number): void {
		// Preset container with horizontal layout
		const presetContainer = containerEl.createDiv('reading-time-preset-container');

		// Default checkbox (first column)
		const defaultCheckboxWrapper = presetContainer.createDiv('reading-time-default-wrapper');
		const defaultCheckbox = defaultCheckboxWrapper.createEl('input', {
			type: 'checkbox',
			cls: 'reading-time-default-checkbox',
			attr: { 'aria-label': 'Set as default preset' }
		});
		defaultCheckbox.checked = this.plugin.settings.selectedPresetId === preset.id;
		defaultCheckbox.addEventListener('change', (e) => {
			const target = e.target as HTMLInputElement;
			void (async () => {
				if (target.checked) {
					// Uncheck all other checkboxes and set this as default
					this.containerEl.querySelectorAll('.reading-time-default-checkbox').forEach((cb: HTMLInputElement) => {
						if (cb !== target) {
							cb.checked = false;
						}
					});
					this.plugin.settings.selectedPresetId = preset.id;
					await this.plugin.saveSettings();
				} else {
					// If trying to uncheck the default, switch to first other preset if available
					if (this.plugin.settings.selectedPresetId === preset.id) {
						const firstOtherPreset = this.plugin.settings.presets.find(p => p.id !== preset.id);
						if (firstOtherPreset) {
							const firstCheckbox = this.containerEl.querySelector(`input[data-preset-id="${firstOtherPreset.id}"]`) as HTMLInputElement;
							if (firstCheckbox) {
								target.checked = false;
								firstCheckbox.checked = true;
								this.plugin.settings.selectedPresetId = firstOtherPreset.id;
								await this.plugin.saveSettings();
							} else {
								target.checked = true; // Can't uncheck if no other preset found
							}
						} else {
							target.checked = true; // Only one preset, must stay checked
						}
					}
				}
			})();
		});
		defaultCheckbox.setAttribute('data-preset-id', preset.id);

		// Speed input with WPM label
		const speedWrapper = presetContainer.createDiv('reading-time-speed-wrapper');
		
		// WPM calculator button (first, on the left)
		const calculatorBtnContainer = speedWrapper.createDiv('reading-time-wpm-calculator-btn-container');
		const calculatorBtn = calculatorBtnContainer.createEl('button', {
			cls: 'clickable-icon reading-time-wpm-calculator-btn',
			attr: {
				'aria-label': 'Find your reading speed'
			}
		});
		const iconContainer = calculatorBtn.createSpan();
		setIcon(iconContainer, 'help-circle');

		// Use Obsidian's tooltip - simpler and consistent
		setTooltip(calculatorBtn, 'To find out your reading speed (Words Per Minute), use this free calculator: https://www.santiyounger.com/wpm-calculator', {
			placement: 'right'
		});

		// Speed input (only numbers, right-aligned)
		const speedInput = speedWrapper.createEl('input', {
			type: 'text',
			attr: {
				spellcheck: 'false',
				placeholder: 'Use calculator below'
			},
			cls: 'reading-time-speed-input'
		});
		// Only show speed if it's a valid positive number
		speedInput.value = (preset.speed && preset.speed > 0) ? preset.speed.toString() : '';

		speedWrapper.createEl('span', { text: 'WPM', cls: 'reading-time-speed-label' });
		// Only allow numbers in speed input
		speedInput.addEventListener('input', (e) => {
			void (async () => {
				const target = e.target as HTMLInputElement;
				// Remove any non-numeric characters
				const numericValue = target.value.replace(/[^\d]/g, '');
				if (target.value !== numericValue) {
					target.value = numericValue;
				}
				
				const speed = parseInt(numericValue, 10);
				if (!numericValue) {
					preset.speed = 0;
					await this.plugin.saveSettings();
					return; // Allow empty during typing
				}
				if (isNaN(speed) || speed <= 0) {
					return; // Don't show notice while typing
				}
				preset.speed = speed;
				await this.plugin.saveSettings();
			})();
		});
		speedInput.addEventListener('blur', (e) => {
			void (async () => {
				const target = e.target as HTMLInputElement;
				const speed = parseInt(target.value, 10);
				if (!target.value || isNaN(speed) || speed <= 0) {
					// If empty or invalid, set to 0 (which will exclude it from being used)
					if (!target.value) {
						preset.speed = 0;
						target.value = '';
					} else {
						new Notice('Speed must be a positive number.');
						target.value = (preset.speed && preset.speed > 0) ? preset.speed.toString() : '';
					}
					await this.plugin.saveSettings();
					// Refresh dropdown to exclude invalid presets
					this.display();
				}
			})();
		});

		// Title input
		const nameInput = presetContainer.createEl('input', {
			type: 'text',
			attr: { spellcheck: 'false', placeholder: 'Optional title' },
			cls: 'reading-time-name-input'
		});
		nameInput.value = preset.name;
		nameInput.addEventListener('input', (e) => {
			void (async () => {
				const target = e.target as HTMLInputElement;
				preset.name = target.value.trim();
				await this.plugin.saveSettings();
			})();
		});

		// Delete button (only if more than one preset)
		if (this.plugin.settings.presets.length > 1) {
			const deleteBtn = presetContainer.createEl('button', {
				attr: { 'aria-label': 'Delete preset' },
				cls: 'reading-time-delete-btn'
			});
			const trashIconContainer = deleteBtn.createSpan();
			setIcon(trashIconContainer, 'trash-2');
			deleteBtn.addEventListener('click', () => {
				void (async () => {
					// Remove preset
					this.plugin.settings.presets = this.plugin.settings.presets.filter(p => p.id !== preset.id);
					
					// If this was the selected preset, switch to first available
					if (this.plugin.settings.selectedPresetId === preset.id) {
						this.plugin.settings.selectedPresetId = this.plugin.settings.presets[0]?.id || '';
					}
					
					await this.plugin.saveSettings();
					this.display(); // Refresh the settings view
				})();
			});
		}
	}

	hide(): void {
		// Clean up all event listeners (if any were tracked)
		this.eventCleanups.forEach(cleanup => cleanup());
		this.eventCleanups = [];

		// Call parent implementation
		super.hide();
	}
}

