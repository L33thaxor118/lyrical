export interface DbSong {
    id: string
    title: string
    artist: string
    lyrics: string | null
    embedding: Array<number> | null
}