import React, { useEffect, useState } from 'react';
import type { SpotifyTrack, SpotifyPlaylistDetail, SpotifyPlayer } from '../services/spotify';
import PlaylistLoading from './PlaylistLoading';
import PlaylistError from './PlaylistError';
import PlaylistHeader from './PlaylistHeader';
import TrackList from './TrackList';
import TrackSearch from './TrackSearch';
import PlaylistActions from './PlaylistActions';
import PlaylistTableHeader from './PlaylistTableHeader';
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

    const handleSave = async () => {
        if (!localPlaylist || !initialPlaylist) return;
        
        setIsSaving(true);
        try {
            const uris = localPlaylist.tracks.items.map(item => item.track.uri);
            const currentSnapshotId = localPlaylist.snapshot_id || initialPlaylist.snapshot_id;
            const response = await savePlaylist(initialPlaylist.id, uris, currentSnapshotId);
            
            if (response.snapshot_id) {
                setLocalPlaylist(prev => prev ? ({ ...prev, snapshot_id: response.snapshot_id }) : null);
            }
            
            setIsEditing(false);
        } catch (err: any) {
            console.error("Failed to save playlist", err);
            if (err.message.includes('snapshot') || err.message.includes('version') || err.message.includes('modified')) {
                alert("This playlist has been modified by someone else since you opened it. Please refresh the page and try again.");
            } else {
                alert("Failed to save changes to Spotify. Please try again.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        if (initialPlaylist) {
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

                <PlaylistActions 
                    isPaused={isPaused}
                    playingTrackId={playingTrackId}
                    localPlaylist={localPlaylist}
                    player={player}
                    handlePlay={handlePlay}
                    canEdit={canEdit}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    isSaving={isSaving}
                    onCancel={handleCancelEdit}
                    onSave={handleSave}
                />

                {isEditing && (
                    <TrackSearch onAddTrack={handleAddTrack} />
                )}

                <PlaylistTableHeader />
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
