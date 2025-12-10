import React, { useEffect, useState } from 'react';
import { getUserPlaylists, type SpotifyPlaylist } from '../services/spotify';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';
import PlaylistLoading from './PlaylistLoading';
import PlaylistError from './PlaylistError';
import PlaylistGrid from './PlaylistGrid';
import PlaylistDetail from './PlaylistDetail';

const MyPlaylists: React.FC = () => {
    const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
    
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
                onBack={() => setSelectedPlaylistId(null)}
                deviceId={deviceId}
                player={player}
                sdkError={sdkError}
            />
        );
    }

    if (loading) {
        return <PlaylistLoading />;
    }

    if (error) {
        return (
            <PlaylistError 
                message={error} 
                onRetry={fetchPlaylists} 
            />
        );
    }

    return <PlaylistGrid playlists={playlists} onSelect={setSelectedPlaylistId} />;
};

export default MyPlaylists;

