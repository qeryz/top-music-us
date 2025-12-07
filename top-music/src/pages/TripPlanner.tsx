import React, { useState } from 'react';
import { MapPin, Flag, Search, Music, LogOut } from 'lucide-react';
import mapLines from '../assets/map-lines.png';

interface TripPlannerProps {
  onLogout: () => void;
}

const TripPlanner: React.FC<TripPlannerProps> = ({ onLogout }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handlePlanTrip = () => {
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
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-black font-bold">
                <MapPin className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Road Trip Planner</span>
        </div>
        
        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-[#1ed760]/10 border border-[#1ed760]/20 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-white/90">Powered by Spotify</span>
            </div>
            
            <button 
                onClick={onLogout}
                className="text-white/60 hover:text-white transition-colors"
                title="Logout"
            >
                <LogOut className="w-5 h-5" />
            </button>
        </div>
      </header>


      {/* Main Content Area */}
      <main className="relative z-10 flex flex-grow items-center px-12 md:px-24">
        
        {/* Floating Glass Card */}
        <div className="w-full max-w-[480px] rounded-[32px] bg-[#0A120E]/93 border border-white/5 p-8 shadow-2xl shadow-black/50">
            
            <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">
                Where are you going?
            </h1>

            <div className="space-y-6">
                
                {/* Starting From Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60 ml-1">Starting from</label>
                    <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Your current location"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Destination Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60 ml-1">Destination</label>
                    <div className="relative group">
                        <Flag className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Enter your destination..."
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Plan Trip Button */}
                <button 
                    onClick={handlePlanTrip}
                    className="w-full mt-4 bg-primary hover:bg-[#1ed760] text-black font-bold text-lg py-4 rounded-full transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                    <Search className="w-5 h-5 stroke-[2.5]" />
                    <span>Plan My Trip</span>
                </button>

            </div>
        </div>

      </main>

    </div>
  );
};

export default TripPlanner;
