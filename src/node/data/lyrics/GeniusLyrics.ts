import { LyricsRepository } from "./LyricsRepository.js"
import Genius from "genius-lyrics"

export class GeniusLyrics implements LyricsRepository {
    async getLyrics(songName: string, artistName: string): Promise<string | null> {
        try {
            const client = new Genius.Client()
            const searches = await client.songs.search(`${songName} ${artistName}`)
            const firstSong = searches[0]
            const lyrics = await firstSong?.lyrics()
            return lyrics
        } catch(e) {
            return null
        }
    }
}