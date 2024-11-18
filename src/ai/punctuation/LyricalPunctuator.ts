import { LyricsPunctuator } from "./LyricsPunctuator";

export class LyricalPunctuator implements LyricsPunctuator {
    punctuate(lyrics: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
}