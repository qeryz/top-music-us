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
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 p-4 md:p-6 bg-gradient-to-b from-white/10 to-transparent rounded-t-xl">
            {/* Mobile: Top Row with Back Button and Image
                Desktop: Image is just the first child */}
            <div className="flex items-center md:block gap-4 w-full md:w-auto">
                <button 
                    onClick={onBack}
                    className="md:hidden p-2 rounded-full bg-black/40 hover:bg-white/10 text-white transition-colors cursor-pointer shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative group shrink-0 shadow-2xl mx-auto md:mx-0">
                    {imageUrl ? (
                        <img 
                            src={imageUrl} 
                            alt={playlist.name} 
                            className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-lg shadow-black/50"
                        />
                    ) : (
                        <div className="w-32 h-32 md:w-48 md:h-48 bg-[#282828] flex items-center justify-center rounded-lg">
                            <Music className="w-12 h-12 md:w-20 md:h-20 text-white/20" />
                        </div>
                    )}
                </div>
                
                {/* Spacer for mobile centering balance if needed, or just let it be left-aligned/centered */}
                <div className="w-9 md:hidden" /> {/* Placeholder to balance the back button visually if image is centered */}
            </div>
            
            <div className="flex flex-col gap-1 md:gap-2 pb-2 w-full text-center md:text-left">
                {/* Desktop: Back Button & Label Row */}
                <div className="hidden md:flex items-center gap-2 mb-2">
                    <button 
                        onClick={onBack}
                        className="p-2 rounded-full bg-black/40 hover:bg-white/10 text-white transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-bold tracking-wider uppercase text-white/70">Playlist</span>
                </div>
                
                {/* Mobile: Label only (Back button is above) */}
                <div className="md:hidden text-[10px] font-bold tracking-wider uppercase text-white/70 mb-1">
                    Playlist
                </div>

                <h1 className="text-2xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">{playlist.name}</h1>
                <p className="text-white/60 text-xs md:text-sm mt-1 md:mt-2 line-clamp-2 max-w-2xl mx-auto md:mx-0">{playlist.description}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-white/80 text-xs md:text-sm font-medium mt-2">
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
