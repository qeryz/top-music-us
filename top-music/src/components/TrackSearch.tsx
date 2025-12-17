import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { getAccessToken, type SpotifyTrack } from '../services/spotify';

interface TrackSearchProps {
    onAddTrack: (track: SpotifyTrack) => void;
}

const TrackSearch: React.FC<TrackSearchProps> = ({ onAddTrack }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SpotifyTrack[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const searchTracks = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const token = await getAccessToken();
                if (!token) return;

                const response = await fetch(
                    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setResults(data.tracks.items);
                }
            } catch (error) {
                console.error('Error searching tracks:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(searchTracks, 500);
        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for songs to add..."
                    className="w-full bg-white/10 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:bg-white/20 focus:border-white/30 transition-all"
                />
            </div>

            {results.length > 0 && (
                <div className="bg-[#181818] rounded-xl overflow-hidden border border-white/10 shadow-xl">
                    {results.map((track) => (
                        <div 
                            key={track.id}
                            className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors group"
                        >
                            <img 
                                src={track.album.images[2]?.url || track.album.images[0]?.url} 
                                alt={track.album.name}
                                className="w-10 h-10 rounded shadow-md" 
                            />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate text-sm">{track.name}</div>
                                <div className="text-xs text-white/60 truncate">
                                    {track.artists.map(a => a.name).join(', ')}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    onAddTrack(track);
                                    setQuery('');
                                    setResults([]);
                                }}
                                className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            {isSearching && (
                <div className="text-center text-xs text-white/40 py-2">
                    Searching Spotify...
                </div>
            )}
        </div>
    );
};

export default TrackSearch;
