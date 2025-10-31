/**
 * Calculates the reading time for a given text based on words per minute
 * @param text - The text to analyze
 * @param wpm - Words per minute (default: 200)
 * @returns Object with total seconds and formatted string
 */
export function calculateReadingTime(text: string, wpm: number): {
	totalSeconds: number;
	formatted: string;
} {
	// Remove extra whitespace and split by spaces to count words
	const trimmed = text.trim();
	if (!trimmed) {
		return { totalSeconds: 0, formatted: '0 seconds' };
	}

	// Count words (split by whitespace and filter out empty strings)
	const words = trimmed.split(/\s+/).filter(word => word.length > 0);
	const wordCount = words.length;

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
		formatted = `${minutesStr} and ${secondsStr}`;
	}

	return { totalSeconds, formatted };
}

