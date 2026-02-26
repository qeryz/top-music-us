import React, { useState, useEffect } from 'react';
import { Sparkles, Music, Play, Plus, Save, Loader2, RefreshCw } from 'lucide-react';
import { generatePlaylist, createPlaylist, getPlaylist, type SpotifyTrack, type SpotifyPlaylistDetail } from '../services/spotify';
import { formatPlaybackTime } from '../utils/formatters';

interface CreatePlaylistProps {
    routeStats: { distance: string; duration: string; durationSeconds: number } | null;
    origin: { address: string };
    destination: { address: string };
    onPlaylistCreated: (playlist: SpotifyPlaylistDetail) => void;
}

const CreatePlaylist: React.FC<CreatePlaylistProps> = ({ routeStats, origin, destination, onPlaylistCreated }) => {
    const [playlistName, setPlaylistName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [generatedTracks, setGeneratedTracks] = useState<SpotifyTrack[]>([]);
    const [totalDurationMs, setTotalDurationMs] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Set default name when destination is available
    useEffect(() => {
        if (destination && !playlistName) {
            const cityName = destination.address.split(',')[0];
            setPlaylistName(`Road Trip to ${cityName}`);
        }
    }, [destination]);

    const handleGenerate = async () => {
        if (!routeStats) return;
        
        setIsGenerating(true);
        setError(null);
        try {
            const data = await generatePlaylist(routeStats.durationSeconds);
            setGeneratedTracks(data.tracks);
            setTotalDurationMs(data.total_duration_ms);
        } catch (err) {
            console.error("Failed to generate tracks", err);
            setError(err instanceof Error ? err.message : "Failed to generate playlist. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCreateOnSpotify = async () => {
        if (!playlistName || generatedTracks.length === 0) return;

        setIsCreating(true);
        setError(null);
        try {
            const uris = generatedTracks.map(t => t.uri);
            const { playlist_id } = await createPlaylist(playlistName, uris);
            
            // Fetch full details to return
            const fullPlaylist = await getPlaylist(playlist_id);
            onPlaylistCreated(fullPlaylist);
        } catch (err) {
            console.error("Failed to create playlist", err);
            setError(err instanceof Error ? err.message : "Failed to create playlist on Spotify.");
        } finally {
            setIsCreating(false);
        }
    };

    if (!routeStats) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-white/40">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p>Waiting for trip details...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-sm">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-[#1ed760] font-bold text-sm uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        <span>AI Generation</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white">Create your trip soundtrack</h2>
                    <p className="text-white/60 text-sm md:text-base">
                        We'll analyze your {routeStats.duration} trip and curate a playlist from your top tracks and discoveries to perfectly fill the drive.
                    </p>
                </div>
                
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || isCreating}
                    className="shrink-0 bg-[#1ed760] hover:bg-[#1fdf64] disabled:opacity-50 disabled:hover:bg-[#1ed760] text-black font-bold py-4 px-8 rounded-full transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#1ed760]/20 active:scale-95 cursor-pointer"
                >
                    {isGenerating ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                        <Sparkles className="w-5 h-5" />
                    )}
                    {generatedTracks.length > 0 ? "Regenerate Mix" : "Generate Tracks"}
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm flex items-center gap-3">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Preview Section */}
            {generatedTracks.length > 0 && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                        <div className="flex-1 w-full">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block">Playlist Name</label>
                            <input 
                                type="text"
                                value={playlistName}
                                onChange={(e) => setPlaylistName(e.target.value)}
                                className="w-full bg-transparent text-2xl md:text-3xl font-extrabold text-white focus:outline-none placeholder:text-white/10"
                                placeholder="Give your playlist a name..."
                            />
                        </div>
                        <div className="text-right shrink-0">
                            <div className="text-white font-bold text-lg md:text-xl">{generatedTracks.length} tracks</div>
                            <div className="text-[#1ed760] font-medium text-sm">~ {formatPlaybackTime(totalDurationMs)} coverage</div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        {generatedTracks.slice(0, 5).map((track, i) => (
                            <div key={track.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                                <span className="w-4 text-white/20 text-xs font-medium">{i + 1}</span>
                                <img 
                                    src={track.album.images[track.album.images.length - 1]?.url} 
                                    alt="" 
                                    className="w-10 h-10 rounded shadow-md object-cover" 
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-bold text-sm truncate">{track.name}</div>
                                    <div className="text-white/40 text-xs truncate">{track.artists.map(a => a.name).join(', ')}</div>
                                </div>
                                <div className="text-white/30 text-xs tabular-nums group-hover:text-white/60 transition-colors">
                                    {formatPlaybackTime(track.duration_ms)}
                                </div>
                            </div>
                        ))}
                        {generatedTracks.length > 5 && (
                            <div className="text-center py-4 text-white/20 text-xs font-medium border-t border-white/5 mt-2">
                                + {generatedTracks.length - 5} more tracks
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center pt-8">
                        <button 
                            onClick={handleCreateOnSpotify}
                            disabled={isCreating || !playlistName}
                            className="bg-white hover:bg-white/90 disabled:opacity-50 text-black font-extrabold py-5 px-12 rounded-full transition-all flex items-center gap-3 shadow-2xl active:scale-95 cursor-pointer"
                        >
                            {isCreating ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <Save className="w-6 h-6" />
                            )}
                            <span className="text-lg">Save & Sync to Spotify</span>
                        </button>
                    </div>
                </div>
            )}

            {generatedTracks.length === 0 && !isGenerating && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-2 border-dashed border-white/5 rounded-[40px]">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                        <Music className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-white font-bold">No tracks generated yet</h3>
                        <p className="text-white/40 text-sm max-w-xs">Click the button above to create a custom mix for your trip.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatePlaylist;
