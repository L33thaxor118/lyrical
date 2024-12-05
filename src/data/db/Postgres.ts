import { Settings } from "../../model/Settings.js"
import { DbSong } from "../../model/DbSong.js"
import { AppDatabase } from "./AppDatabase.js"
import pg from 'pg'

export class Postgres implements AppDatabase {
    private client = new pg.Client({
        user: 'postgres',
        host: 'localhost',
        database: 'lyrical',
        password: 'whatever',
        port: 5432
    })

    async connect() {
        try {
            await this.client.connect()

            const extensionInstallQuery = `
                CREATE EXTENSION IF NOT EXISTS vector;
            `

            const createSongsTableQuery = `
                CREATE TABLE IF NOT EXISTS Songs (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                artist TEXT NOT NULL,
                lyrics TEXT,
                embedding VECTOR(512)
            );`

            const createSettingsTableQuery = `
                CREATE TABLE IF NOT EXISTS Settings (
                id SERIAL PRIMARY KEY,
                loaded_playlist_name TEXT
            );`
        
            await this.client.query(extensionInstallQuery)
            await this.client.query(createSongsTableQuery)
            await this.client.query(createSettingsTableQuery)
        } catch(e) {
            this.disconnect()
        }
    }

    async disconnect() {
        await this.client.end()
    }

    async beginTransaction() {
        await this.client.query('BEGIN')
    }

    async commitTransaction() {
        await this.client.query('COMMIT')
    }

    async rollbackTransaction() {
        await this.client.query('ROLLBACK')
    }

    async insertSong(title: string, artist: string, lyrics: string, embedding: Array<number>) {
        const insertQuery = `
            INSERT INTO Songs (title, artist, lyrics, embedding)
            VALUES ($1, $2, $3, $4)
            RETURNING id;
        `
        if (embedding.length !== 512) {
            throw new Error("Embedding must be an array of 512 numbers as per table schema")
        }
        const formattedEmbedding = `[${embedding.join(',')}]`

        await this.client.query(insertQuery, [title, artist, lyrics, formattedEmbedding])
    }

    async updateSettings(settings: Settings) {
        const upsertQuery = `
            INSERT INTO Settings (id, loaded_playlist_name)
            VALUES ($1, $2)
            ON CONFLICT (id)
            DO UPDATE SET
                loaded_playlist_name = EXCLUDED.loaded_playlist_name
        `
        await this.client.query(upsertQuery, [0, settings.loadedPlaylistName])
    }
    
    async similarityQuery(embedding: Array<number>): Promise<Array<DbSong>> {
        const similarityQuery = `
            SELECT id, title, artist, lyrics, embedding
            FROM Songs
            ORDER BY embedding <=> $1
            LIMIT 3;
        `
        if (embedding.length !== 512) {
            throw new Error("Embedding must be an array of 512 numbers as per table schema")
        }
        const formattedEmbedding = `[${embedding.join(',')}]`

        const result = await this.client.query(similarityQuery, [formattedEmbedding])
        return result.rows
    }

    async getSettings(): Promise<Settings> {
        const settingsQuery = `
            SELECT id, loaded_playlist_name
            FROM Settings
        `
        const result = await this.client.query(settingsQuery)
        return { 
            loadedPlaylistName: result.rows[0].loaded_playlist_name
        }
    }
}