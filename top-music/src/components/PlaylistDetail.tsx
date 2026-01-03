import React, { useEffect, useState } from 'react';
import { Play, Pause, Pen, Check } from 'lucide-react';
import type { SpotifyTrack, SpotifyPlaylistDetail } from '../services/spotify';
import PlaylistLoading from './PlaylistLoading';
import PlaylistError from './PlaylistError';
import PlaylistHeader from './PlaylistHeader';
import TrackList from './TrackList';
import TrackSearch from './TrackSearch';
import { usePlaylistData } from '../hooks/usePlaylistData';
import { usePlayerState } from '../hooks/usePlayerState';
import { useAuth } from '../context/AuthContext';
import { handlePlayTrack } from '../utils/playbackControls';
import { savePlaylist } from '../services/spotify';

interface PlaylistDetailProps {
    playlistId: string;
    onBack: () => void;
    deviceId: string | null;
    player: any;
    sdkError: string | null;
    onPlaylistLoaded?: (playlist: SpotifyPlaylistDetail) => void;
}

const PlaylistDetail: React.FC<PlaylistDetailProps> = ({ 
    playlistId, 
    onBack, 
    deviceId, 
    player, 
    sdkError,
    onPlaylistLoaded
}) => {
    const { playlist: initialPlaylist, loading, error } = usePlaylistData(playlistId);
    const { playingTrackId, isPaused } = usePlayerState(player);
    const { user } = useAuth();
    
    // Local state for playlist manipulation (reordering, adding tracks)
    const [localPlaylist, setLocalPlaylist] = useState<SpotifyPlaylistDetail | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Sync local playlist state when data fetch is complete
    useEffect(() => {
        if (initialPlaylist) {
            setLocalPlaylist(initialPlaylist);
        }
    }, [initialPlaylist]);

    // Notify parent when playlist is loaded (using local state as source of truth)
    useEffect(() => {
        if (localPlaylist && onPlaylistLoaded) {
            onPlaylistLoaded(localPlaylist);
        }
    }, [localPlaylist, onPlaylistLoaded]);

    const handlePlay = (track: SpotifyTrack) => {
        handlePlayTrack(track, { deviceId, sdkError, player, playingTrackId, isPaused });
    };

    const handleReorder = (newItems: any[]) => {
        if (!localPlaylist) return;
        setLocalPlaylist({ 
            ...localPlaylist, 
            tracks: { 
                ...localPlaylist.tracks, 
                items: newItems 
            } 
        });
    };

    const handleAddTrack = (track: SpotifyTrack) => {
        if (!localPlaylist) return;
        
        const newTrackItem = {
            added_at: new Date().toISOString(),
            is_local: false,
            track: track
        };

        setLocalPlaylist({
            ...localPlaylist,
            tracks: {
                ...localPlaylist.tracks,
                items: [newTrackItem, ...localPlaylist.tracks.items]
            }
        });
    };

    const handleToggleEdit = async () => {
        if (isEditing) {
            // User is clicking "Done" - Save changes
            if (!localPlaylist || !initialPlaylist) return;
            
            setIsSaving(true);
            try {
                const uris = localPlaylist.tracks.items.map(item => item.track.uri);
                await savePlaylist(initialPlaylist.id, uris);
                setIsEditing(false);
            } catch (err) {
                console.error("Failed to save playlist", err);
                alert("Failed to save changes to Spotify. Please try again.");
            } finally {
                setIsSaving(false);
            }
        } else {
            // User is clicking "Edit"
            setIsEditing(true);
        }
    };

    if (loading) return <PlaylistLoading />;
    if (error) return <PlaylistError message={error} onRetry={() => window.location.reload()} />;
    if (!localPlaylist) return null;

    // Check permissions: Owner ID matches User ID OR Playlist is collaborative
    const canEdit = localPlaylist?.owner?.id === user?.id || localPlaylist?.collaborative;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            <PlaylistHeader 
                playlist={localPlaylist} 
                onBack={onBack} 
                deviceId={deviceId} 
            />

            {/* Actions Bar */}
            <div className="px-6 py-4 flex items-center justify-between gap-4">
                <button 
                    onClick={() => {
                        if (isPaused) {
                            player?.resume();
                        } else {
                            player?.pause();
                        }
                        if (!playingTrackId && localPlaylist.tracks.items[0]?.track) {
                            handlePlay(localPlaylist.tracks.items[0].track);
                        }
                    }}
                    className="w-14 h-14 rounded-full bg-[#1DB954] hover:scale-105 active:scale-95 flex items-center justify-center text-black transition-all shadow-lg cursor-pointer"
                >
                    {!isPaused ? <Pause className="w-7 h-7 fill-black" /> : <Play className="w-7 h-7 fill-black translate-x-0.5" />}
                </button>

                {canEdit && (
                    <button 
                        onClick={handleToggleEdit}
                        disabled={isSaving}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                            isEditing 
                            ? 'bg-white text-black hover:bg-white/90' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                        } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSaving ? (
                            <span className="text-xs">Saving...</span>
                        ) : isEditing ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Done</span>
                            </>
                        ) : (
                            <>
                                <Pen className="w-4 h-4" />
                                <span>Edit Playlist</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {isEditing && (
                <TrackSearch onAddTrack={handleAddTrack} />
            )}

            <TrackList 
                playlist={localPlaylist}
                playingTrackId={playingTrackId}
                isPaused={isPaused}
                onPlay={handlePlay}
                isEditing={isEditing}
                onReorder={handleReorder}
            />
        </div>
    );
};

export default PlaylistDetail;
