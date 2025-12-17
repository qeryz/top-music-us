import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import TrackItem from './TrackItem';
import type { SpotifyTrack } from '../services/spotify';

interface SortableTrackItemProps {
  id: string;
  track: SpotifyTrack;
  index: number;
  isCurrentPlaying: boolean;
  isPaused: boolean;
  onPlay: (track: SpotifyTrack) => void;
  isDraggable: boolean;
}

const SortableTrackItem: React.FC<SortableTrackItemProps> = ({
  id,
  track,
  index,
  isCurrentPlaying,
  isPaused,
  onPlay,
  isDraggable
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
    position: isDragging ? 'relative' : 'static' as any,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 group">
      {isDraggable && (
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/80 p-1"
        >
          <GripVertical className="w-5 h-5" />
        </div>
      )}
      
      <div className="flex-1">
         <TrackItem
             track={track}
             index={index}
             isCurrentPlaying={isCurrentPlaying}
             isPaused={isPaused}
             onPlay={onPlay}
         />
      </div>
    </div>
  );
};

export default SortableTrackItem;
