import React from 'react';
import { AlertCircle } from 'lucide-react';

interface PlaylistErrorProps {
    message: string;
    onRetry: () => void;
    actionLabel?: string;
}

const PlaylistError: React.FC<PlaylistErrorProps> = ({ message, onRetry, actionLabel = 'Try Again' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-red-400">
            <AlertCircle className="w-10 h-10 mb-4" />
            <p>{message}</p>
            <button 
                onClick={onRetry} 
                className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors cursor-pointer"
            >
                {actionLabel}
            </button>
        </div>
    );
};

export default PlaylistError;
