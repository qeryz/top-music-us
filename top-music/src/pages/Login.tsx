import React from 'react';
import { Briefcase } from 'lucide-react';

const Login = () => {
  const handleLogin = () => {
    // Redirect to the backend login endpoint
    window.location.href = 'http://127.0.0.1:5000/login';
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background-dark text-white font-display overflow-hidden">
      
      {/* Header */}
      <header className="px-8 py-6 z-10 w-full">
        <div className="flex items-center gap-2">
            <Briefcase className="text-primary w-8 h-8" strokeWidth={2.5} />
            <span className="text-xl font-bold tracking-tight text-white">RoadTrip Jams</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-8 pb-20">
        <div className="w-full max-w-[880px] rounded-3xl overflow-hidden shadow-2xl">
             {/* Background Image Container */}
            <div 
                className="relative bg-cover bg-center"
                style={{
                    backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCAvaVzNm8Iy0p_zAJWAolwAIUzRBomNzO2PvfrnwKhyAqjRyYVDNnFNd84GpUe0BXUpJ-xtCdxF9-1l9pKO47oFFeFM5lO6gQQ8WVNVz_yygGN7zLPhEKCWm7EbcK8SdAIOTFAtMZPFlGoTtpof4jXPQVdEuJAyM3SD-e2RAUS0knID1fp4fTmRvQLxwgDa_l_Y-MJxEGfaEmDJtixA3kZVfzerWiMOchwaWHSLu1Yuu61pMXg4pkIZFArDt3fY9L5pPP_qTR15t_A")`,
                    minHeight: '420px'
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />

                {/* Card Content */}
                <div className="relative flex flex-col items-center justify-center text-center px-8 py-16 min-h-[420px]">
                    <div className="space-y-4 max-w-2xl">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white">
                            Your Ultimate Road Trip Soundtrack
                        </h1>
                        <p className="text-base text-white/70 font-normal">
                            Plan your route and curate the perfect playlist for every mile.
                        </p>
                    </div>

                    <div className="mt-8">
                        <button 
                            onClick={handleLogin}
                            className="inline-flex items-center gap-2 bg-primary hover:bg-[#1ed760] text-black font-bold py-3 px-6 rounded-full transition-all duration-200 transform hover:scale-105"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.72 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            <span>Connect with Spotify</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full pb-8 text-center text-sm text-white/40">
        <div className="flex justify-center gap-12 mb-3">
            <a href="#" className="hover:text-white/60 transition-colors">About</a>
            <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
        </div>
        <p className="text-white/30">© {new Date().getFullYear()} RoadTrip Jams. All Rights Reserved.</p>
      </footer>

    </div>
  );
};

export default Login;
