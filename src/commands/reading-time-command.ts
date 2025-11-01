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

			// Save selection range to restore it later - do this immediately
			const selectionStart = editor.getCursor('from');
			const selectionEnd = editor.getCursor('to');

			// Calculate times for all presets
			const presetTimes = new Map<string, { formatted: string; seconds: number }>();
			let wordCount = 0;
			
			for (const preset of plugin.settings.presets) {
				const result = calculateReadingTime(selectedText, preset.speed);
				presetTimes.set(preset.id, {
					formatted: result.formatted,
					seconds: result.totalSeconds
				});
				wordCount = result.wordCount; // All should have same word count
			}
			
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
			
			// Handler for preset changes
			const onPresetChange = async (presetId: string) => {
				plugin.settings.selectedPresetId = presetId;
				await plugin.saveSettings();
			};
			
			// Handler for opening settings
			const onOpenSettings = () => {
				// Open settings and navigate to this plugin's tab
				(plugin.app as any).setting.open();
				(plugin.app as any).setting.openTabById(plugin.manifest.id);
			};
			
			readingTimeView.updateContent(
				plugin.settings.presets,
				plugin.settings.selectedPresetId,
				presetTimes,
				wordCount,
				onPresetChange,
				onOpenSettings
			);
			plugin.app.workspace.revealLeaf(plugin.app.workspace.getLeavesOfType(READING_TIME_VIEW_TYPE)[0]);
			
			// Restore the selection after all async operations complete
			// Use setTimeout to ensure it happens after the view operations
			setTimeout(() => {
				editor.setSelection(selectionStart, selectionEnd);
				// Also ensure the editor view is focused
				view.editor.focus();
			}, 0);
		}
	});
}

