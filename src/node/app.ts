import { LyricsRepository } from "./data/lyrics/LyricsRepository.js"
import { SettingsRepository } from "./data/settings/SettingsRepository.js"
import { MusicRepository } from "./data/music/MusicRepository.js"
import { TerminalUI } from "./ui/TerminalUI"
import { delay, getErrorMessage } from "./util/util.js"
import { LyricsPreprocessor } from "./data/preprocessing/LyricsPreprocessor.js"
import { AppDatabase } from "./data/db/AppDatabase.js"
import { Settings } from "./model/Settings.js"
import { EmbeddingRepository } from "./data/embeddings/EmbeddingRepository.js"
import { SpotifyPlaylist } from "./model/SpotifyPlaylist.js"

export class Application {
    constructor(
        private musicRepo: MusicRepository,
        private lyricsRepo: LyricsRepository,
        private settingsRepo: SettingsRepository,
        private terminalUI: TerminalUI,
        private lyricsPreprocessor: LyricsPreprocessor,
        private embeddingRepo: EmbeddingRepository,
        private database: AppDatabase
    ) {}
  
    async run() {
        try {
            this.terminalUI.printBanner()
            this.terminalUI.printLine("Welcome to Lyrical!")
            await this.database.connect()
            const settings = await this.settingsRepo.getSettings()
            if (settings?.loadedPlaylistName == null) {
                this.terminalUI.printLine("In order to fetch songs you will need to authenticate with Spotify.")
                const answer = await this.terminalUI.printYesNoQuestion("Proceed?")
                if (answer === false) {
                    this.terminalUI.printLine("Goodbye!")
                    return
                }
                await this.terminalUI.printLoading("Fetching your playlists")
                const playlists = await this.musicRepo.getPlaylists()
                const selection = await this.terminalUI.printOptions("Choose a playlist:", playlists.map(playlist => playlist?.name))
                const selectedPlaylist = playlists[selection]
                this.terminalUI.clear()
                await this.terminalUI.printLoading(`loading ${selectedPlaylist.name}. This might take a while for large playlists.`)
                await this.loadPlaylistIntoDatabase(selectedPlaylist)
                this.terminalUI.clear()
            }
            const latestSettings = await this.settingsRepo.getSettings()
            await this.promptUser(latestSettings)
        } catch(error) {
            this.terminalUI.printErrorLine(`Error: ${getErrorMessage(error)}. Shutting down.`)
        } finally {
            this.database.disconnect()
        }
    }

    private async promptUser(settings: Settings) {
        this.terminalUI.printLine(`Loaded playlist: ${settings?.loadedPlaylistName}`)
        const selection = await this.terminalUI.printOptions("What do you want to do?", ["Run query", "Unload playlist", "Exit"])
        if (selection === 1) {
            this.terminalUI.printLoading("Clearing Database")
            await this.database.clear()
            this.terminalUI.printLine("Database cleared. Goodbye!")
        } else if (selection === 0) {
            await this.querySongs()
        } else {
            this.terminalUI.printLine("Goodbye!")
        }
    }

    private async querySongs() {
        const input = await this.terminalUI.printTextInput('Feed me a line: ')
        const inputEmbedding = await this.embeddingRepo.getEmbedding(input)
        const matchingSongs = await this.database.similarityQuery(inputEmbedding)
        this.terminalUI.printNewLine()
        matchingSongs.forEach((song, index)=>{
            this.terminalUI.printSuccessLine(`${index+1}. ${song.title} by ${song.artist}`)
        })
    }

    private async loadPlaylistIntoDatabase(playlist: SpotifyPlaylist) {
        const updateProgress = this.terminalUI.printProgress("Loading songs in playlist...")
        let processedSongs = 0
        try {
            await this.database.beginTransaction()
            for await (const song of this.musicRepo.getSongsInPlaylist(playlist)) {
                const artistName = song.artists[0]?.name
                if (artistName == null) {
                    continue
                }
                const lyrics = await this.lyricsRepo.getLyrics(song.name, artistName)
                if (lyrics == null) {
                    continue
                }
                const preprocessedLyrics = await this.lyricsPreprocessor.preprocessLyrics(lyrics)
                if (preprocessedLyrics == null) {
                    continue
                }
                const embedding = await this.embeddingRepo.getEmbedding(preprocessedLyrics)
                await this.database.insertSong(song.name, song.artists[0].name, lyrics, embedding)
                updateProgress(++processedSongs / playlist.tracks.total)
            }
            await this.settingsRepo.updateSettings({loadedPlaylistName: playlist.name})
            await this.database.commitTransaction()
        } catch(e) {
            await this.database.rollbackTransaction()
            throw e
        }
    }
}