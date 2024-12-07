
export interface LyricsPreprocessor {
    /**
     * Sanitizes and normalizes lyrics to fit expected format for python embedding service (see nlp.py).
     * 
     * @param lyrics raw lyrics from Genius webscraping
     * @returns sanitized lyrics text, null if lyrics cannot be sanitized or are not actually lyrics
     */
    preprocessLyrics(lyrics: string): string | null
}