export interface LyricsRepository {
    getLyrics(songName: string, artistName: string): Promise<string | null>
}