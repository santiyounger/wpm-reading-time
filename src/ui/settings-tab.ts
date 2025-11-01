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

		// Cleanup any existing tooltips before re-rendering
		this.closeAllTooltips();

		containerEl.empty();

		const heading = containerEl.createEl('h2', { cls: 'reading-time-settings-heading' });
		heading.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-clock" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span>How Long to Read (Reading Time WPM)</span>';

		// Links container at top
		const linksContainer = containerEl.createDiv('setting-item-description reading-time-links-container');
		linksContainer.style.display = 'flex';
		linksContainer.style.flexWrap = 'wrap';
		linksContainer.style.gap = '1rem';
		linksContainer.style.marginBottom = '1.5rem';
		linksContainer.style.paddingBottom = '1rem';
		linksContainer.style.borderBottom = '1px solid var(--background-modifier-border)';
		linksContainer.style.justifyContent = 'center';

		// Support/Help link
		const supportLink = linksContainer.createEl('a', {
			href: '#',
			attr: { 
				'aria-label': 'Get help and support',
				'target': '_blank',
				'rel': 'noopener'
			},
			cls: 'reading-time-link'
		});
		supportLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-help-circle"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>Get Help</a>';

		// Website link
		const websiteLink = linksContainer.createEl('a', {
			href: '#',
			attr: { 
				'aria-label': 'Visit the website',
				'target': '_blank',
				'rel': 'noopener'
			},
			cls: 'reading-time-link'
		});
		websiteLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-link"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>Website</a>';

		// Presets section
		const presetsContainer = containerEl.createDiv('reading-time-presets-container');

		// WPM calculator link (above the table)
		const wpmCalculatorLink = presetsContainer.createDiv('reading-time-wpm-calculator');
		wpmCalculatorLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-calculator" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><rect width="16" height="20" x="4" y="2" rx="2"></rect><line x1="8" x2="16" y1="6" y2="6"></line><line x1="16" x2="16" y1="14" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>To find out your reading speed, I put together a calculator for you in my <a href="http://localhost:6074/wpm-calculator" target="_blank" rel="noopener">website</a>.';

		// Header row
		const headerRow = presetsContainer.createDiv('reading-time-preset-header-row');
		
		// Default header with icon and empty subtitle for alignment
		const defaultHeader = headerRow.createDiv('reading-time-header-default');
		const defaultHeaderTitle = defaultHeader.createDiv('reading-time-header-default-title reading-time-header-with-icon');
		defaultHeaderTitle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><span>Default</span>';
		defaultHeader.createEl('div', { text: '', cls: 'reading-time-header-default-subtitle' }); // Empty subtitle for alignment
		
		// Speed header with subheading and icon
		const speedHeader = headerRow.createDiv('reading-time-header-speed');
		const speedHeaderTitle = speedHeader.createDiv('reading-time-header-speed-title reading-time-header-with-icon');
		speedHeaderTitle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-gauge"><path d="m12 14 4-4"></path><path d="M3.34 19a10 10 0 1 1 17.32 0"></path></svg><span>Speed</span>';
		speedHeader.createEl('div', { text: 'WPM = Words Per Minute', cls: 'reading-time-header-speed-subtitle' });
		
		// Title header with icon and subtitle
		const nameHeader = headerRow.createDiv('reading-time-header-name');
		const nameHeaderTitle = nameHeader.createDiv('reading-time-header-name-title reading-time-header-with-icon');
		nameHeaderTitle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg><span>Title</span>';
		nameHeader.createEl('div', { text: 'You can add a title to this speed for example : My Speaking Speed', cls: 'reading-time-header-name-subtitle' });
		headerRow.createEl('div', { text: '', cls: 'reading-time-header-delete' }); // Empty for delete button column

		// Display all presets
		this.plugin.settings.presets.forEach((preset, index) => {
			this.renderPresetSetting(presetsContainer, preset, index);
		});

		// Add new preset button
		new Setting(presetsContainer)
			.addButton(button => button
				.setIcon('plus')
				.setTooltip('To find out your reading speed, I put together a calculator for you in my website. Select to add a new preset.')
				.setCta()
				.onClick(() => {
					const newPreset: WPMTimePreset = {
						id: `preset-${Date.now()}`,
						name: '',
						speed: 0  // Start with 0 instead of auto-filling
					};
					this.plugin.settings.presets.push(newPreset);
					this.plugin.saveSettings().then(() => {
						this.display(); // Refresh the settings view
					});
				}));

		// Learn more about my work section
		const learnMoreContainer = containerEl.createDiv('reading-time-learn-more');
		learnMoreContainer.style.float = 'left';
		learnMoreContainer.style.padding = '15px';
		learnMoreContainer.style.marginRight = '15px';
		
		const learnMoreInner = learnMoreContainer.createDiv('reading-time-learn-more-inner');
		learnMoreInner.style.paddingLeft = '10px';
		
		const learnMoreText = learnMoreInner.createDiv('reading-time-learn-more-text');
		learnMoreText.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-external-link" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg><span>Check out my work at:</span>';
		
		const learnMoreLink = learnMoreInner.createEl('a', {
			href: 'https://santiyounger.com/',
			text: 'santiyounger.com',
			attr: { target: '_blank', rel: 'noopener' }
		});
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
		
		// WPM calculator button (first, on the left)
		const calculatorBtnContainer = speedWrapper.createDiv('reading-time-wpm-calculator-btn-container');
		const calculatorBtn = calculatorBtnContainer.createEl('button', {
			cls: 'clickable-icon reading-time-wpm-calculator-btn',
			attr: { 
				'aria-label': 'Find your reading speed',
				'title': 'Find your reading speed'
			}
		});
		// Create icon using Obsidian's Lucide icon system
		// Create SVG element and set classes properly to avoid enhance.js token issues
		const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		iconSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		iconSvg.setAttribute('width', '18');
		iconSvg.setAttribute('height', '18');
		iconSvg.setAttribute('viewBox', '0 0 24 24');
		iconSvg.setAttribute('fill', 'none');
		iconSvg.setAttribute('stroke', 'currentColor');
		iconSvg.setAttribute('stroke-width', '1.5');
		iconSvg.setAttribute('stroke-linecap', 'round');
		iconSvg.setAttribute('stroke-linejoin', 'round');
		iconSvg.classList.add('svg-icon');
		iconSvg.classList.add('lucide-help-circle');
		
		const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		circle.setAttribute('cx', '12');
		circle.setAttribute('cy', '12');
		circle.setAttribute('r', '10');
		iconSvg.appendChild(circle);
		
		const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path1.setAttribute('d', 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3');
		iconSvg.appendChild(path1);
		
		const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		path2.setAttribute('d', 'M12 17h.01');
		iconSvg.appendChild(path2);
		
		calculatorBtn.appendChild(iconSvg);
		
		// Speed input (only numbers, right-aligned)
		const speedInput = speedWrapper.createEl('input', {
			type: 'text',
			attr: { spellcheck: 'false' },
			cls: 'reading-time-speed-input'
		});
		// Only show speed if it's a valid positive number
		speedInput.value = (preset.speed && preset.speed > 0) ? preset.speed.toString() : '';
		
		const speedLabel = speedWrapper.createEl('span', { text: 'WPM', cls: 'reading-time-speed-label' });
		
		// Create tooltip popover
		let tooltip: HTMLElement | null = null;
		const showTooltip = (e: MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			
			// Close all existing tooltips (including from other buttons)
			this.closeAllTooltips();
			
			// Create tooltip
			tooltip = document.createElement('div');
			tooltip.className = 'reading-time-wpm-tooltip';
			document.body.appendChild(tooltip);
			tooltip.innerHTML = 'To find out your reading speed, I put together a calculator for you in my <a href="http://localhost:6074/wpm-calculator" target="_blank" rel="noopener">website</a>.';
			
			// Position tooltip to the right of the button to avoid covering speed column
			const rect = calculatorBtn.getBoundingClientRect();
			tooltip.style.position = 'fixed';
			tooltip.style.left = `${rect.right + 12}px`;
			tooltip.style.top = `${rect.top}px`;
			tooltip.style.transform = 'translateY(-50%)';
			
			// Close on outside click
			const closeTooltip = (event: MouseEvent) => {
				if (tooltip && !tooltip.contains(event.target as Node) && event.target !== calculatorBtn) {
					tooltip.remove();
					tooltip = null;
					document.removeEventListener('click', closeTooltip);
				}
			};
			
			setTimeout(() => {
				document.addEventListener('click', closeTooltip);
			}, 0);
		};
		
		calculatorBtn.addEventListener('click', showTooltip);
		
		// Cleanup tooltip when settings tab is closed or re-rendered
		const cleanup = () => {
			if (tooltip) {
				tooltip.remove();
				tooltip = null;
			}
		};
		// Store cleanup reference on the container so it can be called if needed
		(presetContainer as any)._tooltipCleanup = cleanup;
		// Only allow numbers in speed input
		speedInput.addEventListener('input', async (e) => {
			const target = e.target as HTMLInputElement;
			// Remove any non-numeric characters
			const numericValue = target.value.replace(/[^0-9]/g, '');
			if (target.value !== numericValue) {
				target.value = numericValue;
			}
			
			const speed = parseInt(numericValue, 10);
			if (!numericValue) {
				preset.speed = 0;
				await this.plugin.saveSettings();
				return; // Allow empty during typing
			}
			if (isNaN(speed) || speed <= 0) {
				return; // Don't show notice while typing
			}
			preset.speed = speed;
			await this.plugin.saveSettings();
		});
		speedInput.addEventListener('blur', async (e) => {
			const target = e.target as HTMLInputElement;
			const speed = parseInt(target.value, 10);
			if (!target.value || isNaN(speed) || speed <= 0) {
				// If empty or invalid, set to 0 (which will exclude it from being used)
				if (!target.value) {
					preset.speed = 0;
					target.value = '';
				} else {
					new Notice('Speed must be a positive number.');
					target.value = (preset.speed && preset.speed > 0) ? preset.speed.toString() : '';
				}
				await this.plugin.saveSettings();
				// Refresh dropdown to exclude invalid presets
				this.display();
			}
		});

		// Title input
		const nameInput = presetContainer.createEl('input', {
			type: 'text',
			attr: { spellcheck: 'false', placeholder: 'Optional title' },
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
			deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
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

	private closeAllTooltips(): void {
		// Close all tooltips from any calculator button
		document.body.querySelectorAll('.reading-time-wpm-tooltip').forEach(el => el.remove());
	}
}

