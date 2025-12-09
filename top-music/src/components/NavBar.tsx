import React from 'react';
import { Map, LogOut, LogIn } from 'lucide-react';

interface NavBarProps {
    isAuthenticated: boolean;
    onLogin: () => void;
    onLogout: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ isAuthenticated, onLogin, onLogout }) => {
    return (
        <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 pointer-events-none">
            {/* Logo Section */}
            <div className="flex items-center gap-2 pointer-events-auto">
                <Map className="w-10 h-10 text-secondary" />
                <span className="text-xl font-bold tracking-tight text-white select-none">Roadie</span>
            </div>
            
            {/* Actions Section */}
            <div className="flex items-center gap-4 pointer-events-auto">
                {isAuthenticated ? (
                    <>
                        <div className="hidden md:flex items-center gap-2 bg-[#1ed760]/10 border border-[#1ed760]/20 px-4 py-2 rounded-full">
                            <svg className="w-5 h-5 fill-primary" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.72 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            <span className="text-sm font-medium text-white/90 select-none">Powered by Spotify</span>
                        </div>
                        
                        <button 
                            onClick={onLogout}
                            className="text-white/60 hover:text-white transition-colors p-2 cursor-pointer"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={onLogin}
                        title="Login"
                        className="flex cursor-pointer items-center gap-2 bg-primary hover:bg-[#1ed760] text-black text-sm font-bold py-2 px-4 rounded-full transition-colors"
                    >
                        <LogIn className="w-4 h-4" />
                        <span className="hidden sm:inline">Connect with Spotify</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default NavBar;
