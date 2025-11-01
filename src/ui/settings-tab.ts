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

		containerEl.createEl('h2', { text: 'Settings' });

		// Description
		containerEl.createEl('p', { 
			text: 'Configure your reading speed presets. You can add multiple presets and switch between them using the dropdown in the reading time view.',
			cls: 'setting-item-description'
		});

		// Default preset selector
		new Setting(containerEl)
			.setName('Default preset')
			.setDesc('Which preset should be selected by default when calculating reading time?')
			.addDropdown(dropdown => {
				this.plugin.settings.presets.forEach(preset => {
					dropdown.addOption(preset.id, preset.name);
				});
				dropdown.setValue(this.plugin.settings.selectedPresetId);
				dropdown.onChange(async (value) => {
					this.plugin.settings.selectedPresetId = value;
					await this.plugin.saveSettings();
				});
			});

		// Presets section
		const presetsContainer = containerEl.createDiv('reading-time-presets-container');
		presetsContainer.createEl('h3', { text: 'Reading Speed Presets' });

		// Display all presets
		this.plugin.settings.presets.forEach((preset, index) => {
			this.renderPresetSetting(presetsContainer, preset, index);
		});

		// Add new preset button
		new Setting(presetsContainer)
			.setName('Add new preset')
			.setDesc('Create a new reading speed preset')
			.addButton(button => button
				.setButtonText('Add Preset')
				.setCta()
				.onClick(() => {
					const newPreset: WPMTimePreset = {
						id: `preset-${Date.now()}`,
						name: 'New Preset',
						speed: 200
					};
					this.plugin.settings.presets.push(newPreset);
					this.plugin.saveSettings().then(() => {
						this.display(); // Refresh the settings view
					});
				}));
	}

	private renderPresetSetting(containerEl: HTMLElement, preset: WPMTimePreset, index: number): void {
		// Preset container with border
		const presetContainer = containerEl.createDiv('reading-time-preset-container');
		
		// Preset header with name and delete button
		const presetHeader = presetContainer.createDiv('reading-time-preset-header');
		const presetTitle = presetHeader.createDiv('reading-time-preset-title');
		const presetTitleStrong = presetTitle.createEl('strong', { text: preset.name || `Preset ${index + 1}` });
		
		// Delete button in header (only if more than one preset)
		if (this.plugin.settings.presets.length > 1) {
			const deleteBtn = presetHeader.createEl('button', {
				text: 'Delete',
				cls: 'reading-time-delete-btn'
			});
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

		// Preset settings
		const presetSettings = presetContainer.createDiv('reading-time-preset-settings');

		// Preset name
		new Setting(presetSettings)
			.setName('Preset name')
			.setDesc('A descriptive name for this preset (e.g., "My Reading Time", "My Speaking Time")')
			.addText(text => text
				.setPlaceholder('Preset name')
				.setValue(preset.name)
				.onChange(async (value) => {
					if (!value || value.trim().length === 0) {
						new Notice('Preset name cannot be empty.');
						return;
					}
					const trimmedValue = value.trim();
					preset.name = trimmedValue;
					// Update the header text directly without re-rendering
					presetTitleStrong.textContent = trimmedValue;
					await this.plugin.saveSettings();
					// Only refresh if we need to update the default preset dropdown
					// We'll do a partial refresh by finding and updating just that dropdown
					const defaultPresetDropdown = containerEl.closest('.vertical-tab-content')?.querySelector('select') as HTMLSelectElement;
					if (defaultPresetDropdown) {
						// Update the option text in the default preset dropdown
						const option = Array.from(defaultPresetDropdown.options).find(opt => opt.value === preset.id);
						if (option) {
							option.textContent = trimmedValue;
						}
					}
				}));

		// Preset speed
		new Setting(presetSettings)
			.setName('Reading speed')
			.setDesc('Words per minute for this preset. Average reading speed is 250-300 WPM; average speaking speed is 150-200 WPM.')
			.addText(text => text
				.setPlaceholder('200')
				.setValue(preset.speed.toString())
				.onChange(async (value) => {
					const speed = parseInt(value, 10);
					if (isNaN(speed) || speed <= 0) {
						new Notice('Speed must be a positive number.');
						return;
					}
					preset.speed = speed;
					await this.plugin.saveSettings();
				}));
	}
}

