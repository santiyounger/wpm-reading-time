import { Editor, MarkdownView, Notice, TFile } from 'obsidian';
import { calculateReadingTime } from '../utils/reading-time';
import { WPMTimePlugin } from '../types';
import { ReadingTimeView, READING_TIME_VIEW_TYPE } from '../ui/reading-time-view';

export function registerReadingTimeCommand(plugin: WPMTimePlugin & { view: ReadingTimeView | null }): void {
	plugin.addCommand({
		id: 'calculate-reading-time',
		name: 'Calculate reading time',
		editorCallback: async (editor: Editor, view: MarkdownView) => {
		let selectedText = editor.getSelection();
		let isWholeNote = false;
		let noteTitle = '';
		let noteFile: TFile | null = null;
		
		// Get note title from metadata cache or file name (for both whole note and selected text)
		if (view.file) {
			noteFile = view.file;
			// Try to get title from metadata cache (Obsidian's standard way)
			const metadata = plugin.app.metadataCache.getFileCache(view.file);
			if (metadata?.frontmatter?.title) {
				const titleValue = metadata.frontmatter.title;
				noteTitle = typeof titleValue === 'string' ? titleValue : view.file.basename;
			} else {
				// Use file basename (filename without extension)
				noteTitle = view.file.basename;
			}
		}
		
		// If no text is selected, use the whole note content
		if (!selectedText || selectedText.trim().length === 0) {
			selectedText = editor.getValue();
			isWholeNote = true;
				
			// If the note is empty, show a notice
			if (!selectedText || selectedText.trim().length === 0) {
				new Notice('Note is empty. Please add some content or select text to analyze.');
				return;
			}
		}

			// Save selection range to restore it later - do this immediately
			const selectionStart = editor.getCursor('from');
			const selectionEnd = editor.getCursor('to');

			// Filter out presets with invalid speeds (must be > 0)
			const validPresets = plugin.settings.presets.filter(p => p.speed > 0);
			
			if (validPresets.length === 0) {
				new Notice('No valid presets found. Please configure at least one preset with a speed > 0 in settings.');
				return;
			}
			
			// Calculate times for all valid presets
			const presetTimes = new Map<string, { formatted: string; seconds: number }>();
			let wordCount = 0;
			
			for (const preset of validPresets) {
				const result = calculateReadingTime(selectedText, preset.speed);
				presetTimes.set(preset.id, {
					formatted: result.formatted,
					seconds: result.totalSeconds
				});
				wordCount = result.wordCount; // All should have same word count
			}
			
			// Ensure selected preset is valid, if not use first valid preset
			let selectedPresetId = plugin.settings.selectedPresetId;
			if (!validPresets.find(p => p.id === selectedPresetId)) {
				selectedPresetId = validPresets[0].id;
				plugin.settings.selectedPresetId = selectedPresetId;
				await plugin.saveSettings();
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
			const onPresetChange = (presetId: string) => {
				void (async () => {
					plugin.settings.selectedPresetId = presetId;
					await plugin.saveSettings();
				})();
			};
			
			// Handler for opening settings
			const onOpenSettings = () => {
			// Open settings and navigate to this plugin's tab
			// Note: Using internal Obsidian API (not in public types)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
			const app = plugin.app as any;
			if (app.setting) {
				app.setting.open();
				app.setting.openTabById(plugin.manifest.id);
			}
			};
			
			readingTimeView.updateContent(
				validPresets,
				selectedPresetId,
				presetTimes,
				wordCount,
				onPresetChange,
				onOpenSettings,
				isWholeNote,
				noteTitle,
				noteFile
			);
			void plugin.app.workspace.revealLeaf(plugin.app.workspace.getLeavesOfType(READING_TIME_VIEW_TYPE)[0]);
			
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

