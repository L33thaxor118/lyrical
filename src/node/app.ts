import { Authenticator } from "./auth/Authenticator"
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
        private spotifyAuth: Authenticator,
        private geniusAuth: Authenticator,
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
            await this.database.connect()
            const settings = await this.settingsRepo.getSettings()
            this.terminalUI.printLine("Welcome to Lyrical!")
            if (settings?.loadedPlaylistName == null) {
                this.terminalUI.printLine("In order to fetch songs and lyrics you will need to authenticate with Spotify and Genius.")
                const answer = await this.terminalUI.printYesNoQuestion("Proceed?")
                if (answer === false) {
                    this.terminalUI.printLine("Goodbye!")
                    return
                }
                await this.terminalUI.printLoading("Authorizing Spotify")
                const spotifyToken = await this.spotifyAuth.getAccessToken()
                this.terminalUI.printSuccessLine("Done")
                await this.terminalUI.printLoading("Authorizing Genius")
                const geniusToken = await this.geniusAuth.getAccessToken()
                this.terminalUI.printSuccessLine("Done")
                await this.terminalUI.printLoading("Fetching your Spotify playlists")
                const playlists = await this.musicRepo.getPlaylists(spotifyToken)
                const selection = await this.terminalUI.printOptions("Choose a playlist:", playlists.map(playlist => playlist?.name))
                const selectedPlaylist = playlists[selection]
                this.terminalUI.clear()
                await this.terminalUI.printLoading(`loading ${selectedPlaylist.name}. This might take a while for large playlists.`)
                await this.loadPlaylistIntoDatabase(selectedPlaylist, spotifyToken, geniusToken)
                await this.promptUserAndGetMatchingSong(settings)
            } else {
                await this.promptUserAndGetMatchingSong(settings)
            }
        } catch(error) {
            this.terminalUI.printErrorLine(`Error: ${getErrorMessage(error)}. Shutting down.`)
        } finally {
            this.database.disconnect()
        }
    }

    private async promptUserAndGetMatchingSong(settings: Settings) {
        this.terminalUI.printLine(`Loaded playlist: ${settings?.loadedPlaylistName}`)
        const input = await this.terminalUI.printTextInput('Feed me a line: ')
        const inputEmbedding = await this.embeddingRepo.getEmbedding(input)
        const matchingSongs = await this.database.similarityQuery(inputEmbedding)
        this.terminalUI.printNewLine()
        for (const song of matchingSongs) {
            this.terminalUI.printSuccessLine(`${song.title} by ${song.artist}`)
        }
    }

    private async loadPlaylistIntoDatabase(playlist: SpotifyPlaylist, spotifyAccessToken: string, geniusAccessToken: string) {
        const updateProgress = this.terminalUI.printProgress("Loading songs in playlist...")
        let processedSongs = 0
        try {
            await this.database.beginTransaction()
            for await (const song of this.musicRepo.getSongsInPlaylist(playlist, spotifyAccessToken)) {
                const artistName = song.artists[0]?.name
                if (artistName == null) {
                    continue
                }
                const lyrics = await this.lyricsRepo.getLyrics(geniusAccessToken, song.name, artistName)
                if (lyrics == null) {
                    continue
                }
                const preprocessedLyrics = this.lyricsPreprocessor.preprocessLyrics(lyrics)
                if (preprocessedLyrics == null) {
                    continue
                }
                const embedding = await this.embeddingRepo.getEmbedding(preprocessedLyrics)
                await this.database.insertSong(song.name, song.artists[0].name, lyrics, embedding)

                // Throttle so we don't exceed API limits
                delay(1000)
                updateProgress(++processedSongs / playlist.tracks.count)
            }
            await this.settingsRepo.updateSettings({loadedPlaylistName: playlist.name})
            await this.database.commitTransaction()
        } catch(e) {
            await this.database.rollbackTransaction()
            throw e
        }
    }
}