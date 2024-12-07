export interface EmbeddingRepository {
    getEmbedding(lyrics: string): Promise<Array<number>>
}