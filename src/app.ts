import { Authenticator } from "./auth/SpotifyAuthenticator"
import { LyricsRepository } from "./data/lyrics/LyricsRepository"
import { Settings, SettingsRepository } from "./data/settings/SettingsRepository"
import { MusicRepository, Playlist } from "./data/music/MusicRepository"
import { TerminalUI } from "./ui/TerminalUI"
import { getErrorMessage } from "./util/util.js"

export class Application {
    private spotifyAuth: Authenticator
    private geniusAuth: Authenticator
    private musicRepo: MusicRepository
    private lyricsRepo: LyricsRepository
    private settingsRepo: SettingsRepository
    private terminalUI: TerminalUI

    constructor(
        spotifyAuthenticator: Authenticator,
        geniusAuthenticator: Authenticator,
        musicRepository: MusicRepository,
        lyricsRepository: LyricsRepository,
        settingsRepository: SettingsRepository,
        terminalUI: TerminalUI
    ) {
        this.spotifyAuth = spotifyAuthenticator
        this.geniusAuth = geniusAuthenticator
        this.musicRepo = musicRepository
        this.lyricsRepo= lyricsRepository
        this.settingsRepo = settingsRepository
        this.terminalUI = terminalUI
    }
  
    async run() {
        try {
            this.terminalUI.printBanner()
            const settings = await this.settingsRepo.getSettings()
            this.terminalUI.printLine("Welcome to Lyrical!")
            if (settings.loadedPlaylistName === undefined) {
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
                const selection = await this.terminalUI.printOptions("Choose a playlist:", playlists.map(playlist => playlist.name))
                const selectedPlaylist = playlists[selection]
                await this.terminalUI.printLoading(`loading ${selectedPlaylist.name}. This might take a while for large playlists.`)
                await this.loadPlaylistIntoDatabase(selectedPlaylist, spotifyToken)
                await this.promptUserAndGetMatchingSong(settings)
            } else {
                await this.promptUserAndGetMatchingSong(settings)
            }
        } catch(error) {
            this.terminalUI.printErrorLine(`Error: ${getErrorMessage(error)}. Shutting down.`)
        }
    }

    private async promptUserAndGetMatchingSong(settings: Settings) {
        this.terminalUI.printLine(`Loaded playlist: ${settings.loadedPlaylistName}`)
        const input = await this.terminalUI.printTextInput('Feed me a line: ')
        const matchingSongName = await this.queryDatabaseForMatchingSong(input)
        this.terminalUI.printNewLine()
        this.terminalUI.printSuccessLine(matchingSongName)
    }

    private async loadPlaylistIntoDatabase(playlist: Playlist, accessToken: string) {
        for await (const song of this.musicRepo.getSongsInPlaylist(playlist, accessToken)) {
            // lyrics repo fetch lyrics for song
            // repo will handle persisting to cache and getting from cache if available
            // if no lyrics exist, or in other language, skip
            // punctuate lyrics
            // split into sentences
            // get embeddings for each sentence
            // collapse into single embedding via average
            // insert song data, embedding and lyrics into database
        }
    }

    private async queryDatabaseForMatchingSong(input: string): Promise<string> {
        return "some song"
    }
}