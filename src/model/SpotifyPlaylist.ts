export interface SpotifyPlaylist {
    id: string,
    name: string,
    tracks: {
        href: string,
        count: number
    }
}