import { Application } from "./app.js"
import { DefaultTerminalUI } from "./ui/DefaultTerminal.js"
import { delay } from "./util/util.js"
import dotenv from 'dotenv'
import { GeniusLyricsPreprocessor } from "./data/preprocessing/GeniusLyricsPreprocessor.js"
import { DefaultEmbeddingRepository } from "./data/embeddings/DefaultEmbeddingRepository.js"
import { Postgres } from "./data/db/Postgres.js"
import { Authenticator } from "./auth/Authenticator.js"
import { LyricsRepository } from "./data/lyrics/LyricsRepository.js"
import testLyrics from "./mock/testLyrics.json" with { type: "json" }
import testSongs from "./mock/testSongs.json" with { type: "json" }
import { MusicRepository } from "./data/music/MusicRepository.js"
import { SpotifyPlaylist } from "./model/SpotifyPlaylist.js"
import { Song } from "./model/Song.js"
import { SettingsRepository } from "./data/settings/SettingsRepository.js"
import { Settings } from "./model/Settings.js"
import pg from 'pg'


class MockAuthenticator implements Authenticator {
    async getAccessToken(): Promise<string> {
        await delay(2000)
        return "accesstokenzzz"
    }
} 

class MockLyricsRepository implements LyricsRepository {
    getLyrics(accessToken: string, songName: string, artistName: string): Promise<string | null> {
        const safeLyrics = testLyrics as { [key: string]: string }
        const lyrics: string = safeLyrics[songName]
        return new Promise((resolve)=>{
            resolve(lyrics)
        })
    }
}

class MockSongsRepo implements MusicRepository {
    async getPlaylists(accessToken: string): Promise<SpotifyPlaylist[]> {
        return [
            {
                id: "0",
                name: "Test Playlist",
                tracks: {
                    href: "whatever",
                    count: 5
                }
            }
        ]
    }

    async *getSongsInPlaylist(playlist: SpotifyPlaylist, accessToken: string): AsyncGenerator<Song> {
        for (const song of testSongs) {
            yield song
        } 
    }
}

class MockSettingsRepository implements SettingsRepository {
    private testSettings: Settings = {
        loadedPlaylistName: undefined
    }
    getSettings(): Promise<Settings> {
        return new Promise((resolve)=>{
            resolve(
                this.testSettings
            )
        })
    }
    updateSettings(newSettings: Settings): Promise<void> {
        return new Promise((resolve)=>{
            resolve()
        })
    }
}

class TestPostgres extends Postgres {
    protected client = new pg.Client({
        user: 'postgres',
        host: 'localhost',
        database: 'lyrical',
        password: 'whatever',
        port: 5433
    })
}

async function test() {
    dotenv.config()
    const spotifyAuthenticator = new MockAuthenticator()
    const geniusAuthenticator = new MockAuthenticator()
    const songRepository = new MockSongsRepo()
    const settingsRepo = new MockSettingsRepository()
    const lyricsRepo = new MockLyricsRepository()
    const terminalUi = new DefaultTerminalUI()
    const lyricsPreprocessor = new GeniusLyricsPreprocessor()
    const embeddingRepo = new DefaultEmbeddingRepository()
    const database = new TestPostgres()
    const app = new Application(
        spotifyAuthenticator, 
        geniusAuthenticator, 
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

test()