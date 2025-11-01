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
		heading.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-clock" style="display: inline-block; vertical-align: middle; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span>How Long to Read This Text (WPM Reading Time)</span>';

		// Links container at top
		const linksContainer = containerEl.createDiv('setting-item-description reading-time-links-container');
		linksContainer.style.display = 'flex';
		linksContainer.style.flexWrap = 'wrap';
		linksContainer.style.gap = '1rem';
		linksContainer.style.marginBottom = '1.5rem';
		linksContainer.style.paddingBottom = '1rem';
		linksContainer.style.borderBottom = '1px solid var(--background-modifier-border)';
		linksContainer.style.justifyContent = 'center';

		// Contact Santi link
		const supportLink = linksContainer.createEl('a', {
			href: 'https://www.santiyounger.com/contact',
			attr: { 
				'aria-label': 'Contact Santi (Author)',
				'target': '_blank',
				'rel': 'noopener'
			},
			cls: 'reading-time-link'
		});
		supportLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>Contact Santi (Author)</a>';

		// GitHub link
		const githubLink = linksContainer.createEl('a', {
			href: 'https://github.com/santiyounger/wpm-reading-time',
			attr: { 
				'aria-label': 'Code on GitHub',
				'target': '_blank',
				'rel': 'noopener'
			},
			cls: 'reading-time-link'
		});
		githubLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-github"><path d="M15 22v-4a4.8-4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>Code on GitHub</a>';

		// Write a request link (GitHub issues)
		const requestLink = linksContainer.createEl('a', {
			href: 'https://github.com/santiyounger/wpm-reading-time/issues',
			attr: { 
				'aria-label': 'Submit a Request',
				'target': '_blank',
				'rel': 'noopener'
			},
			cls: 'reading-time-link'
		});
		requestLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-message-square-plus"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M9 10h6"></path><path d="M12 7v6"></path></svg>Submit a Request</a>';

		// Presets section
		const presetsContainer = containerEl.createDiv('reading-time-presets-container');

		// Header row
		const headerRow = presetsContainer.createDiv('reading-time-preset-header-row');
		
		// Default header with icon and subtitle
		const defaultHeader = headerRow.createDiv('reading-time-header-default');
		const defaultHeaderTitle = defaultHeader.createDiv('reading-time-header-default-title reading-time-header-with-icon');
		defaultHeaderTitle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><span>Default</span>';
		defaultHeader.createEl('div', { text: 'Select Your Default Preset', cls: 'reading-time-header-default-subtitle' });
		
		// Speed header with subheading and icon
		const speedHeader = headerRow.createDiv('reading-time-header-speed');
		const speedHeaderTitle = speedHeader.createDiv('reading-time-header-speed-title reading-time-header-with-icon');
		speedHeaderTitle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-gauge"><path d="m12 14 4-4"></path><path d="M3.34 19a10 10 0 1 1 17.32 0"></path></svg><span>Speed</span>';
		const speedSubtitle = speedHeader.createEl('div', { cls: 'reading-time-header-speed-subtitle' });
		speedSubtitle.innerHTML = 'WPM Stands For:<br>Words Per Minute';
		
		// Title header with icon and subtitle
		const nameHeader = headerRow.createDiv('reading-time-header-name');
		const nameHeaderTitle = nameHeader.createDiv('reading-time-header-name-title reading-time-header-with-icon');
		nameHeaderTitle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg><span>Title</span>';
		const nameSubtitle = nameHeader.createEl('div', { cls: 'reading-time-header-name-subtitle' });
		nameSubtitle.innerHTML = 'You Can Add an Optional Title<br>Example: My Speaking Speed';
		headerRow.createEl('div', { text: '', cls: 'reading-time-header-delete' }); // Empty for delete button column

		// Display all presets
		this.plugin.settings.presets.forEach((preset, index) => {
			this.renderPresetSetting(presetsContainer, preset, index);
		});

		// Add new preset button with calculator on the left
		const addPresetSetting = new Setting(presetsContainer);
		
		// WPM calculator link (on the left side of the add button)
		const wpmCalculatorLink = addPresetSetting.controlEl.createDiv('reading-time-wpm-calculator');
		wpmCalculatorLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-calculator" style="display: inline-block; vertical-align: middle; margin-right: 6px;"><rect width="16" height="20" x="4" y="2" rx="2"></rect><line x1="8" x2="16" y1="6" y2="6"></line><line x1="16" x2="16" y1="14" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>To find out your reading speed (<span class="reading-time-wpm-phrase"><span class="reading-time-accent">W</span><span>ords </span><span class="reading-time-accent">P</span><span>er </span><span class="reading-time-accent">M</span><span>inute</span></span>), use <a href="http://localhost:6074/wpm-calculator" target="_blank" rel="noopener">this free calculator I created for you</a>.';
		
		addPresetSetting.addButton(button => button
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
		
		const learnMoreInner = learnMoreContainer.createDiv('reading-time-learn-more-inner');
		
		const learnMoreText = learnMoreInner.createDiv('reading-time-learn-more-text');
		// Briefcase icon
		const briefcaseIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		briefcaseIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		briefcaseIcon.setAttribute('width', '16');
		briefcaseIcon.setAttribute('height', '16');
		briefcaseIcon.setAttribute('viewBox', '0 0 24 24');
		briefcaseIcon.setAttribute('fill', 'none');
		briefcaseIcon.setAttribute('stroke', 'currentColor');
		briefcaseIcon.setAttribute('stroke-width', '1.5');
		briefcaseIcon.setAttribute('stroke-linecap', 'round');
		briefcaseIcon.setAttribute('stroke-linejoin', 'round');
		briefcaseIcon.classList.add('svg-icon');
		briefcaseIcon.classList.add('lucide-briefcase');
		const briefcasePath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		briefcasePath1.setAttribute('d', 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16');
		briefcaseIcon.appendChild(briefcasePath1);
		const briefcaseRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		briefcaseRect.setAttribute('width', '20');
		briefcaseRect.setAttribute('height', '14');
		briefcaseRect.setAttribute('x', '2');
		briefcaseRect.setAttribute('y', '6');
		briefcaseRect.setAttribute('rx', '2');
		briefcaseIcon.appendChild(briefcaseRect);
		learnMoreText.appendChild(briefcaseIcon);
		
		const textSpan = learnMoreText.createEl('span', { text: 'Check out my work at:' });
		
		// External link icon
		const externalLinkIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		externalLinkIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		externalLinkIcon.setAttribute('width', '16');
		externalLinkIcon.setAttribute('height', '16');
		externalLinkIcon.setAttribute('viewBox', '0 0 24 24');
		externalLinkIcon.setAttribute('fill', 'none');
		externalLinkIcon.setAttribute('stroke', 'currentColor');
		externalLinkIcon.setAttribute('stroke-width', '1.5');
		externalLinkIcon.setAttribute('stroke-linecap', 'round');
		externalLinkIcon.setAttribute('stroke-linejoin', 'round');
		externalLinkIcon.classList.add('svg-icon');
		externalLinkIcon.classList.add('lucide-external-link');
		const externalPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		externalPath1.setAttribute('d', 'M15 3h6v6');
		externalLinkIcon.appendChild(externalPath1);
		const externalPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		externalPath2.setAttribute('d', 'M10 14 21 3');
		externalLinkIcon.appendChild(externalPath2);
		const externalPath3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		externalPath3.setAttribute('d', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6');
		externalLinkIcon.appendChild(externalPath3);
		
		const learnMoreLink = learnMoreInner.createEl('a', {
			href: 'https://santiyounger.com/',
			attr: { target: '_blank', rel: 'noopener' }
		});
		learnMoreLink.appendChild(externalLinkIcon);
		const linkText = learnMoreLink.createEl('span', { text: 'santiyounger.com' });
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
			attr: { 
				spellcheck: 'false',
				placeholder: 'Use calculator below'
			},
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
			
			// Get content from the calculator div (without the SVG icon)
			const calculatorDiv = this.containerEl.querySelector('.reading-time-wpm-calculator');
			let tooltipContent = '';
			if (calculatorDiv) {
				// Clone the calculator div to preserve the HTML structure
				const clone = calculatorDiv.cloneNode(true) as HTMLElement;
				// Remove the SVG icon element
				const svg = clone.querySelector('svg');
				if (svg) {
					svg.remove();
				}
				// Get the innerHTML which will contain the text and link
				tooltipContent = clone.innerHTML.trim();
			} else {
				// Fallback if calculator div not found
				tooltipContent = 'To find out your reading speed (Words Per Minute), use <a href="http://localhost:6074/wpm-calculator" target="_blank" rel="noopener">this free calculator I created for you</a>.';
			}
			
			// Create tooltip
			tooltip = document.createElement('div');
			tooltip.className = 'reading-time-wpm-tooltip';
			document.body.appendChild(tooltip);
			tooltip.innerHTML = tooltipContent;
			
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

