import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { SpotifyPlaylistDetail, SpotifyTrack } from '../services/spotify';
import SortableTrackItem from './SortableTrackItem';

interface TrackListProps {
    playlist: SpotifyPlaylistDetail;
    playingTrackId: string | null;
    isPaused: boolean;
    onPlay: (track: SpotifyTrack) => void;
    isEditing: boolean;
    onReorder: (newOrder: any[]) => void;
}

const TrackList: React.FC<TrackListProps> = ({ 
    playlist, 
    playingTrackId, 
    isPaused, 
    onPlay,
    isEditing,
    onReorder
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (active.id !== over?.id) {
            const oldIndex = playlist.tracks.items.findIndex((item) => item.localId === active.id);
            const newIndex = playlist.tracks.items.findIndex((item) => item.localId === over?.id);
            
            // Create new array with reordered items
            const newItems = [...playlist.tracks.items];
            const [movedItem] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, movedItem);
            
            onReorder(newItems);
        }
    };

    return (
        <div className="px-6 pb-20">
            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={handleDragEnd}
            >
                <SortableContext 
                    items={playlist.tracks.items.map(item => item.localId || item.track.id)} 
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col">
                        {playlist.tracks.items.map((item, index) => {
                            if (!item.track) return null;
                            const isCurrentPlaying = playingTrackId === item.track.id;
                            const uniqueId = item.localId || item.track.id;
                            
                            return (
                                <SortableTrackItem
                                    key={uniqueId}
                                    id={uniqueId}
                                    track={item.track}
                                    index={index}
                                    isCurrentPlaying={isCurrentPlaying}
                                    isPaused={isPaused}
                                    onPlay={onPlay}
                                    isDraggable={isEditing}
                                />
                            );
                        })}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default TrackList;
