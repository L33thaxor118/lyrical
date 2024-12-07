import { Artist } from "./Artist.js"

export interface Song {
    id: string,
    name: string,
    artists: Array<Artist>
}
