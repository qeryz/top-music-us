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

export interface SpotifyLibraryResponse {
    items: SpotifyPlaylist[];
    total: number;
}

export interface SavePlaylistResponse {
    snapshot_id: string;
}

export interface GeneratePlaylistResponse {
    tracks: SpotifyTrack[];
    total_duration_ms: number;
    trip_duration_ms: number;
}

export interface CreatePlaylistResponse {
    success: boolean;
    playlist_id: string;
    external_url: string;
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
