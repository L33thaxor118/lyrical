import { SpotifyAuthenticator } from './auth/SpotifyAuthenticator.js'
import { GeniusLyrics } from './data/lyrics/GeniusLyrics.js'
import { SpotifyMusic } from './data/music/SpotifyMusic.js'
import dotenv from 'dotenv'
import { DefaultSettings } from './data/settings/DefaultSettings.js'
import { DefaultTerminalUI } from './ui/DefaultTerminal.js'
import { delay } from './util/util.js'
import { Application } from './app.js'
import { Postgres } from './data/db/Postgres.js'
import { DefaultEmbeddingRepository } from './data/embeddings/DefaultEmbeddingRepository.js'
import { DefaultLyricsPreprocessor } from './data/preprocessing/DefaultLyricsPreprocessor.js'

async function main() {
    dotenv.config()
    const spotifyAuthenticator = new SpotifyAuthenticator()
    const songRepository = new SpotifyMusic(spotifyAuthenticator)
    const database = new Postgres()
    const settingsRepo = new DefaultSettings(database)
    const lyricsRepo = new GeniusLyrics()
    const lyricsPreprocessor = new DefaultLyricsPreprocessor()
    const embeddingRepo = new DefaultEmbeddingRepository()
    const terminalUi = new DefaultTerminalUI()
    const app = new Application(
        songRepository, 
        lyricsRepo, 
        settingsRepo, 
        terminalUi,
        lyricsPreprocessor,
        embeddingRepo,
        database
    )
    await app.run()
    delay(100)
    process.exit()
}

main()