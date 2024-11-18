

export interface LyricsRepository {
    getLyrics(): Promise<Array<string>>
}