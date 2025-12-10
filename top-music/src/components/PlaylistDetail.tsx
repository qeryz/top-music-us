import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Play, Pause, Music, Loader } from 'lucide-react';
import { getPlaylist, playTrack, type SpotifyPlaylistDetail, type SpotifyTrack } from '../services/spotify';
import PlaylistLoading from './PlaylistLoading';
import PlaylistError from './PlaylistError';

interface PlaylistDetailProps {
    playlistId: string;
    onBack: () => void;
    deviceId: string | null;
    player: any;
    sdkError: string | null;
}

const PlaylistDetail: React.FC<PlaylistDetailProps> = ({ playlistId, onBack, deviceId, player, sdkError }) => {
    const [playlist, setPlaylist] = useState<SpotifyPlaylistDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

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

    // Listen to player state changes to track what's actually playing
    useEffect(() => {
        if (!player) return;

        const stateListener = (state: any) => {
            if (!state) {
                setPlayingTrackId(null);
                return;
            }

            // state.track_window.current_track contains info about the currently playing track
            if (state.paused) {
                setPlayingTrackId(null);
            } else if (state.track_window?.current_track) {
                // Extract the track ID from the URI (format: spotify:track:ID)
                const trackUri = state.track_window.current_track.uri;
                const trackId = trackUri.split(':')[2];
                setPlayingTrackId(trackId);
            }
        };

        player.addListener('player_state_changed', stateListener);

        return () => {
            player.removeListener('player_state_changed', stateListener);
        };
    }, [player]);

    const handlePlay = async (track: SpotifyTrack) => {

        if (sdkError) {
            alert(`Spotify Player Error: ${sdkError}`);
            return;
        }

        if (!deviceId) {
            console.error('[PlaylistDetail] No device ID available');
            alert("Spotify Web Player is still loading. Please wait or check console for errors...");
            return;
        }

        if (playingTrackId === track.id) {
            player?.pause();
            // Note: playingTrackId will be updated by the state listener
        } else {
            try {
                await playTrack(deviceId, track.uri);
                // Note: playingTrackId will be updated by the state listener when playback actually starts
            } catch (e) {
                alert("Failed to start playback. Do you have Spotify Premium?");
            }
        }
    };

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${Number(seconds) < 10 ? '0' : ''}${seconds}`;
    };

    if (loading) return <PlaylistLoading />;
    if (error) return <PlaylistError message={error} onRetry={() => window.location.reload()} />;
    if (!playlist) return null;

    const imageUrl = playlist.images?.[0]?.url;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-end gap-6 p-6 bg-gradient-to-b from-white/10 to-transparent rounded-t-xl">
                <div className="relative group shrink-0 shadow-2xl">
                    {imageUrl ? (
                        <img 
                            src={imageUrl} 
                            alt={playlist.name} 
                            className="w-48 h-48 object-cover rounded-lg shadow-black/50"
                        />
                    ) : (
                        <div className="w-48 h-48 bg-[#282828] flex items-center justify-center rounded-lg">
                            <Music className="w-20 h-20 text-white/20" />
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col gap-2 pb-2">
                    <div className="flex items-center gap-2 mb-2">
                         <button 
                            onClick={onBack}
                            className="p-2 rounded-full bg-black/40 hover:bg-white/10 text-white transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-bold tracking-wider uppercase text-white/70">Playlist</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">{playlist.name}</h1>
                    <p className="text-white/60 text-sm mt-2 line-clamp-2 max-w-2xl">{playlist.description}</p>
                    <div className="flex items-center gap-2 text-white/80 text-sm font-medium mt-2">
                        <span>{playlist.owner.display_name}</span>
                        <span>•</span>
                        <span>{playlist.tracks.total} songs</span>
                        {!deviceId && <Loader className="w-3 h-3 animate-spin text-orange-400" />}
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="px-6 py-4 flex items-center gap-4">
                <button 
                    onClick={() => playlist.tracks.items[0]?.track && handlePlay(playlist.tracks.items[0].track)}
                    className="w-14 h-14 rounded-full bg-[#1DB954] hover:scale-105 active:scale-95 flex items-center justify-center text-black transition-all shadow-lg cursor-pointer"
                >
                    {playingTrackId ? <Pause className="w-7 h-7 fill-black" /> : <Play className="w-7 h-7 fill-black translate-x-0.5" />}
                </button>
            </div>

            {/* Tracks List */}
            <div className="px-6 pb-20">
                 <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 border-b border-white/10 text-white/50 text-sm uppercase tracking-wider mb-2">
                    <span className="w-8 text-center">#</span>
                    <span>Title</span>
                    <Clock className="w-4 h-4 ml-auto" />
                 </div>

                 <div className="flex flex-col">
                    {playlist.tracks.items.map((item, index) => {
                        if (!item.track) return null;
                        const isCurrentPlaying = playingTrackId === item.track.id;
                        
                        return (
                            <div 
                                key={`${item.track.id}-${index}`}
                                className="group grid grid-cols-[auto_1fr_auto] gap-4 items-center px-4 py-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                                onClick={() => handlePlay(item.track)}
                            >
                                <div className="w-8 flex justify-center text-white/60 font-medium group-hover:hidden">
                                    {index + 1}
                                </div>
                                <div className="w-8 justify-center hidden group-hover:flex text-white">
                                    {isCurrentPlaying ? (
                                        <Pause className="w-4 h-4" />
                                    ) : (
                                        <Play className="w-4 h-4 fill-white" />
                                    )}
                                </div>

                                <div className="flex items-center gap-3 overflow-hidden">
                                     {item.track.album.images?.[0] && (
                                        <img src={item.track.album.images[0].url} alt="" className="w-10 h-10 rounded object-cover" />
                                     )}
                                     <div className="flex flex-col truncate">
                                         <span className={`font-medium truncate ${isCurrentPlaying ? 'text-[#1DB954]' : 'text-white'}`}>
                                            {item.track.name}
                                         </span>
                                         <span className="text-sm text-white/60 truncate">
                                            {item.track.artists.map(a => a.name).join(', ')}
                                         </span>
                                     </div>
                                </div>

                                <div className="text-sm text-white/60 font-variant-numeric tabular-nums">
                                    {formatDuration(item.track.duration_ms)}
                                </div>
                            </div>
                        );
                    })}
                 </div>
            </div>
        </div>
    );
};

export default PlaylistDetail;
