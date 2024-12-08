import axios from "axios"
import { LyricsPreprocessor } from "./LyricsPreprocessor.js"

export class DefaultLyricsPreprocessor implements LyricsPreprocessor {
    async preprocessLyrics(lyrics: string): Promise<string | null> {
        const payload = {
            text: lyrics,
        }
        const response = await axios.post('http://localhost:5001/preprocess', payload, {
            headers: {
                'Content-Type': 'application/json',
            },
        })

        return response.data.processedlyrics
    }
}