import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import RouteMap from '../components/RouteMap';
import type { SpotifyPlaylistDetail } from '../services/spotify';
import { calculatePlaylistDuration } from '../utils/routeUtils';
import TripStatsCard from '../components/TripStatsCard';
import TripPlaylistManager from '../components/TripPlaylistManager';

const LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

const TripPreview: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Safe access to state in case user navigates directly
  const origin = state?.origin;
  const destination = state?.destination;

  const [routeStats, setRouteStats] = useState<{ distance: string; duration: string; durationSeconds: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'my-playlists' | 'create-new'>('my-playlists');
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylistDetail | null>(null);

  // Memoize tracks array to prevent unnecessary re-renders
  const tracks = useMemo(() => {
    return selectedPlaylist?.tracks.items.map(item => item.track).filter(Boolean) || undefined;
  }, [selectedPlaylist]);

  // Calculate playlist duration
  const playlistDurationMs = useMemo(() => {
    if (!tracks || tracks.length === 0) return undefined;
    return calculatePlaylistDuration(tracks);
  }, [tracks]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  if (!origin || !destination) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#05110a] text-white">
            <div className="text-center space-y-4">
                <p>No trip details found.</p>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="text-primary hover:underline"
                >
                    Return to Planner
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#05110a] font-display">
      
      {/* --- TOP HALF: MAP AREA --- */}
      <div className="relative w-full md:w-[80vw] h-[60vh] md:h-[70vh] mx-auto mt-4 md:mt-24 mb-4 md:mb-8 rounded-none md:rounded-[40px] overflow-hidden shadow-2xl z-10">
            
            {/* Google Map */}
            {isLoaded ? (
                <RouteMap 
                    origin={origin} 
                    destination={destination}
                    onRouteStatsCalculated={setRouteStats}
                    tracks={tracks as any}
                    playlistDurationMs={playlistDurationMs}
                    playlistId={selectedPlaylist?.id}
                />
            ) : (
                <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center text-white/30">
                    Loading Map...
                </div>
            )}

            {/* Floating Info Card */}
            <TripStatsCard 
              origin={origin}
              destination={destination}
              routeStats={routeStats}
              selectedPlaylist={selectedPlaylist}
              playlistDurationMs={playlistDurationMs}
            />

      </div>

      {/* --- BOTTOM HALF: CONTENT --- */}
      <TripPlaylistManager 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onPlaylistSelect={setSelectedPlaylist}
      />

    </div>
  );
};

export default TripPreview;
