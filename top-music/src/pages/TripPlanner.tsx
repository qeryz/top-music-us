import React, { useState } from 'react';
import { Map, Search, Music, LogOut } from 'lucide-react';
import mapLines from '../assets/map-lines.png';
import { useJsApiLoader } from '@react-google-maps/api';
import PlacesAutocomplete from '../components/PlacesAutocomplete';

const LIBRARIES: ("places")[] = ["places"];

interface TripPlannerProps {
  onLogout: () => void;
}

const TripPlanner: React.FC<TripPlannerProps> = ({ onLogout }) => {
  const [origin, setOrigin] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<{ address: string; lat: number; lng: number } | null>(null);

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
    console.log('Planning trip from', origin, 'to', destination);
    // Future: Call Google Maps API / Backend
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


      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold tracking-tight text-white select-none">Road Trip Planner</span>
        </div>
        
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-[#1ed760]/10 border border-[#1ed760]/20 px-4 py-2 rounded-full">
               <svg className="w-5 h-5 fill-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.72 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                <span className="text-sm font-medium text-white/90 select-none">Powered by Spotify</span>
            </div>
            
            <button 
                onClick={onLogout}
                className="text-white/60 hover:text-white transition-colors"
                title="Logout"
            >
                <LogOut className="w-5 h-5 cursor-pointer" />
            </button>
        </div>
      </header>


      {/* Main Content Area */}
      <main className="relative z-10 flex flex-grow items-center px-12 md:px-24">
        
        {/* Floating Glass Card */}
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
                    />

                    <PlacesAutocomplete 
                      label="Destination" 
                      icon="flag" 
                      placeholder="Enter your destination..."
                      onLocationSelect={setDestination}
                      onClear={() => setDestination(null)}
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
