/**
 * Calculates the reading time for a given text based on words per minute
 * @param text - The text to analyze
 * @param wpm - Words per minute (default: 200)
 * @returns Object with total seconds, formatted string, and word count
 */
export function calculateReadingTime(text: string, wpm: number): {
	totalSeconds: number;
	formatted: string;
	wordCount: number;
} {
	// Remove extra whitespace
	const trimmed = text.trim();
	if (!trimmed) {
		return { totalSeconds: 0, formatted: '0 seconds', wordCount: 0 };
	}

	// Smart word counting that handles punctuation correctly
	const words = countWordsSmart(trimmed);
	const wordCount = words;

	// Calculate reading time in seconds
	const totalSeconds = Math.ceil((wordCount / wpm) * 60);

	// Format the time
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	let formatted: string;
	if (minutes === 0) {
		formatted = `${totalSeconds} ${totalSeconds === 1 ? 'second' : 'seconds'}`;
	} else if (seconds === 0) {
		formatted = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
	} else {
		const minutesStr = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
		const secondsStr = `${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
		formatted = `${minutesStr} & ${secondsStr}`;
	}

	return { totalSeconds, formatted, wordCount };
}

/**
 * Smart word counting that properly handles punctuation
 * - Keeps apostrophes and hyphens within words (e.g., "don't", "well-known")
 * - Removes leading/trailing punctuation from words
 * - Doesn't count standalone punctuation as words
 * - Handles various whitespace characters
 * - Handles contractions, possessives, and hyphenated words correctly
 */
function countWordsSmart(text: string): number {
	// Split by any whitespace (spaces, tabs, newlines, etc.)
	const tokens = text.split(/\s+/).filter(token => token.length > 0);
	
	let wordCount = 0;
	
	for (const token of tokens) {
		// Remove leading and trailing punctuation marks
		// Keep letters, numbers, apostrophes, and hyphens
		// This pattern matches one or more non-word characters (except apostrophe and hyphen) at start or end
		let cleaned = token.replace(/^[^a-zA-Z0-9'-]+|[^a-zA-Z0-9'-]+$/g, '');
		
		// After cleaning, verify there's actual word content (letters or numbers)
		// This filters out standalone punctuation, apostrophes-only, or hyphens-only tokens
		if (cleaned.length > 0 && /[a-zA-Z0-9]/.test(cleaned)) {
			wordCount++;
		}
	}
	
	return wordCount;
}

