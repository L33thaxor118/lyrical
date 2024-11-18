import { Tensor2D } from "@tensorflow/tfjs-node";

export interface LyricsEmbedder {
    getEmbedding(lyrics: string): Promise<Tensor2D>
}