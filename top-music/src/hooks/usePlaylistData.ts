import { useEffect, useState } from 'react';
import { getPlaylist, type SpotifyPlaylistDetail } from '../services/spotify';

export const usePlaylistData = (playlistId: string) => {
    const [playlist, setPlaylist] = useState<SpotifyPlaylistDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const data = await getPlaylist(playlistId);
                setPlaylist(data);
            } catch (err) {
                console.error("Failed to fetch playlist details", err);
                setError(err instanceof Error ? err.message : "Failed to load playlist");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [playlistId]);

    return { playlist, loading, error };
};
