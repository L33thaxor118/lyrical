import { SpotifyPlaylist } from "../../model/SpotifyPlaylist.js"
import { Song } from "../../model/Song.js"

export interface MusicRepository {
    getPlaylists(): Promise<Array<SpotifyPlaylist>>
    getSongsInPlaylist(playlist: SpotifyPlaylist): AsyncGenerator<Song>
}