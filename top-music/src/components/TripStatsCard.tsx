import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { formatPlaybackTime } from '../utils/formatters';
import type { SpotifyPlaylistDetail } from '../services/spotify';

interface TripStatsCardProps {
  origin: { address: string };
  destination: { address: string };
  routeStats: { distance: string; duration: string; durationSeconds: number } | null;
  selectedPlaylist: SpotifyPlaylistDetail | null;
  playlistDurationMs?: number;
}

const TripStatsCard: React.FC<TripStatsCardProps> = ({
  origin,
  destination,
  routeStats,
  selectedPlaylist,
  playlistDurationMs
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="absolute bottom-0 left-0 right-0 md:top-24 md:left-8 md:right-auto md:bottom-auto z-20 w-full md:w-80 bg-[#0A120E]/90 md:bg-[#0A120E]/80 backdrop-blur-md md:backdrop-blur-xs border-t md:border border-white/5 rounded-t-3xl md:rounded-2xl p-5 md:p-6 shadow-xl transition-all">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h2 className="text-white font-bold text-base md:text-lg leading-tight line-clamp-1 md:line-clamp-none">
            {origin.address.split(',')[0]} to {destination.address.split(',')[0]}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => navigate('/dashboard', { 
                state: { 
                  initialOrigin: origin, 
                  initialDestination: destination 
                } 
              })}
              className="cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-3 rounded-full transition-colors"
            >
              <Pencil className="w-3 h-3" />
              <span className="hidden md:inline">Edit Route</span>
              <span className="md:hidden">Edit</span>
            </button>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
        </div>
      </div>
      
      {/* Collapsible Content Wrapper */}
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
            
            {/* Est Duration */}
            <div className="pt-1"> {/* Spacer */}
                 {routeStats ? (
                    <div className="text-[#1ed760] font-medium text-xs md:text-sm mb-3 md:last:mb-0">
                      Est. {routeStats.duration} ({routeStats.distance})
                    </div>
                  ) : (
                    <div className="text-white/40 text-xs md:text-sm mb-3 md:last:mb-0 animate-pulse">Calculating...</div>
                  )}
            </div>

            {/* Playlist Coverage Info */}
            {routeStats && selectedPlaylist && playlistDurationMs && routeStats.durationSeconds > 0 && (
                <div className="border-t border-white/10 pt-3 md:pt-4 mt-1 md:mt-0">
                {(() => {
                    const routeSeconds = routeStats.durationSeconds;
                    const coveragePercentage = Math.min((playlistDurationMs / 1000) / routeSeconds, 1);
                    const gapDurationMs = routeSeconds * 1000 - playlistDurationMs;
                    
                    return (
                    <>
                        <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <Music className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#1ed760]" />
                            <span className="text-white/70 text-[10px] md:text-xs font-medium uppercase tracking-wider">Coverage</span>
                        </div>
                        <div className="text-white text-xs md:text-sm font-medium">
                            {formatPlaybackTime(playlistDurationMs)}
                        </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-white/10 rounded-full h-1.5 md:h-2 mb-2 overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                            coveragePercentage >= 1 ? 'bg-[#1ed760]' : 'bg-gradient-to-r from-[#1ed760] to-[#ff9500]'
                            }`}
                            style={{ width: `${Math.round(coveragePercentage * 100)}%` }}
                        />
                        </div>
                        
                        {/* Coverage Message */}
                        {coveragePercentage < 1 ? (
                        <div className="flex items-center gap-1.5 text-[#ff9500] text-[10px] md:text-xs font-medium">
                            <span>⚠️</span>
                            <span>{formatPlaybackTime(gapDurationMs)} short of full coverage</span>
                        </div>
                        ) : (
                        <div className="flex items-center gap-1.5 text-[#1ed760] text-[10px] md:text-xs font-medium">
                            <span>✓</span>
                            <span>Full trip coverage</span>
                        </div>
                        )}
                    </>
                    );
                })()}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TripStatsCard;
