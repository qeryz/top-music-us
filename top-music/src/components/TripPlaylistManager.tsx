import React from 'react';
import MyPlaylists from './MyPlaylists';
import CreatePlaylist from './CreatePlaylist';
import type { SpotifyPlaylistDetail, RouteStats, TripLocation } from '../types';

interface TripPlaylistManagerProps {
  activeTab: 'my-playlists' | 'create-new';
  setActiveTab: (tab: 'my-playlists' | 'create-new') => void;
  onPlaylistSelect: (playlist: SpotifyPlaylistDetail | null) => void;
  routeStats: RouteStats | null;
  origin: TripLocation;
  destination: TripLocation;
}

const TripPlaylistManager: React.FC<TripPlaylistManagerProps> = ({
  activeTab,
  setActiveTab,
  onPlaylistSelect,
  routeStats,
  origin,
  destination
}) => {
  return (
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
              <MyPlaylists onPlaylistSelect={onPlaylistSelect} />
           ) : (
              <CreatePlaylist 
                routeStats={routeStats} 
                origin={origin}
                destination={destination}
                onPlaylistCreated={onPlaylistSelect} 
              />
           )}
        </div>

    </div>
  );
};

export default TripPlaylistManager;
