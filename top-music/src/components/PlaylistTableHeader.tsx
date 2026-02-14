import React from 'react';
import { Clock } from 'lucide-react';

const PlaylistTableHeader: React.FC = () => {
    return (
        <div className="px-6 pb-2">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 text-white/50 text-sm uppercase tracking-wider">
                <span className="w-8 text-center">#</span>
                <span>Title</span>
                <Clock className="w-4 h-4 ml-auto" />
            </div>
        </div>
    );
};

export default PlaylistTableHeader;
