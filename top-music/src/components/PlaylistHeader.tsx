import React from 'react';
import { ArrowLeft, Music, Loader } from 'lucide-react';
import type { SpotifyPlaylistDetail } from '../services/spotify';

interface PlaylistHeaderProps {
    playlist: SpotifyPlaylistDetail;
    onBack: () => void;
    deviceId: string | null;
}

const PlaylistHeader: React.FC<PlaylistHeaderProps> = ({ playlist, onBack, deviceId }) => {
    const imageUrl = playlist.images?.[0]?.url;

    return (
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
    );
};

export default PlaylistHeader;
