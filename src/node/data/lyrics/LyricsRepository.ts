export interface LyricsRepository {
    getLyrics(accessToken: string, songName: string, artistName: string): Promise<string | null>
}