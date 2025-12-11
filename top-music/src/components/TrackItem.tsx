import React from 'react';
import { Play, Pause } from 'lucide-react';
import type { SpotifyTrack } from '../services/spotify';
import { formatDuration } from '../utils/formatters';

interface TrackItemProps {
    track: SpotifyTrack;
    index: number;
    isCurrentPlaying: boolean;
    isPaused: boolean;
    onPlay: (track: SpotifyTrack) => void;
}

const TrackItem: React.FC<TrackItemProps> = ({ 
    track, 
    index, 
    isCurrentPlaying, 
    isPaused, 
    onPlay 
}) => {
    return (
        <div 
            className="group grid grid-cols-[auto_1fr_auto] gap-4 items-center px-4 py-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => onPlay(track)}
        >
            <div className="w-8 flex justify-center text-white/60 font-medium group-hover:hidden">
                {index + 1}
            </div>
            <div className="w-8 justify-center hidden group-hover:flex text-white">
                {!isPaused && isCurrentPlaying ? (
                    <Pause className="w-4 h-4" />
                ) : (
                    <Play className="w-4 h-4 fill-white" />
                )}
            </div>

            <div className="flex items-center gap-3 overflow-hidden">
                {track.album.images?.[0] && (
                    <img src={track.album.images[0].url} alt="" className="w-10 h-10 rounded object-cover" />
                )}
                <div className="flex flex-col truncate">
                    <span className={`font-medium truncate ${isCurrentPlaying ? 'text-[#1DB954]' : 'text-white'}`}>
                        {track.name}
                    </span>
                    <span className="text-sm text-white/60 truncate">
                        {track.artists.map(a => a.name).join(', ')}
                    </span>
                </div>
            </div>

            <div className="text-sm text-white/60 font-variant-numeric tabular-nums">
                {formatDuration(track.duration_ms)}
            </div>
        </div>
    );
};

export default TrackItem;
