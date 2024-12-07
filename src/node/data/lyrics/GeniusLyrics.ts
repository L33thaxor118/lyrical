import { GeniusAuthenticator } from "../../auth/GeniusAuthenticator.js"
import { LyricsRepository } from "./LyricsRepository.js"
import Genius from "genius-lyrics"

export class GeniusLyrics implements LyricsRepository {
    constructor(
        private authenticator: GeniusAuthenticator
    ) {}

    async getLyrics(songName: string, artistName: string): Promise<string | null> {
        const accessToken = await this.authenticator.getAccessToken()
        try {
            const client = new Genius.Client(accessToken)
            const searches = await client.songs.search(`${songName} ${artistName}`)
            const firstSong = searches[0]
            const lyrics = await firstSong.lyrics()
            return lyrics
        } catch(e) {
            console.log(e)
            return null
        }
    }
}