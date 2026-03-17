

import OptimizedImage from '../components/OptimizedImage';

const Login = () => {
  const handleLogin = () => {
    // Redirect to the backend login endpoint
    window.location.href = 'http://127.0.0.1:5000/login';
  };

  return (
    <div className="relative h-screen w-full flex flex-col bg-[#040806] text-white font-display overflow-hidden">
      
      {/* 1. Hero Content - Absolutely centered in the full viewport */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-5xl animate-fade-in-up">
            <div className="relative w-full min-h-[420px] md:min-h-[520px] bg-[#0a120e] rounded-[2.5rem] md:rounded-[3.2rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.6)] border border-white/5 group">
                
                {/* Visual Background */}
                <div className="absolute inset-0 z-0">
                    <OptimizedImage
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAvaVzNm8Iy0p_zAJWAolwAIUzRBomNzO2PvfrnwKhyAqjRyYVDNnFNd84GpUe0BXUpJ-xtCdxF9-1l9pKO47oFFeFM5lO6gQQ8WVNVz_yygGN7zLPhEKCWm7EbcK8SdAIOTFAtMZPFlGoTtpof4jXPQVdEuJAyM3SD-e2RAUS0knID1fp4fTmRvQLxwgDa_l_Y-MJxEGfaEmDJtixA3kZVfzerWiMOchwaWHSLu1Yuu61pMXg4pkIZFArDt3fY9L5pPP_qTR15t_A"
                        alt="Road trip background"
                        containerClassName="w-full h-full"
                        className="scale-105 group-hover:scale-110 transition-transform duration-[20s] ease-out opacity-40"
                        loading="eager"
                        decoding="sync"
                    />
                </div>

                {/* Depth Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a120e] via-transparent to-transparent z-[1]" />
                <div className="absolute inset-0 bg-black/50 z-[2]" />

                {/* Content - Force vertical/horizontal center with flex */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 md:px-12 py-10 md:py-14 z-[10]">
                    <div className="max-w-3xl flex flex-col items-center">
                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1] drop-shadow-2xl mb-3 md:mb-4">
                            Your Ultimate <br className="hidden sm:block" />
                            Road Trip Soundtrack
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-white/50 font-medium max-w-lg mx-auto leading-relaxed mb-6 md:mb-10">
                            Plan your route and curate the perfect <br className="hidden sm:block"/> 
                            playlist for every single mile.
                        </p>
                        
                        <div className="flex justify-center">
                            <button 
                                onClick={handleLogin}
                                className="cursor-pointer inline-flex items-center gap-3 bg-[#1ed760] hover:bg-[#1fdf64] text-black font-bold py-3.5 px-8 md:py-4.5 md:px-12 rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl shadow-[#1ed760]/20"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.72 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                                </svg>
                                <span className="text-base md:text-lg">Connect with Spotify</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* 2. Footer - Fixed at bottom out of flow for perfect centering */}
      <footer className="absolute bottom-6 left-0 right-0 text-center text-[10px] md:text-xs text-white/20 pointer-events-none">
        <div className="flex justify-center gap-6 mb-2 pointer-events-auto">
            <a href="#" className="hover:text-primary transition-colors">About</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
        </div>
        <p className="select-none cursor-default">
            © {new Date().getFullYear()} RoadTrip Jams.
        </p>
      </footer>

    </div>
  );
};

export default Login;
