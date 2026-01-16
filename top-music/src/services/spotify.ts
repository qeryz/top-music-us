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
    collaborative: boolean;
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
    uri: string;
}

export interface SpotifyPlaylistTrack {
    added_at: string;
    track: SpotifyTrack;
    localId?: string; // Frontend-only unique ID for Drag & Drop
}

export interface SpotifyUser {
    id: string;
    display_name: string;
    email?: string;
    images?: SpotifyImage[];
}

export interface SpotifyPlaylistDetail extends SpotifyPlaylist {
    description: string;
    snapshot_id: string; // Added for version control
    owner: {
        id: string;
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

/**
 * Fetches the access token from the backend for use in the SDK.
 */
export const getAccessToken = async (): Promise<string | null> => {
    try {
        const response = await fetchWithAuth('/api/token');
        if (!response.ok) {
            console.error(`[getAccessToken] Failed to fetch token: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        console.log('[getAccessToken] Token retrieved successfully');
        return data.access_token;
    } catch (e) {
        console.error("[getAccessToken] Error fetching access token:", e);
        return null;
    }
};

/**
 * Fetches the current user's profile.
 */
export const getCurrentUser = async (): Promise<SpotifyUser | null> => {
    try {
        const token = await getAccessToken();
        if (!token) return null;

        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user profile: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
    }
};

/**
 * Transfers playback to the specified device.
 */
export const transferPlayback = async (deviceId: string): Promise<void> => {
    const response = await fetchWithAuth('/api/transfer-playback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            device_ids: [deviceId],
            play: false
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to transfer playback');
    }
};

/**
 * Plays a track on the specified device.
 */
export const playTrack = async (deviceId: string, trackUri: string): Promise<void> => {
    const response = await fetchWithAuth('/api/play', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            device_id: deviceId,
            uris: [trackUri] 
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        
        // If device not found, try transferring playback first
        if (response.status === 404 || errorData.error?.reason === 'NO_ACTIVE_DEVICE') {
            console.log('[playTrack] Device not found, transferring playback...');
            await transferPlayback(deviceId);
            
            // Wait a bit for the transfer to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Retry the play request
            const retryResponse = await fetchWithAuth('/api/play', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    device_id: deviceId,
                    uris: [trackUri] 
                })
            });
            
            if (!retryResponse.ok) {
                const retryError = await retryResponse.json();
                throw new Error(retryError.error || 'Failed to play track after transfer');
            }
        } else {
            throw new Error(errorData.error || 'Failed to play track');
        }
    }
};

export const savePlaylist = async (playlistId: string, uris: string[], snapshotId?: string): Promise<any> => {
    const response = await fetchWithAuth('/api/save-playlist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            playlist_id: playlistId,
            uris,
            snapshot_id: snapshotId
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save playlist');
    }

    return await response.json();
};

// --- Web Playback SDK Types ---

export interface SpotifyPlayerState {
    context: {
        uri: string | null;
        metadata: any;
    };
    disallows: {
        pausing: boolean;
        peeking_next: boolean;
        peeking_prev: boolean;
        resuming: boolean;
        seeking: boolean;
        skipping_next: boolean;
        skipping_prev: boolean;
    };
    duration: number;
    paused: boolean;
    position: number;
    repeat_mode: number;
    shuffle: boolean;
    track_window: {
        current_track: SpotifyTrack;
        next_tracks: SpotifyTrack[];
        previous_tracks: SpotifyTrack[];
    };
}

export interface SpotifyPlayer {
    connect: () => Promise<boolean>;
    disconnect: () => void;
    addListener: (eventName: string, callback: (data: any) => void) => boolean;
    removeListener: (eventName: string, callback?: (data: any) => void) => boolean;
    getCurrentState: () => Promise<SpotifyPlayerState | null>;
    setVolume: (volume: number) => Promise<void>;
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    togglePlay: () => Promise<void>;
    seek: (position_ms: number) => Promise<void>;
    previousTrack: () => Promise<void>;
    nextTrack: () => Promise<void>;
    activateElement: () => Promise<void>;
}
