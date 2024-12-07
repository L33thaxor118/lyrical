import axios from "axios"
import { MusicRepository } from "./MusicRepository.js"
import { SpotifyPlaylist } from "../../model/SpotifyPlaylist.js"
import { Song } from "../../model/Song.js"

export class SpotifyMusic implements MusicRepository {
    async getPlaylists(accessToken: string): Promise<Array<SpotifyPlaylist>> {
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

    async *getSongsInPlaylist(playlist: SpotifyPlaylist, accessToken: string): AsyncGenerator<Song> {
        let nextUrl: string | null = playlist.tracks.href

        while (nextUrl) {
            const response: any = await axios.get(
                nextUrl, 
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            )
      
            if (response.status === 200) {
                const { items, next } = response.data
                for (const item of items) {
                    const id = item.track.id
                    const name = item.track.name
                    const artists = item.track.artists
                    const song = {
                        id: id,
                        name: name,
                        artists: artists?.map((artist: any)=>({id: artist.id, name: artist.name}))
                    }
                    yield song
                }
                nextUrl = next
            } else {
                throw new Error('Failed to get songs from playlist')
            }
        }
    }
}