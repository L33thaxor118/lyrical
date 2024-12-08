import { Application } from "./app.js"
import { DefaultTerminalUI } from "./ui/DefaultTerminal.js"
import { delay } from "./util/util.js"
import dotenv from 'dotenv'
import { DefaultEmbeddingRepository } from "./data/embeddings/DefaultEmbeddingRepository.js"
import { Postgres } from "./data/db/Postgres.js"
import { LyricsRepository } from "./data/lyrics/LyricsRepository.js"
import testLyrics from "./mock/testLyrics.json" with { type: "json" }
import testSongs from "./mock/testSongs.json" with { type: "json" }
import { MusicRepository } from "./data/music/MusicRepository.js"
import { SpotifyPlaylist } from "./model/SpotifyPlaylist.js"
import { Song } from "./model/Song.js"
import { SettingsRepository } from "./data/settings/SettingsRepository.js"
import { Settings } from "./model/Settings.js"
import pg from 'pg'
import { DefaultLyricsPreprocessor } from "./data/preprocessing/DefaultLyricsPreprocessor.js"


class MockLyricsRepository implements LyricsRepository {
    getLyrics(songName: string): Promise<string | null> {
        const safeLyrics = testLyrics as { [key: string]: string }
        const lyrics: string = safeLyrics[songName]
        return new Promise((resolve)=>{
            resolve(lyrics)
        })
    }
}

class MockSongsRepo implements MusicRepository {
    async getPlaylists(): Promise<SpotifyPlaylist[]> {
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

    async *getSongsInPlaylist(): AsyncGenerator<Song> {
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
    updateSettings(): Promise<void> {
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
    const songRepository = new MockSongsRepo()
    const settingsRepo = new MockSettingsRepository()
    const lyricsRepo = new MockLyricsRepository()
    const terminalUi = new DefaultTerminalUI()
    const lyricsPreprocessor = new DefaultLyricsPreprocessor()
    const embeddingRepo = new DefaultEmbeddingRepository()
    const database = new TestPostgres()
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

test()