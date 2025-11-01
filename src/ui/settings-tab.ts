import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import { WPMTimePlugin } from '../types';
import { WPMTimePreset } from '../settings';

export class WPMTimeSettingTab extends PluginSettingTab {
	plugin: WPMTimePlugin;

	constructor(app: App, plugin: WPMTimePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'How Long to Read (Reading Time WPM)' });

		// Presets section
		const presetsContainer = containerEl.createDiv('reading-time-presets-container');

		// Header row
		const headerRow = presetsContainer.createDiv('reading-time-preset-header-row');
		headerRow.createEl('div', { text: 'Default', cls: 'reading-time-header-default' });
		headerRow.createEl('div', { text: 'Speed', cls: 'reading-time-header-speed' });
		headerRow.createEl('div', { text: 'Name', cls: 'reading-time-header-name' });
		headerRow.createEl('div', { text: '', cls: 'reading-time-header-delete' }); // Empty for delete button column

		// Display all presets
		this.plugin.settings.presets.forEach((preset, index) => {
			this.renderPresetSetting(presetsContainer, preset, index);
		});

		// Add new preset button
		new Setting(presetsContainer)
			.addButton(button => button
				.setIcon('plus')
				.setTooltip('Add preset')
				.setCta()
				.onClick(() => {
					const newPreset: WPMTimePreset = {
						id: `preset-${Date.now()}`,
						name: '',
						speed: 200
					};
					this.plugin.settings.presets.push(newPreset);
					this.plugin.saveSettings().then(() => {
						this.display(); // Refresh the settings view
					});
				}));

		// WPM description below presets
		const wpmDesc = presetsContainer.createDiv('reading-time-wpm-description');
		wpmDesc.textContent = 'WPM = Words Per Minute';

		// WPM calculator link
		const wpmCalculatorLink = presetsContainer.createDiv('reading-time-wpm-calculator');
		wpmCalculatorLink.innerHTML = 'To find out your reading speed, I put together a calculator for you in my <a href="http://localhost:6074/wpm-calculator" target="_blank" rel="noopener">website</a>.';
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
		defaultCheckbox.addEventListener('change', async (e) => {
			const target = e.target as HTMLInputElement;
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
		});
		defaultCheckbox.setAttribute('data-preset-id', preset.id);

		// Speed input with WPM label
		const speedWrapper = presetContainer.createDiv('reading-time-speed-wrapper');
		const speedInput = speedWrapper.createEl('input', {
			type: 'text',
			attr: { spellcheck: 'false', placeholder: '200' },
			cls: 'reading-time-speed-input'
		});
		speedInput.value = preset.speed.toString();
		const speedLabel = speedWrapper.createEl('span', { text: 'WPM', cls: 'reading-time-speed-label' });
		
		// WPM calculator button
		const wpmCalculatorBtn = speedWrapper.createEl('button', {
			cls: 'reading-time-wpm-calculator-btn',
			attr: { 
				'aria-label': 'Find your reading speed',
				'title': 'Find your reading speed with WPM Calculator'
			}
		});
		wpmCalculatorBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>';
		wpmCalculatorBtn.addEventListener('click', (e) => {
			e.preventDefault();
			window.open('http://localhost:6074/wpm-calculator', '_blank', 'noopener,noreferrer');
		});
		speedInput.addEventListener('input', async (e) => {
			const target = e.target as HTMLInputElement;
			const speed = parseInt(target.value, 10);
			if (!target.value) return; // Allow empty during typing
			if (isNaN(speed) || speed <= 0) {
				return; // Don't show notice while typing
			}
			preset.speed = speed;
			await this.plugin.saveSettings();
		});
		speedInput.addEventListener('blur', async (e) => {
			const target = e.target as HTMLInputElement;
			const speed = parseInt(target.value, 10);
			if (isNaN(speed) || speed <= 0) {
				new Notice('Speed must be a positive number.');
				target.value = preset.speed.toString(); // Reset to valid value
			}
		});

		// Name input
		const nameInput = presetContainer.createEl('input', {
			type: 'text',
			attr: { spellcheck: 'false', placeholder: 'Optional name' },
			cls: 'reading-time-name-input'
		});
		nameInput.value = preset.name;
		nameInput.addEventListener('input', async (e) => {
			const target = e.target as HTMLInputElement;
			preset.name = target.value.trim();
			await this.plugin.saveSettings();
		});

		// Delete button (only if more than one preset)
		if (this.plugin.settings.presets.length > 1) {
			const deleteBtn = presetContainer.createEl('button', {
				attr: { 'aria-label': 'Delete preset' },
				cls: 'reading-time-delete-btn'
			});
			deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
			deleteBtn.addEventListener('click', async () => {
				// Remove preset
				this.plugin.settings.presets = this.plugin.settings.presets.filter(p => p.id !== preset.id);
				
				// If this was the selected preset, switch to first available
				if (this.plugin.settings.selectedPresetId === preset.id) {
					this.plugin.settings.selectedPresetId = this.plugin.settings.presets[0]?.id || '';
				}
				
				await this.plugin.saveSettings();
				this.display(); // Refresh the settings view
			});
		}
	}

}

