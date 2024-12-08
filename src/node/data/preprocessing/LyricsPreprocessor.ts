
export interface LyricsPreprocessor {
    preprocessLyrics(lyrics: string): Promise<string | null>
}