import React from 'react';
import { Loader } from 'lucide-react';

const PlaylistLoading: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-white/50">
            <Loader className="w-8 h-8 animate-spin mb-4" />
            <p>Loading your library...</p>
        </div>
    );
};

export default PlaylistLoading;
