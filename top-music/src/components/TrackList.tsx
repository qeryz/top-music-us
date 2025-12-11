import React from 'react';
import { Clock } from 'lucide-react';
import type { SpotifyPlaylistDetail, SpotifyTrack } from '../services/spotify';
import TrackItem from './TrackItem';

interface TrackListProps {
    playlist: SpotifyPlaylistDetail;
    playingTrackId: string | null;
    isPaused: boolean;
    onPlay: (track: SpotifyTrack) => void;
}

const TrackList: React.FC<TrackListProps> = ({ 
    playlist, 
    playingTrackId, 
    isPaused, 
    onPlay 
}) => {
    return (
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
                        <TrackItem
                            key={`${item.track.id}-${index}`}
                            track={item.track}
                            index={index}
                            isCurrentPlaying={isCurrentPlaying}
                            isPaused={isPaused}
                            onPlay={onPlay}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default TrackList;
