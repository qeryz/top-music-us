import React, { useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import type { TrackPosition } from '../utils/routeUtils';
import { formatPlaybackTime } from '../utils/formatters';

interface TrackMarkersProps {
  trackPositions: TrackPosition[];
  zoom: number;
}

const TrackMarkers: React.FC<TrackMarkersProps> = ({ trackPositions, zoom }) => {
  const [selectedTrack, setSelectedTrack] = useState<TrackPosition | null>(null);

  // Set opacity based on zoom level
  const markerOpacity = zoom < 9 ? 0.6 : 1.0;

  // Smart Decimation Logic
  // Show fewer markers when zoomed out to prevent clutter
  const visibleTracks = React.useMemo(() => {
    if (zoom >= 10) return trackPositions; // Show all at high zoom

    let intervalMs = 0;
    if (zoom < 5) {
      intervalMs = 60 * 60 * 1000; // 60 mins
    } else if (zoom < 8) {
      intervalMs = 15 * 60 * 1000; // 15 mins
    } else {
      intervalMs = 5 * 60 * 1000; // 5 mins
    }

    const filtered: TrackPosition[] = [];
    let lastIncludedTime = -intervalMs; // Ensure first track is included

    trackPositions.forEach((pos) => {
      // Always include the very first and very last track
      const isFirst = pos === trackPositions[0];
      const isLast = pos === trackPositions[trackPositions.length - 1];

      if (isFirst || isLast || (pos.cumulativeTimeMs - lastIncludedTime >= intervalMs)) {
        filtered.push(pos);
        lastIncludedTime = pos.cumulativeTimeMs;
      }
    });

    return filtered;
  }, [trackPositions, zoom]);

  return (
    <>
      {/* Track Markers */}
      {visibleTracks.map((trackPos, index) => {
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
            opacity={markerOpacity}
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
