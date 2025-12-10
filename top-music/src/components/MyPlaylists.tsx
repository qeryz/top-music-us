import React, { useEffect, useState } from 'react';
import { getUserPlaylists, type SpotifyPlaylist } from '../services/spotify';
import PlaylistLoading from './PlaylistLoading';
import PlaylistError from './PlaylistError';
import PlaylistGrid from './PlaylistGrid';

const MyPlaylists: React.FC = () => {
    const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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

    return <PlaylistGrid playlists={playlists} />;
};

export default MyPlaylists;

