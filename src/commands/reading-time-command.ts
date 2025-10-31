import { Editor, MarkdownView, Notice } from 'obsidian';
import { calculateReadingTime } from '../utils/reading-time';
import { WPMTimePlugin } from '../types';

export function registerReadingTimeCommand(plugin: WPMTimePlugin): void {
	plugin.addCommand({
		id: 'calculate-reading-time',
		name: 'Calculate reading time',
		editorCallback: (editor: Editor, view: MarkdownView) => {
			const selectedText = editor.getSelection();
			
			if (!selectedText || selectedText.trim().length === 0) {
				new Notice('Please select some text first.');
				return;
			}

			const wpm = plugin.settings.wpm;
			const { formatted, totalSeconds } = calculateReadingTime(selectedText, wpm);
			
			const message = `Reading time: ${formatted} (${totalSeconds} seconds at ${wpm} WPM)`;
			new Notice(message, 5000);
		}
	});
}

