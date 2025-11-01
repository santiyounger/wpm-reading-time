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

		containerEl.createEl('h2', { text: 'WPM Reading Time Settings' });

		containerEl.createEl('p', { 
			text: 'Configure your reading speed presets. You can add multiple presets and switch between them using the dropdown in the reading time view.',
			cls: 'setting-item-description'
		});

		// Display all presets
		this.plugin.settings.presets.forEach((preset, index) => {
			this.renderPresetSetting(containerEl, preset, index);
		});

		// Add new preset button
		const addPresetContainer = containerEl.createDiv('setting-item');
		addPresetContainer.createEl('button', {
			text: '+ Add New Preset',
			cls: 'mod-cta'
		}).addEventListener('click', () => {
			const newPreset: WPMTimePreset = {
				id: `preset-${Date.now()}`,
				name: 'New Preset',
				speed: 200
			};
			this.plugin.settings.presets.push(newPreset);
			this.plugin.saveSettings().then(() => {
				this.display(); // Refresh the settings view
			});
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
	}

	private renderPresetSetting(containerEl: HTMLElement, preset: WPMTimePreset, index: number): void {
		const presetContainer = containerEl.createDiv('reading-time-preset-setting');
		
		const settingContainer = presetContainer.createDiv('setting-item');
		settingContainer.createEl('div', { 
			text: `Preset ${index + 1}`,
			cls: 'setting-item-name'
		});

		// Preset name
		new Setting(settingContainer)
			.setName('Preset name')
			.setDesc('A descriptive name for this preset (e.g., "My Reading Time")')
			.addText(text => text
				.setPlaceholder('Preset name')
				.setValue(preset.name)
				.onChange(async (value) => {
					if (!value || value.trim().length === 0) {
						new Notice('Preset name cannot be empty.');
						return;
					}
					preset.name = value.trim();
					await this.plugin.saveSettings();
					this.display(); // Refresh to update dropdown
				}));

		// Preset speed
		new Setting(settingContainer)
			.setName('Speed (WPM)')
			.setDesc('Words per minute for this preset')
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

		// Delete button
		if (this.plugin.settings.presets.length > 1) {
			new Setting(settingContainer)
				.setName('')
				.addButton(button => button
					.setButtonText('Delete')
					.setWarning()
					.onClick(async () => {
						// Remove preset
						this.plugin.settings.presets = this.plugin.settings.presets.filter(p => p.id !== preset.id);
						
						// If this was the selected preset, switch to first available
						if (this.plugin.settings.selectedPresetId === preset.id) {
							this.plugin.settings.selectedPresetId = this.plugin.settings.presets[0]?.id || '';
						}
						
						await this.plugin.saveSettings();
						this.display(); // Refresh the settings view
					}));
		}

		containerEl.createEl('hr');
	}
}

