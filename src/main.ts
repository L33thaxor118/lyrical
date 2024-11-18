import { GeniusAuthenticator } from './auth/GeniusAuthenticator.js'
import { SpotifyAuthenticator } from './auth/SpotifyAuthenticator.js'
import { GeniusLyrics } from './data/lyrics/GeniusLyrics.js'
import { SpotifyMusic } from './data/music/SpotifyMusic.js'
import dotenv from 'dotenv'
import { DefaultSettings } from './data/settings/DefaultSettings.js'
import { DefaultTerminalUI } from './ui/DefaultTerminal.js'
import { delay } from './util/util.js'
import { Application } from './app.js'

async function main() {
  dotenv.config()
  const spotifyAuthenticator = new SpotifyAuthenticator()
  const geniusAuthenticator = new GeniusAuthenticator()
  const songRepository = new SpotifyMusic()
  const settingsRepo = new DefaultSettings()
  const lyricsRepo = new GeniusLyrics()
  const terminalUi = new DefaultTerminalUI()
  const app = new Application(
      spotifyAuthenticator, 
      geniusAuthenticator, 
      songRepository, 
      lyricsRepo, 
      settingsRepo, 
      terminalUi
  )
  await app.run()
  delay(100)
  process.exit()
}

main()