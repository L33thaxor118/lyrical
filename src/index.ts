import tkit from 'terminal-kit'

import { addSongsToDb, authorizeUser, getUserPlaylists, SpotifyPlaylist } from './songs/songs.js'
import { addLyricsToDb } from './lyrics/lyrics.js'
import { preprocessLyrics } from './preprocessing/preprocessor.js'


import Database from "better-sqlite3"

const term = tkit.realTerminal

term.insertLine(2)
term.nextLine(2)

async function promptUserToSelectPlaylist(playlists: Array<SpotifyPlaylist>) {
  const items = playlists.map(item => item.name)
  term.cyan( 'Choose a playlist to load\n' )
  const selection = await term.singleColumnMenu(items).promise
  return playlists[selection.selectedIndex]
}

const createDatabase = () => {
  const db = new Database('lyrical.db')
  db.prepare(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      artist TEXT NOT NULL,
      lyrics TEXT NULL,
      punctuatedLyrics TEXT NULL,
      embedding JSON NULL
    );
  `).run()
  db.pragma('journal_mode = WAL');
  return db
}

async function main() {
  const accessToken = await authorizeUser()
  const playlists = await getUserPlaylists(accessToken)
  const selectedPlaylist = await promptUserToSelectPlaylist(playlists)
  createDatabase()
  await addSongsToDb(accessToken, selectedPlaylist)
  await addLyricsToDb()
  await preprocessLyrics()
  //addEmbeddingsToDb()
  //if not finished, clear state, erase db, etc.
  //save current playlist selection so user doesn't need to repeat next time unless they choose to
  //promptUserForInput()
  //findMatchingSongs(n) (n is number of songs to match)
  //term( '\n\n' ).eraseLineAfter.green("Selected: %s\n", (await selectedPlaylist).name)
  process.exit()
}

main();