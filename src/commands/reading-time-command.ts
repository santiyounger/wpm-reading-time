import { Editor, MarkdownView, Notice } from 'obsidian';
import { calculateReadingTime } from '../utils/reading-time';
import { WPMTimePlugin } from '../types';
import { ReadingTimeView, READING_TIME_VIEW_TYPE } from '../ui/reading-time-view';

export function registerReadingTimeCommand(plugin: WPMTimePlugin & { view: ReadingTimeView | null }): void {
	plugin.addCommand({
		id: 'calculate-reading-time',
		name: 'Calculate reading time',
		editorCallback: async (editor: Editor, view: MarkdownView) => {
			const selectedText = editor.getSelection();
			
			if (!selectedText || selectedText.trim().length === 0) {
				new Notice('Please select some text first.');
				return;
			}

			const wpm = plugin.settings.wpm;
			const { formatted, totalSeconds, wordCount } = calculateReadingTime(selectedText, wpm);
			
			// Open or reveal the view in the right sidebar
			let readingTimeView: ReadingTimeView;
			const existingLeaves = plugin.app.workspace.getLeavesOfType(READING_TIME_VIEW_TYPE);
			
			if (existingLeaves.length > 0) {
				// View already exists, use it
				readingTimeView = existingLeaves[0].view as ReadingTimeView;
				plugin.view = readingTimeView;
			} else {
				// Create new view in right sidebar
				const leaf = plugin.app.workspace.getRightLeaf(false);
				if (!leaf) {
					new Notice('Could not open reading time view.');
					return;
				}
				await leaf.setViewState({
					type: READING_TIME_VIEW_TYPE,
					active: true,
				});
				readingTimeView = leaf.view as ReadingTimeView;
				plugin.view = readingTimeView;
			}
			
			readingTimeView.updateContent(formatted, totalSeconds, wpm, wordCount);
			plugin.app.workspace.revealLeaf(plugin.app.workspace.getLeavesOfType(READING_TIME_VIEW_TYPE)[0]);
		}
	});
}

