import Database from 'better-sqlite3'
// @ts-ignore
import { getLyrics } from 'genius-lyrics-api'

const geniusLyricsApiKey = "k_VaaUDl5J3gB8XlV2w84dI3EELEyUaOTuvQB37oFgOq-JHpWrL3SIGbzarv1355"

interface DbSong {
    id: number,
    name: string,
    artist: string,
    lyrics?: string,
    punctuatedLyrics?: string,
    embedding?: string
}

const getLyricsForSong = async (song: DbSong): Promise<string> => {
    const options = {
        apiKey: geniusLyricsApiKey,
        title: song.name,
        artist: song.artist,
        optimizeQuery: true
    }
    return await getLyrics(options)
}

export const addLyricsToDb = async () => {
    const read = new Database('lyrical.db')
    const write = new Database('lyrical.db')
    try {
        const getSongsWithMissingLyrics= read.prepare('SELECT * FROM songs WHERE lyrics IS NULL')
        const updateSongWithLyrics = write.prepare('UPDATE songs SET lyrics = ? WHERE id = ?')
        for (const song of getSongsWithMissingLyrics.iterate()) {
            const lyrics = await getLyricsForSong(song as DbSong)
            updateSongWithLyrics.run(lyrics, (song as DbSong).id)
        }
    } catch(e) {
        console.log(e)
    }
}