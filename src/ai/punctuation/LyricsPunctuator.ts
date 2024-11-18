export interface LyricsPunctuator {
    punctuate(lyrics: string): Promise<string>
}