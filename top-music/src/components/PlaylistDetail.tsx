import React from 'react';
import { Play, Pause } from 'lucide-react';
import type { SpotifyTrack } from '../services/spotify';
import PlaylistLoading from './PlaylistLoading';
import PlaylistError from './PlaylistError';
import PlaylistHeader from './PlaylistHeader';
import TrackList from './TrackList';
import { usePlaylistData } from '../hooks/usePlaylistData';
import { usePlayerState } from '../hooks/usePlayerState';
import { handlePlayTrack } from '../utils/playbackControls';

interface PlaylistDetailProps {
    playlistId: string;
    onBack: () => void;
    deviceId: string | null;
    player: any;
    sdkError: string | null;
}

const PlaylistDetail: React.FC<PlaylistDetailProps> = ({ 
    playlistId, 
    onBack, 
    deviceId, 
    player, 
    sdkError 
}) => {
    const { playlist, loading, error } = usePlaylistData(playlistId);
    const { playingTrackId, isPaused } = usePlayerState(player);

    const handlePlay = (track: SpotifyTrack) => {
        handlePlayTrack(track, { deviceId, sdkError, player, playingTrackId, isPaused });
    };

    if (loading) return <PlaylistLoading />;
    if (error) return <PlaylistError message={error} onRetry={() => window.location.reload()} />;
    if (!playlist) return null;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            <PlaylistHeader 
                playlist={playlist} 
                onBack={onBack} 
                deviceId={deviceId} 
            />

            {/* Actions Bar */}
            <div className="px-6 py-4 flex items-center gap-4">
                <button 
                    onClick={() => {
                        if (isPaused) {
                            player?.resume();
                        } else {
                            player?.pause();
                        }
                        if (!playingTrackId && playlist.tracks.items[0]?.track) {
                            handlePlay(playlist.tracks.items[0].track);
                        }
                    }}
                    className="w-14 h-14 rounded-full bg-[#1DB954] hover:scale-105 active:scale-95 flex items-center justify-center text-black transition-all shadow-lg cursor-pointer"
                >
                    {!isPaused ? <Pause className="w-7 h-7 fill-black" /> : <Play className="w-7 h-7 fill-black translate-x-0.5" />}
                </button>
            </div>

            <TrackList 
                playlist={playlist}
                playingTrackId={playingTrackId}
                isPaused={isPaused}
                onPlay={handlePlay}
            />
        </div>
    );
};

export default PlaylistDetail;
