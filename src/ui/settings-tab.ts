import { App, Notice, PluginSettingTab, setIcon, setTooltip } from 'obsidian';
import { WPMTimePlugin } from '../types';
import { WPMTimePreset } from '../settings';

export class WPMTimeSettingTab extends PluginSettingTab {
	plugin: WPMTimePlugin;
	/** Inline control in the calculator blurb; kept in sync with the primary speed field. */
	private calculatorPrimarySpeedEl: HTMLElement | null = null;

	constructor(app: App, plugin: WPMTimePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		const hasMultiplePresets = this.plugin.settings.presets.length > 1;

		containerEl.empty();
		this.calculatorPrimarySpeedEl = null;

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

		// Calculator helper below the top links
		const calculatorHelperContainer = containerEl.createDiv('reading-time-add-preset-section');
		const wpmCalculatorLink = calculatorHelperContainer.createDiv('reading-time-wpm-calculator reading-time-wpm-calculator-flex');
		const calcIconContainer = wpmCalculatorLink.createSpan();
		setIcon(calcIconContainer, 'calculator');
		const calculatorIntro = wpmCalculatorLink.createDiv('reading-time-wpm-calculator-line');
		calculatorIntro.createSpan({ text: 'Your current speed is set to ' });
		const speedTrigger = calculatorIntro.createEl('button', {
			type: 'button',
			cls: 'reading-time-wpm-calculator-speed-trigger',
			text: this.formatPrimarySpeedDisplay()
		});
		speedTrigger.setAttribute(
			'aria-label',
			`Focus speed field (currently ${this.formatPrimarySpeedForAria()} words per minute)`
		);
		this.calculatorPrimarySpeedEl = speedTrigger;
		speedTrigger.addEventListener('click', () => {
			const input = containerEl.querySelector(
				'#reading-time-settings-primary-speed-input'
			) as HTMLInputElement | null;
			input?.focus();
			input?.select();
		});
		calculatorIntro.createSpan({
			text: '. Click it to select the speed field and change it. To find out your ('
		});
		const wpmPhrase = calculatorIntro.createSpan({ cls: 'reading-time-wpm-phrase' });
		wpmPhrase.createSpan({ text: 'W', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'ords ' });
		wpmPhrase.createSpan({ text: 'P', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'er ' });
		wpmPhrase.createSpan({ text: 'M', cls: 'reading-time-accent' });
		wpmPhrase.createSpan({ text: 'inute' });
		calculatorIntro.createSpan({ text: ') reading speed' });
		const calculatorAction = wpmCalculatorLink.createDiv('reading-time-wpm-calculator-line');
		calculatorAction.createSpan({ text: 'with ' });
		const calcLink = calculatorAction.createEl('a', {
			href: 'https://www.santiyounger.com/wpm-calculator',
			attr: { target: '_blank', rel: 'noopener' }
		});
		calcLink.textContent = 'My free online calculator';
		calculatorAction.createSpan({ text: '.' });

		// Presets section
		const presetsContainer = containerEl.createDiv('reading-time-presets-container');
		const presetListContainer = presetsContainer.createDiv('reading-time-preset-list');
		presetListContainer.classList.add(hasMultiplePresets ? 'reading-time-preset-list-multiple' : 'reading-time-preset-list-single');

		// Header row
		const headerRow = presetListContainer.createDiv('reading-time-preset-header-row');
		
		if (hasMultiplePresets) {
			// Default header with icon and subtitle
			const defaultHeader = headerRow.createDiv('reading-time-header-default');
			const defaultHeaderTitle = defaultHeader.createDiv('reading-time-header-default-title reading-time-header-with-icon');
			const starIconContainer = defaultHeaderTitle.createSpan();
			setIcon(starIconContainer, 'star');
			defaultHeaderTitle.createSpan({ text: 'Default' });
			defaultHeader.createEl('div', {
				text: 'Pick your default',
				cls: 'reading-time-header-default-subtitle'
			});
		}
		
		// Speed header with subheading and icon
		const speedHeader = headerRow.createDiv('reading-time-header-speed');
		const speedHeaderTitle = speedHeader.createDiv('reading-time-header-speed-title reading-time-header-with-icon');
		const gaugeIconContainer = speedHeaderTitle.createSpan();
		setIcon(gaugeIconContainer, 'gauge');
		speedHeaderTitle.createSpan({ text: 'Speed' });
		speedHeader.createEl('div', {
			text: 'Reading speed.\nUse the calculator link above to find the right number for you.',
			cls: 'reading-time-header-speed-subtitle'
		});
		
		// Title header with icon and subtitle
		const nameHeader = headerRow.createDiv('reading-time-header-name');
		const nameHeaderTitle = nameHeader.createDiv('reading-time-header-name-title reading-time-header-with-icon');
		const fileIconContainer = nameHeaderTitle.createSpan();
		setIcon(fileIconContainer, 'file-text');
		nameHeaderTitle.createSpan({ text: 'Title' });
		nameHeader.createEl('div', {
			text: 'Optional title.\nFor example: my speaking speed.',
			cls: 'reading-time-header-name-subtitle'
		});
		if (hasMultiplePresets) {
			headerRow.createEl('div', { text: '', cls: 'reading-time-header-delete' });
		}

		// Display all presets
		this.plugin.settings.presets.forEach((preset) => {
			this.renderPresetSetting(presetListContainer, preset);
		});
		this.reconcilePrimarySpeedInputId();

		const addPresetButton = presetListContainer.createEl('button', {
			cls: 'mod-cta reading-time-add-preset-btn',
			attr: {
				'aria-label': 'Add a new preset'
			}
		});
		setIcon(addPresetButton, 'plus');
		addPresetButton.createSpan({ text: 'Add preset' });
		addPresetButton.addEventListener('click', () => {
			const newPreset: WPMTimePreset = {
				id: `preset-${Date.now()}`,
				name: '',
				speed: 0
			};
			this.plugin.settings.presets.push(newPreset);
			void this.plugin.saveSettings().then(() => {
				this.display();
			});
		});
		presetListContainer.createEl('div', {
			cls: 'reading-time-add-preset-note',
			text: 'You can optionally add more presets. When you use the plugin in your notes, they appear in a dropdown so you can pick different speeds—for example, "reading speed" versus "speaking out loud speed".'
		});

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
		learnMoreLink.createEl('span', { text: 'santiyounger.com' });
	}

	private renderPresetSetting(containerEl: HTMLElement, preset: WPMTimePreset): void {
		const hasMultiplePresets = this.plugin.settings.presets.length > 1;
		// Outer preset container
		const presetContainer = containerEl.createDiv('reading-time-preset-container');
		const presetRow = presetContainer.createDiv('reading-time-preset-row');

		if (hasMultiplePresets) {
			// Default checkbox (first column)
			const defaultCheckboxWrapper = presetRow.createDiv('reading-time-default-wrapper');
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
						this.containerEl.querySelectorAll('.reading-time-default-checkbox').forEach((cb: HTMLInputElement) => {
							if (cb !== target) {
								cb.checked = false;
							}
						});
						this.plugin.settings.selectedPresetId = preset.id;
						await this.plugin.saveSettings();
						this.reconcilePrimarySpeedInputId();
						this.syncCalculatorPrimarySpeedUI();
					} else if (this.plugin.settings.selectedPresetId === preset.id) {
						const firstOtherPreset = this.plugin.settings.presets.find(p => p.id !== preset.id);
						if (firstOtherPreset) {
							const firstCheckbox = this.containerEl.querySelector(`input[data-preset-id="${firstOtherPreset.id}"]`) as HTMLInputElement;
							if (firstCheckbox) {
								target.checked = false;
								firstCheckbox.checked = true;
								this.plugin.settings.selectedPresetId = firstOtherPreset.id;
								await this.plugin.saveSettings();
								this.reconcilePrimarySpeedInputId();
								this.syncCalculatorPrimarySpeedUI();
							} else {
								target.checked = true;
							}
						} else {
							target.checked = true;
						}
					}
				})();
			});
			defaultCheckbox.setAttribute('data-preset-id', preset.id);
		}

		// Speed input with WPM label
		const speedWrapper = presetRow.createDiv('reading-time-speed-wrapper');
		
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
				placeholder: 'Enter WPM',
				'data-preset-id': preset.id
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
					if (preset.id === this.getPrimaryPreset()?.id) {
						this.syncCalculatorPrimarySpeedUI();
					}
					return; // Allow empty during typing
				}
				if (isNaN(speed) || speed <= 0) {
					return; // Don't show notice while typing
				}
				preset.speed = speed;
				await this.plugin.saveSettings();
				if (preset.id === this.getPrimaryPreset()?.id) {
					this.syncCalculatorPrimarySpeedUI();
				}
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
		const nameInput = presetRow.createEl('input', {
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
		if (hasMultiplePresets) {
			const deleteBtn = presetRow.createEl('button', {
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

	private getPrimaryPreset(): WPMTimePreset | undefined {
		const { presets, selectedPresetId } = this.plugin.settings;
		if (!presets.length) return undefined;
		return presets.find((p) => p.id === selectedPresetId) ?? presets[0];
	}

	private formatPrimarySpeedDisplay(): string {
		const p = this.getPrimaryPreset();
		return p?.speed && p.speed > 0 ? String(p.speed) : 'Not set';
	}

	private formatPrimarySpeedForAria(): string {
		const p = this.getPrimaryPreset();
		return p?.speed && p.speed > 0 ? String(p.speed) : 'not set yet';
	}

	private syncCalculatorPrimarySpeedUI(): void {
		if (!this.calculatorPrimarySpeedEl) return;
		this.calculatorPrimarySpeedEl.textContent = this.formatPrimarySpeedDisplay();
		this.calculatorPrimarySpeedEl.setAttribute(
			'aria-label',
			`Focus speed field (currently ${this.formatPrimarySpeedForAria()} words per minute)`
		);
	}

	private reconcilePrimarySpeedInputId(): void {
		const primary = this.getPrimaryPreset();
		this.containerEl.querySelectorAll('.reading-time-speed-input').forEach((el) => {
			const input = el as HTMLInputElement;
			input.removeAttribute('id');
			if (primary && input.dataset.presetId === primary.id) {
				input.id = 'reading-time-settings-primary-speed-input';
			}
		});
	}

	hide(): void {
		super.hide();
	}
}

