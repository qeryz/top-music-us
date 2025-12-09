import React, { useEffect, useState } from 'react';
import { getUserPlaylists, type SpotifyPlaylist } from '../services/spotify';
import { Music, AlertCircle, Loader } from 'lucide-react';

const MyPlaylists: React.FC = () => {
    const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlaylists = async () => {
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

        fetchPlaylists();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-white/50">
                <Loader className="w-8 h-8 animate-spin mb-4" />
                <p>Loading your library...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-red-400">
                <AlertCircle className="w-10 h-10 mb-4" />
                <p>{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (playlists.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-white/50">
                <Music className="w-12 h-12 mb-4 opacity-50" />
                <p>No playlists found in your library.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-1">
            {playlists.map((playlist) => {
                const imageUrl = playlist.images?.[0]?.url;
                return (
                    <div 
                        key={playlist.id} 
                        className="group relative flex flex-col gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer border border-transparent hover:border-white/10"
                    >
                        {/* Playlist Image */}
                        <div className="aspect-square w-full rounded-lg overflow-hidden bg-[#282828] shadow-lg relative">
                             {imageUrl ? (
                                <img 
                                    src={imageUrl} 
                                    alt={playlist.name} 
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Music className="w-12 h-12 text-white/20" />
                                </div>
                             )}
                             
                             {/* Hover Play Button Overlay (Visual only for now) */}
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                {/* Can add play icon here later */}
                             </div>
                        </div>

                        {/* Info */}
                        <div className="flex flex-col gap-1">
                            <h3 className="text-white font-bold truncate" title={playlist.name}>
                                {playlist.name}
                            </h3>
                            <p className="text-sm text-white/60">
                                {playlist.tracks.total} songs
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MyPlaylists;
