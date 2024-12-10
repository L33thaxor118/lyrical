import { Settings } from "../../model/Settings.js"
import { DbSong } from "../../model/DbSong.js"

export interface AppDatabase {
    connect(): Promise<void>
    disconnect(): Promise<void>
    beginTransaction(): Promise<void>
    commitTransaction(): Promise<void>
    rollbackTransaction(): Promise<void>
    insertSong(title: string, artist: string, lyrics: string, embedding: Array<number>): Promise<void>
    similarityQuery(embedding: Array<number>): Promise<Array<DbSong>>
    updateSettings(settings: Settings): Promise<void>
    getSettings(): Promise<Settings>
    clear(): Promise<void>
}