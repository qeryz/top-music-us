import React, { useEffect, useState } from 'react';
import { Play, Pause, Pen, Check, Clock, X } from 'lucide-react';
import type { SpotifyTrack, SpotifyPlaylistDetail, SpotifyPlayer } from '../services/spotify';
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
    player: SpotifyPlayer | null;
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
            // Assign unique local IDs to each track item to handle duplicates
            const tracksWithIds = {
                ...initialPlaylist.tracks,
                items: initialPlaylist.tracks.items.map(item => ({
                    ...item,
                    localId: crypto.randomUUID()
                }))
            };
            
            setLocalPlaylist({
                ...initialPlaylist,
                tracks: tracksWithIds
            });
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
            track: track,
            localId: crypto.randomUUID() // Generate unique ID for new track
        };

        setLocalPlaylist({
            ...localPlaylist,
            tracks: {
                ...localPlaylist.tracks,
                items: [newTrackItem, ...localPlaylist.tracks.items],
                total: localPlaylist.tracks.total + 1
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
                // Pass snapshot_id to ensure we are updating the version we think we are
                // Use localPlaylist.snapshot_id as it may have been updated by previous saves
                const currentSnapshotId = localPlaylist.snapshot_id || initialPlaylist.snapshot_id;
                const response = await savePlaylist(initialPlaylist.id, uris, currentSnapshotId);
                
                // Update local snapshot_id with the new one from server to stay in sync
                if (response.snapshot_id) {
                    setLocalPlaylist(prev => prev ? ({ ...prev, snapshot_id: response.snapshot_id }) : null);
                }
                
                setIsEditing(false);
            } catch (err: any) {
                console.error("Failed to save playlist", err);
                // Check if error is due to snapshot mismatch/version conflict
                // Spotify typically returns 409 or 400 for version issues
                if (err.message.includes('snapshot') || err.message.includes('version') || err.message.includes('modified')) {
                    alert("This playlist has been modified by someone else since you opened it. Please refresh the page and try again.");
                } else {
                    alert("Failed to save changes to Spotify. Please try again.");
                }
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
            <div className="sticky top-0 z-30 bg-[#05110a] shadow-md border-b border-white/5">
                <PlaylistHeader 
                    playlist={localPlaylist} 
                    onBack={onBack} 
                    deviceId={deviceId} 
                />

                {/* Actions Bar */}
                <div className="px-4 md:px-6 py-4 flex items-center justify-between gap-4">
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
                        <div className="flex gap-2">
                             {isEditing && (
                                <button 
                                    onClick={() => {
                                        if (initialPlaylist) {
                                            // Re-initialize local playlist from initial prop to discard changes
                                            const tracksWithIds = {
                                                ...initialPlaylist.tracks,
                                                items: initialPlaylist.tracks.items.map(item => ({
                                                    ...item,
                                                    localId: crypto.randomUUID()
                                                }))
                                            };
                                            setLocalPlaylist({
                                                ...initialPlaylist,
                                                tracks: tracksWithIds
                                            });
                                        }
                                        setIsEditing(false);
                                    }}
                                    disabled={isSaving}
                                    className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-white/10 text-white hover:bg-gray-500/20 hover:text-gray-400 transition-all border border-transparent hover:border-black-500"
                                >
                                    <X className="w-4 h-4" />
                                    <span>Cancel</span>
                                </button>
                            )}
                            
                            <button 
                                onClick={handleToggleEdit}
                                disabled={isSaving}
                                className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
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
                        </div>
                    )}
                </div>

                {isEditing && (
                    <TrackSearch onAddTrack={handleAddTrack} />
                )}

                {/* Track List Header - Sticky */}
                <div className="px-6 pb-2">
                    <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 text-white/50 text-sm uppercase tracking-wider">
                        <span className="w-8 text-center">#</span>
                        <span>Title</span>
                        <Clock className="w-4 h-4 ml-auto" />
                    </div>
                </div>
            </div>

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
