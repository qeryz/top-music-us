
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { Clock, MapPin, Pencil } from 'lucide-react'; // Using Lucide icons for now
import RouteMap from '../components/RouteMap';

import MyPlaylists from '../components/MyPlaylists';

const LIBRARIES: ("places")[] = ["places"];

const TripPreview: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Safe access to state in case user navigates directly
  const origin = state?.origin;
  const destination = state?.destination;

  const [routeStats, setRouteStats] = useState<{ distance: string; duration: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'my-playlists' | 'create-new'>('my-playlists');

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
      <div className="relative w-[80vw] h-[70vh] mx-auto mt-24 mb-8 rounded-[40px] overflow-hidden shadow-2xl z-10">
            


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
      <div className="flex-1 px-8 py-12 max-w-7xl mx-auto w-full flex flex-col gap-8">
          
          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-white/10 pb-4">
            <button 
                onClick={() => setActiveTab('my-playlists')}
                className={`text-xl font-bold transition-colors ${activeTab === 'my-playlists' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/70'}`}
            >
                My Playlists
            </button>
            <button 
                onClick={() => setActiveTab('create-new')}
                className={`text-xl font-bold transition-colors ${activeTab === 'create-new' ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/70'}`}
            >
                Create New
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px]">
             {activeTab === 'my-playlists' ? (
                <MyPlaylists />
             ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                    <p className="text-white/40 font-medium">Create New Playlist UI Coming Soon</p>
                </div>
             )}
          </div>

      </div>

    </div>
  );
};

export default TripPreview;
