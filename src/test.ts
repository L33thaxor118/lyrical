// import { Application } from "./app.js"
// import { GeniusAuthenticator } from "./auth/GeniusAuthenticator.js"
// import { Authenticator, SpotifyAuthenticator } from "./auth/SpotifyAuthenticator.js"
// import { LyricsRepository } from "./data/lyrics/LyricsRepository.js"
// import { SettingsRepository } from "./data/settings/SettingsRepository.js"
// import { MusicRepository } from "./data/music/MusicRepository.js"
// import { DefaultTerminalUI } from "./ui/DefaultTerminal.js"
// import { delay } from "./util/util.js"
// import dotenv from 'dotenv'


// class MockAuthenticator implements Authenticator {
//     async getAccessToken(): Promise<string> {
//         await delay(2000)
//         return "accesstokenzzz"
//     }
// } 

// class MockSongsRepo implements MusicRepository {
//     async getPlaylists(accessToken: string): Promise<Playlist[]> {
//         return [
//             {
//                 id: "0",
//                 name: "playlist 1",
//                 tracks: {
//                     href: "whatever",
//                     count: 5
//                 }
//             },
//             {
//                 id: "1",
//                 name: "playlist 2",
//                 tracks: {
//                     href: "whatever",
//                     count: 10
//                 }
//             }
//         ]
//     }

//     async *getSongsInPlaylist(playlist: Playlist, accessToken: string): AsyncGenerator<Song> {
//         return [
//             {
//                 id: "0",
//                 name: "Lover, you should have come over",
//                 artists: [
//                     {
//                         id: "0",
//                         name: "Jeff Buckley"
//                     }
//                 ]
//             },
//             {
//                 id: "1",
//                 name: "Digital Bath",
//                 artists: [
//                     {
//                         id: "1",
//                         name: "Deftones"
//                     }
//                 ]
//             },
//             {
//                 id: "2",
//                 name: "Criminal",
//                 artists: [
//                     {
//                         id: "2",
//                         name: "Fiona Apple"
//                     }
//                 ]
//             },
//         ]
//     }
// }

// class MockLyricsRepository implements LyricsRepository {
//     getLyrics(): Promise<string[]> {
//         throw new Error("Method not implemented.")
//     }
// }

// class MockSettingsRepository implements SettingsRepository {
//     async updateSettings(newSettings: Settings): Promise<Settings> {
//         return newSettings
//     }
//     async getSettings(): Promise<Settings> {
//         const settings: Settings = {
//             loadedPlaylistName: undefined
//         }
//         return settings
//     }
// }

// async function test() {
//     dotenv.config()
//     const spotifyAuthenticator = new MockAuthenticator()
//     const geniusAuthenticator = new MockAuthenticator()
//     const songRepository = new MockSongsRepo()
//     const settingsRepo = new MockSettingsRepository()
//     const lyricsRepo = new MockLyricsRepository()
//     const terminalUi = new DefaultTerminalUI()
//     const app = new Application(
//         spotifyAuthenticator, 
//         geniusAuthenticator, 
//         songRepository, 
//         lyricsRepo, 
//         settingsRepo, 
//         terminalUi
//     )
//     await app.run()
//     delay(100)
//     process.exit()
// }

// test()