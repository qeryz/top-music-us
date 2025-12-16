import React, { useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import type { TrackPosition } from '../utils/routeUtils';
import { formatPlaybackTime } from '../utils/formatters';

interface TrackMarkersProps {
  trackPositions: TrackPosition[];
}

const TrackMarkers: React.FC<TrackMarkersProps> = ({ trackPositions }) => {
  const [selectedTrack, setSelectedTrack] = useState<TrackPosition | null>(null);

  return (
    <>
      {/* Track Markers */}
      {trackPositions.map((trackPos, index) => {
        const albumImage = trackPos.track.album.images[0]?.url;
        
        return (
          <Marker
            key={`${trackPos.track.id}-${index}`}
            position={trackPos.position!}
            icon={{
              url: albumImage || 'https://via.placeholder.com/40',
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 20),
            }}
            onClick={() => setSelectedTrack(trackPos)}
            zIndex={1000 + index}
          />
        );
      })}

      {/* InfoWindow for selected track */}
      {selectedTrack && selectedTrack.position && (
        <InfoWindow
          position={selectedTrack.position}
          onCloseClick={() => setSelectedTrack(null)}
        >
          <div className="p-2 max-w-xs">
            <div className="flex items-start gap-3">
              {selectedTrack.track.album.images[0] && (
                <img 
                  src={selectedTrack.track.album.images[0].url} 
                  alt={selectedTrack.track.album.name}
                  className="w-16 h-16 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-gray-900 truncate">
                  {selectedTrack.track.name}
                </h3>
                <p className="text-xs text-gray-600 truncate">
                  {selectedTrack.track.artists.map(a => a.name).join(', ')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Plays at: {formatPlaybackTime(selectedTrack.cumulativeTimeMs)}
                </p>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default TrackMarkers;
