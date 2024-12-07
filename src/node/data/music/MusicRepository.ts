import { SpotifyPlaylist } from "../../model/SpotifyPlaylist.js"
import { Song } from "../../model/Song.js"

export interface MusicRepository {
    getPlaylists(accessToken: string): Promise<Array<SpotifyPlaylist>>
    getSongsInPlaylist(playlist: SpotifyPlaylist, accessToken: string): AsyncGenerator<Song>
}