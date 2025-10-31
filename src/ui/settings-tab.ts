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
			.setName('Words per minute (WPM)')
			.setDesc('Set your reading speed in words per minute. Average reading speed is around 200-250 WPM.')
			.addText(text => text
				.setPlaceholder('200')
				.setValue(this.plugin.settings.wpm.toString())
				.onChange(async (value) => {
					const wpm = parseInt(value, 10);
					if (isNaN(wpm) || wpm <= 0) {
						new Notice('WPM must be a positive number.');
						return;
					}
					this.plugin.settings.wpm = wpm;
					await this.plugin.saveSettings();
				}));
	}
}

