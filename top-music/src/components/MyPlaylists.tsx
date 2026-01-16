import React, { useEffect, useState } from 'react';
import { getUserPlaylists, type SpotifyPlaylist, type SpotifyPlaylistDetail } from '../services/spotify';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import PlaylistLoading from './PlaylistLoading';
import PlaylistError from './PlaylistError';
import PlaylistGrid from './PlaylistGrid';
import PlaylistDetail from './PlaylistDetail';

interface MyPlaylistsProps {
    onPlaylistSelect?: (playlist: SpotifyPlaylistDetail | null) => void;
}

const MyPlaylists: React.FC<MyPlaylistsProps> = ({ onPlaylistSelect }) => {
    const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
    
    const { login } = useAuth(); // Get login function
    
    // Initialize Spotify Player once at this level
    const { deviceId, player, error: sdkError } = useSpotifyPlayer();

    const fetchPlaylists = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUserPlaylists();
            setPlaylists(data);
        } catch (err) {
            console.error("Failed to fetch playlists", err);
            setError(err instanceof Error ? err.message : "Failed to load playlists");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    if (selectedPlaylistId) {
        return (
            <PlaylistDetail 
                playlistId={selectedPlaylistId} 
                onBack={() => {
                    setSelectedPlaylistId(null);
                    onPlaylistSelect?.(null);
                }}
                deviceId={deviceId}
                player={player}
                sdkError={sdkError}
                onPlaylistLoaded={onPlaylistSelect}
            />
        );
    }

    if (loading) {
        return <PlaylistLoading />;
    }

    if (error) {
        const isSessionError = error.includes('Session expired');
        return (
            <PlaylistError 
                message={error} 
                onRetry={isSessionError ? login : fetchPlaylists}
                actionLabel={isSessionError ? 'Log In' : 'Try Again'}
            />
        );
    }

    return <PlaylistGrid playlists={playlists} onSelect={setSelectedPlaylistId} />;
};

export default MyPlaylists;

