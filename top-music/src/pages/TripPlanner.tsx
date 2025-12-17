import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import mapLines from '../assets/map-lines.png';
import { useJsApiLoader } from '@react-google-maps/api';
import PlacesAutocomplete from '../components/PlacesAutocomplete';

const LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

const TripPlanner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initialOrigin, initialDestination } = location.state || {}; // Get initial state if editing

  const [origin, setOrigin] = useState<{ address: string; lat: number; lng: number } | null>(initialOrigin || null);
  const [destination, setDestination] = useState<{ address: string; lat: number; lng: number } | null>(initialDestination || null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  const handlePlanTrip = () => {
    if (!origin || !destination) {
        alert("Please select both a starting point and a destination!");
        return;
    }
    // Navigate to preview page with state
    navigate('/trip-preview', { 
        state: { origin, destination } 
    });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display overflow-hidden bg-[#05110a]">
      
      {/* Background Map Image */}
      <div 
        className="absolute inset-0 opacity-100" 
        style={{
             backgroundImage: `url(${mapLines})`,
             backgroundSize: 'cover',
             backgroundPosition: 'center',
             // Removed mix-blend-mode to ensure visibility
        }}
      />
      {/* Dark Overlay for Readability - Adjusted to match "vignette" style */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      <div className="absolute inset-0 bg-black/40" />





      {/* Main Content Area */}
      <main className="relative z-10 flex flex-grow items-center px-12 md:px-24">
        
        {/* Floating Glass Card - Trip Planner */}
        <div className="w-full max-w-[480px] rounded-[32px] bg-[#0A120E]/93 border border-white/5 p-8 shadow-2xl shadow-black/50">
            
            <h1 className="text-4xl font-bold text-white mb-8 tracking-tight select-none">
                Where are you going?
            </h1>

            <div className="space-y-6 select-none">
                
                {isLoaded ? (
                  <>
                    <PlacesAutocomplete 
                      label="Starting from" 
                      icon="map-pin"
                      placeholder="Your current location"
                      onLocationSelect={setOrigin}
                      onClear={() => setOrigin(null)}
                      defaultValue={initialOrigin?.address}
                    />

                    <PlacesAutocomplete 
                      label="Destination" 
                      icon="flag" 
                      placeholder="Enter your destination..."
                      onLocationSelect={setDestination}
                      onClear={() => setDestination(null)}
                      defaultValue={initialDestination?.address}
                    />
                  </>
                ) : (
                  <div className="text-white/50 text-center py-4">Loading Maps...</div>
                )}

                {/* Plan Trip Button */}
                {origin && destination && (
                <button 
                    onClick={handlePlanTrip}
                    className="w-full cursor-pointer mt-4 bg-primary hover:bg-[#1ed760] text-black font-bold text-lg py-4 rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                    <Search className="w-5 h-5 stroke-[2.5]" />
                    <span>Plan My Trip</span>
                </button>
                )}
            </div>
        </div>

      </main>

    </div>
  );
};

export default TripPlanner;
