import React from 'react';
import { Layers } from 'lucide-react';

interface MapControlsProps {
    showTracks: boolean;
    onToggleTracks: (show: boolean) => void;
}

const MapControls: React.FC<MapControlsProps> = ({ showTracks, onToggleTracks }) => {
    return (
        <div className="absolute top-24 right-4 md:top-auto md:bottom-8 md:right-16 z-20">
            <div className="text-white backdrop-blur-md rounded-2xl shadow-xl">
                 <button
                    onClick={() => onToggleTracks(!showTracks)}
                    className={`flex cursor-pointer items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                        showTracks 
                        ? 'bg-primary/20 text-primary border border-primary/20' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-transparent'
                    }`}
                >
                    <Layers className="w-4 h-4" />
                    <span className="hidden md:block">{showTracks ? 'Hide' : 'Show'} Markers</span>
                </button>
            </div>
        </div>
    );
};

export default MapControls;
