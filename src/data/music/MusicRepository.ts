export interface Playlist {
    id: string,
    name: string,
    tracks: {
        href: string,
        count: number
    }
}

export interface Song {
    id: string,
    name: string,
    artists: Array<Artist>
}

export interface Artist {
    id: string,
    name: string,
}

export interface MusicRepository {
    getPlaylists(accessToken: string): Promise<Array<Playlist>>
    getSongsInPlaylist(playlist: Playlist, accessToken: string): AsyncGenerator<Song>
}