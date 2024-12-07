import axios from "axios"
import { EmbeddingRepository } from "./EmbeddingRepository.js"

export class DefaultEmbeddingRepository implements EmbeddingRepository {
    async getEmbedding(lyrics: string): Promise<Array<number>> {
        const payload = {
            text: lyrics,
        }

        const response = await axios.post('http://localhost:5001/embed', payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        })

        return response.data.embeddings
    }
}