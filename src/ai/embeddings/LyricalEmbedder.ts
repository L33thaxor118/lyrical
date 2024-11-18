import { Tensor2D } from "@tensorflow/tfjs-node";
import { LyricsEmbedder } from "./LyricsEmbedder";

class LyricalEmbedder implements LyricsEmbedder {
    getEmbedding(lyrics: string): Promise<Tensor2D> {
        throw new Error("Method not implemented.");
    }
}