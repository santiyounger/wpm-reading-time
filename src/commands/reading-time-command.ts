import { Editor, MarkdownView, Notice, TFile, WorkspaceLeaf } from 'obsidian';
import { calculateReadingTime } from '../utils/reading-time';
import { WPMTimePlugin } from '../types';
import { ReadingTimeView, READING_TIME_VIEW_TYPE } from '../ui/reading-time-view';

async function getOrCreateReadingTimeView(plugin: WPMTimePlugin): Promise<ReadingTimeView | null> {
	const existingLeaves = plugin.app.workspace.getLeavesOfType(READING_TIME_VIEW_TYPE);
	let primaryLeaf: WorkspaceLeaf | null = existingLeaves[0] ?? null;

	if (existingLeaves.length > 1) {
		for (const duplicateLeaf of existingLeaves.slice(1)) {
			await duplicateLeaf.setViewState({ type: 'empty' });
			duplicateLeaf.detach();
		}
	}

	if (!primaryLeaf) {
		primaryLeaf = plugin.app.workspace.getRightLeaf(false);
		if (!primaryLeaf) {
			return null;
		}

		await primaryLeaf.setViewState({
			type: READING_TIME_VIEW_TYPE,
			active: true,
		});
	}

	let attempts = 0;
	const maxAttempts = 10;
	while (attempts < maxAttempts) {
		const view = primaryLeaf.view;
		if (view instanceof ReadingTimeView) {
			return view;
		}

		await new Promise((resolve) => window.setTimeout(resolve, 50));
		attempts++;
	}

	return null;
}

export function registerReadingTimeCommand(plugin: WPMTimePlugin): void {
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
				const titleValue = metadata.frontmatter.title as unknown;
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
			
			// Open or reveal a single shared view in the right sidebar.
			const readingTimeView = await getOrCreateReadingTimeView(plugin);
			if (!readingTimeView) {
				new Notice('Could not open reading time view.');
				return;
			}
			
			// Ensure we have a valid view before proceeding
			if (!readingTimeView || typeof readingTimeView.updateContent !== 'function') {
				new Notice('Reading time view is not ready. Please try again.');
				return;
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
				// Using internal Obsidian API to open settings tab
				const app = plugin.app as typeof plugin.app & { 
					setting?: { 
						open: () => void; 
						openTabById: (id: string) => void;
					};
				};
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
			
			// Reveal the leaf containing the view
			const viewLeaves = plugin.app.workspace.getLeavesOfType(READING_TIME_VIEW_TYPE);
			if (viewLeaves.length > 0) {
				void plugin.app.workspace.revealLeaf(viewLeaves[0]);
			}
			
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

