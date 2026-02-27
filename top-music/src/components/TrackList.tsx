import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { SpotifyPlaylistDetail, SpotifyTrack, SpotifyPlaylistItem } from '../types';
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
            const oldIndex = playlist.items?.items.findIndex((item: SpotifyPlaylistItem) => item.localId === active.id) ?? -1;
            const newIndex = playlist.items?.items.findIndex((item: SpotifyPlaylistItem) => item.localId === over?.id) ?? -1;
            
            if (oldIndex !== -1 && newIndex !== -1) {
                // Create new array with reordered items
                const newItems = [...(playlist.items?.items || [])];
                const [movedItem] = newItems.splice(oldIndex, 1);
                newItems.splice(newIndex, 0, movedItem);
                
                onReorder(newItems);
            }
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
                    items={playlist.items?.items.map((item: SpotifyPlaylistItem) => item.localId || item.item.id) || []} 
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col">
                        {playlist.items?.items.map((item: SpotifyPlaylistItem, index) => {
                            if (!item.item) return null;
                            const isCurrentPlaying = playingTrackId === item.item.id;
                            const uniqueId = item.localId || item.item.id;
                            
                            return (
                                <SortableTrackItem
                                    key={uniqueId}
                                    id={uniqueId}
                                    track={item.item}
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
