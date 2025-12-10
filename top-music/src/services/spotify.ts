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
 * Helper to perform fetch with automatic token refresh on 401.
 */
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let response = await fetch(url, options);

    if (response.status === 401) {
        // Token might be expired, try refreshing
        try {
            const refreshResponse = await fetch('/refresh_token');
            if (refreshResponse.ok) {
                // Retry the original request
                response = await fetch(url, options);
            } else {
                // Refresh failed, nothing else we can do
                console.error('Token refresh failed');
            }
        } catch (error) {
            console.error('Error during token refresh:', error);
        }
    }

    return response;
};

/**
 * Fetches the current user's playlists via the backend proxy.
 * Authentication is handled via HttpOnly cookies.
 * Automatically attempts to refresh token if expired.
 */
export const getUserPlaylists = async (): Promise<SpotifyPlaylist[]> => {
    // We request our own backend, which forwards the request to Spotify with the cookie token
    const response = await fetchWithAuth('/api/user-playlists');

    if (!response.ok) {
         if (response.status === 401) {
             throw new Error('Session expired. Please login again.');
         }
        throw new Error(`Failed to fetch playlists: ${response.statusText}`);
    }

    const data: PlaylistResponse = await response.json();
    return data.items;
};

export interface SpotifyArtist {
    id: string;
    name: string;
}

export interface SpotifyAlbum {
    id: string;
    name: string;
    images: SpotifyImage[];
}

export interface SpotifyTrack {
    id: string;
    name: string;
    artists: SpotifyArtist[];
    album: SpotifyAlbum;
    duration_ms: number;
    preview_url: string | null;
}

export interface SpotifyPlaylistTrack {
    added_at: string;
    track: SpotifyTrack;
}

export interface SpotifyPlaylistDetail extends SpotifyPlaylist {
    description: string;
    owner: {
        display_name: string;
    };
    tracks: {
        href: string;
        total: number;
        items: SpotifyPlaylistTrack[];
    };
}

/**
 * Fetches full details for a specific playlist.
 */
export const getPlaylist = async (id: string): Promise<SpotifyPlaylistDetail> => {
    const response = await fetchWithAuth(`/api/playlist/${id}`);

    if (!response.ok) {
         if (response.status === 401) {
             throw new Error('Session expired. Please login again.');
         }
        throw new Error(`Failed to fetch playlist details: ${response.statusText}`);
    }

    return await response.json();
};
