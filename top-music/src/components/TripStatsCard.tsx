import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Pencil } from 'lucide-react';
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

  return (
    <div className="absolute top-24 left-8 z-20 w-80 bg-[#0A120E]/80 backdrop-blur-xs border border-white/5 rounded-2xl p-6 shadow-xl">
      <h2 className="text-white font-bold text-lg leading-tight mb-1">
        {origin.address.split(',')[0]} to {destination.address.split(',')[0]}
      </h2>
      
      {routeStats ? (
        <>
          <div className="text-[#1ed760] font-medium text-sm mb-4">
            Est. {routeStats.duration} ({routeStats.distance})
          </div>

          {/* Playlist Coverage Info */}
          {selectedPlaylist && playlistDurationMs && routeStats.durationSeconds > 0 && (
            <>
              <div className="border-t border-white/10 pt-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-4 h-4 text-[#1ed760]" />
                  <span className="text-white/70 text-xs font-medium">Playlist Coverage</span>
                </div>
                
                {(() => {
                  const routeSeconds = routeStats.durationSeconds;
                  const coveragePercentage = Math.min((playlistDurationMs / 1000) / routeSeconds, 1);
                  const gapDurationMs = routeSeconds * 1000 - playlistDurationMs;
                  
                  return (
                    <>
                      <div className="text-white text-sm mb-2">
                        {formatPlaybackTime(playlistDurationMs)} of music
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            coveragePercentage >= 1 ? 'bg-[#1ed760]' : 'bg-gradient-to-r from-[#1ed760] to-[#ff9500]'
                          }`}
                          style={{ width: `${Math.round(coveragePercentage * 100)}%` }}
                        />
                      </div>
                      
                      {/* Coverage Message */}
                      {coveragePercentage < 1 ? (
                        <div className="text-[#ff9500] text-xs font-medium">
                          ⚠️ {formatPlaybackTime(gapDurationMs)} short of full coverage
                        </div>
                      ) : (
                        <div className="text-[#1ed760] text-xs font-medium">
                          ✓ Full trip coverage
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-white/40 text-sm mb-4 animate-pulse">Calculating...</div>
      )}

      <button 
        onClick={() => navigate('/dashboard')}
        className="cursor-pointer flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-full transition-colors"
      >
        <Pencil className="w-3 h-3" />
        Edit Route
      </button>
    </div>
  );
};

export default TripStatsCard;
