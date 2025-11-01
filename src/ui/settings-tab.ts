import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import { WPMTimePlugin } from '../types';

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

		new Setting(containerEl)
			.setName('Reading speed (WPM)')
			.setDesc('Set your silent reading speed in words per minute. Average reading speed is around 250-300 WPM.')
			.addText(text => text
				.setPlaceholder('250')
				.setValue(this.plugin.settings.readingSpeed.toString())
				.onChange(async (value) => {
					const speed = parseInt(value, 10);
					if (isNaN(speed) || speed <= 0) {
						new Notice('Reading speed must be a positive number.');
						return;
					}
					this.plugin.settings.readingSpeed = speed;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Speaking speed (WPM)')
			.setDesc('Set your speaking/reading out loud speed in words per minute. Average speaking speed is around 150-200 WPM.')
			.addText(text => text
				.setPlaceholder('200')
				.setValue(this.plugin.settings.speakingSpeed.toString())
				.onChange(async (value) => {
					const speed = parseInt(value, 10);
					if (isNaN(speed) || speed <= 0) {
						new Notice('Speaking speed must be a positive number.');
						return;
					}
					this.plugin.settings.speakingSpeed = speed;
					await this.plugin.saveSettings();
				}));
	}
}

