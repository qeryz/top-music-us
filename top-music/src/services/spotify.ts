export interface SpotifyImage {
    url: string;
    height: number;
    width: number;
}

export interface SpotifyPlaylist {
    id: string;
    name: string;
    images: SpotifyImage[];
    borderWidth?: number;
    tracks: {
        href: string;
        total: number;
    };
    external_urls: {
        spotify: string;
    };
}

export interface PlaylistResponse {
    href: string;
    items: SpotifyPlaylist[];
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
}

/**
 * Fetches the current user's playlists via the backend proxy.
 * Authentication is handled via HttpOnly cookies.
 */
export const getUserPlaylists = async (): Promise<SpotifyPlaylist[]> => {
    // We request our own backend, which forwards the request to Spotify with the cookie token
    const response = await fetch('/api/user-playlists');

    if (!response.ok) {
         if (response.status === 401) {
             throw new Error('Session expired. Please login again.');
         }
        throw new Error(`Failed to fetch playlists: ${response.statusText}`);
    }

    const data: PlaylistResponse = await response.json();
    return data.items;
};
