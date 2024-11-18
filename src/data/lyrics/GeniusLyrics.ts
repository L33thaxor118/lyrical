import { Song } from "../music/MusicRepository"
import { LyricsRepository } from "./LyricsRepository"

export class GeniusLyrics implements LyricsRepository {
    getLyrics(): Promise<string[]> {
        throw new Error("Method not implemented.")
    }
    
    async getLyricsForSong(song: Song): Promise<string> {
        const options = {
            apiKey: "",
            title: song.name,
            artist: song.artists[0],
            optimizeQuery: true
        }
        return ""
    }
}