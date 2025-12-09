
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { ArrowLeft, Clock, MapPin, Pencil } from 'lucide-react'; // Using Lucide icons for now
import RouteMap from '../components/RouteMap';

const LIBRARIES: ("places")[] = ["places"];

const TripPreview: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Safe access to state in case user navigates directly
  const origin = state?.origin;
  const destination = state?.destination;

  const [routeStats, setRouteStats] = useState<{ distance: string; duration: string } | null>(null);

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
      <div className="relative w-[80vw] h-[70vh] mx-auto my-8 rounded-[40px] overflow-hidden shadow-2xl z-10">
            
            {/* Header / Nav */}
            <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-8 py-6 pointer-events-none">
                <div 
                    onClick={() => navigate('/dashboard')}
                    className="pointer-events-auto cursor-pointer bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-black/60 transition-colors text-white"
                >
                    <ArrowLeft className="w-6 h-6" />
                </div>
            </div>

            {/* Google Map */}
            {isLoaded ? (
                <RouteMap 
                    origin={origin} 
                    destination={destination}
                    onRouteStatsCalculated={setRouteStats}
                />
            ) : (
                <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center text-white/30">
                    Loading Map...
                </div>
            )}

            {/* Floating Info Card */}
            <div className="absolute top-24 left-8 z-20 w-80 bg-[#0A120E]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl">
                 <h2 className="text-white font-bold text-lg leading-tight mb-1">
                    {origin.address.split(',')[0]} to {destination.address.split(',')[0]}
                 </h2>
                 
                 {routeStats ? (
                     <div className="text-[#1ed760] font-medium text-sm mb-4">
                        Est. {routeStats.duration} ({routeStats.distance})
                     </div>
                 ) : (
                     <div className="text-white/40 text-sm mb-4 animate-pulse">Calculating...</div>
                 )}

                <button 
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-full transition-colors"
                >
                    <Pencil className="w-3 h-3" />
                    Edit Route
                </button>
            </div>

      </div>

      {/* --- BOTTOM HALF: CONTENT --- */}
      <div className="flex-1 px-8 py-12 max-w-7xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-white mb-8">Choose Your Soundtrack</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Placeholders for Playlists */}
              <div className="aspect-square rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20">
                  Playlist 1
              </div>
              <div className="aspect-square rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20">
                  Playlist 2
              </div>
               <div className="aspect-square rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20">
                  Playlist 3
              </div>
          </div>
      </div>

    </div>
  );
};

export default TripPreview;
