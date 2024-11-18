import axios from "axios";
import { MusicRepository, Playlist, Song } from "./MusicRepository";

export class SpotifyMusic implements MusicRepository {
    async getPlaylists(accessToken: string): Promise<Array<Playlist>> {
        const response = await axios.get(
             'https://api.spotify.com/v1/me/playlists', 
             {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        if (response.status === 200) {
            return response.data.items
        } else {
            throw new Error('Failed to get spotify playlists')
        }
    }

    async *getSongsInPlaylist(playlist: Playlist, accessToken: string): AsyncGenerator<Song> {
        const response = await axios.get( //TODO: is only getting 100 at a time it seems
            playlist.tracks.href,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        if (response.status === 200) {
            return response.data.items
        } else {
            throw new Error('Failed to get songs from playlist')
        }
    }
}