import { LyricsPreprocessor } from "./LyricsPreprocessor.js";

export class GeniusLyricsPreprocessor implements LyricsPreprocessor {
    preprocessLyrics(lyrics: string): string | null {
        // Return null if the string is over 5000 characters
        if (lyrics.length > 5000) {
            return null;
        }

        // Check if the string contains dates in formats like MM/DD/YYYY
        const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b/;
        if (dateRegex.test(lyrics)) {
            return null;
        }

        // Check if the string contains words in all caps
        const allCapsRegex = /\b[A-Z]{2,}\b/;
        if (allCapsRegex.test(lyrics)) {
            return null;
        }

        // Remove substrings enclosed in brackets or parentheses
        const bracketRegex = /\[.*?\]|\(.*?\)/g;
        let processedLyrics = lyrics.replace(bracketRegex, '');

        // Remove empty lines while preserving newlines
        processedLyrics = processedLyrics
            .split('\n')
            .filter(line => line.trim() !== '')
            .join('\n');

        return processedLyrics
    }
}