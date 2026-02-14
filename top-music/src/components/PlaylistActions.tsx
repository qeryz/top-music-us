import React from 'react';
import { Play, Pause, Pen, Check, X } from 'lucide-react';
import type { SpotifyTrack, SpotifyPlaylistDetail } from '../services/spotify';

interface PlaylistActionsProps {
  isPaused: boolean;
  playingTrackId: string | null;
  localPlaylist: SpotifyPlaylistDetail;
  player: SpotifyPlayer | null;
  handlePlay: (track: SpotifyTrack) => void;
  canEdit: boolean;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

// Re-declare SpotifyPlayer if needed, or import it. Using 'any' for player to simplify prop drilling if type isn't exported perfectly, but ideally import.
// Assuming imports exist in parent.
import type { SpotifyPlayer } from '../services/spotify';

const PlaylistActions: React.FC<PlaylistActionsProps> = ({
  isPaused,
  playingTrackId,
  localPlaylist,
  player,
  handlePlay,
  canEdit,
  isEditing,
  setIsEditing,
  isSaving,
  onCancel,
  onSave
}) => {
  return (
    <div className="px-4 md:px-6 py-4 flex items-center justify-between gap-4">
      <button 
        onClick={() => {
            if (isPaused) {
                player?.resume();
            } else {
                player?.pause();
            }
            if (!playingTrackId && localPlaylist.tracks.items[0]?.track) {
                handlePlay(localPlaylist.tracks.items[0].track);
            }
        }}
        className="w-14 h-14 rounded-full bg-[#1DB954] hover:scale-105 active:scale-95 flex items-center justify-center text-black transition-all shadow-lg cursor-pointer"
      >
        {!isPaused ? <Pause className="w-7 h-7 fill-black" /> : <Play className="w-7 h-7 fill-black translate-x-0.5" />}
      </button>

      {canEdit && (
        <div className="flex gap-2">
             {isEditing && (
                <button 
                    onClick={onCancel}
                    disabled={isSaving}
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-white/10 text-white hover:bg-gray-500/20 hover:text-gray-400 transition-all border border-transparent hover:border-black-500"
                >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                </button>
            )}
            
            <button 
                onClick={isEditing ? onSave : () => setIsEditing(true)}
                disabled={isSaving}
                className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                    isEditing 
                    ? 'bg-white text-black hover:bg-white/90' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isSaving ? (
                    <span className="text-xs">Saving...</span>
                ) : isEditing ? (
                    <>
                        <Check className="w-4 h-4" />
                        <span>Done</span>
                    </>
                ) : (
                    <>
                        <Pen className="w-4 h-4" />
                        <span>Edit Playlist</span>
                    </>
                )}
            </button>
        </div>
      )}
    </div>
  );
};

export default PlaylistActions;
