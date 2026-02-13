import React, { useState } from 'react';
import { OverlayView, InfoWindow, useGoogleMap } from '@react-google-maps/api';
import type { TrackPosition } from '../utils/routeUtils';
import { formatPlaybackTime } from '../utils/formatters';

interface TrackMarkersProps {
  trackPositions: TrackPosition[];
  zoom: number;
}

const TrackMarkers: React.FC<TrackMarkersProps> = ({ trackPositions, zoom }) => {
  const map = useGoogleMap();
  const [selectedTrack, setSelectedTrack] = useState<TrackPosition | null>(null);

  // Clustering Logic
  // Group tracks that are temporally close based on zoom level
  const clusters = React.useMemo(() => {
    if (trackPositions.length === 0) return [];
    
    // Low zoom = larger time grouping
    let intervalMs = 0;
    if (zoom < 5) {
      intervalMs = 60 * 60 * 1000; // 60 mins
    } else if (zoom < 8) {
      intervalMs = 15 * 60 * 1000; // 15 mins
    } else if (zoom < 12) { // Adjusted thresholds for better clustering feel
      intervalMs = 5 * 60 * 1000; // 5 mins
    } else {
        return trackPositions.map(t => ({ head: t, items: [t] })); // No clustering at high zoom
    }

    const result: { head: TrackPosition; items: TrackPosition[] }[] = [];
    
    // Always start with the first track
    let currentCluster = { head: trackPositions[0], items: [trackPositions[0]] };
    result.push(currentCluster);
    
    let lastHeadTime = trackPositions[0].cumulativeTimeMs;

    for (let i = 1; i < trackPositions.length; i++) {
        const pos = trackPositions[i];
        const isLast = i === trackPositions.length - 1;
        
        // If we are far enough from the last visible marker (cluster head), start a new cluster
        // Or if it's the very last track (always show destination/end track)
        if (isLast || (pos.cumulativeTimeMs - lastHeadTime >= intervalMs)) {
            const newCluster = { head: pos, items: [pos] };
            result.push(newCluster);
            currentCluster = newCluster;
            lastHeadTime = pos.cumulativeTimeMs;
        } else {
            // "Stack" into the current cluster
            currentCluster.items.push(pos);
        }
    }

    return result;
  }, [trackPositions, zoom]);

  const handleMarkerClick = (cluster: { head: TrackPosition; items: TrackPosition[] }) => {
      // If it's a stack/cluster, zoom to fit
      if (cluster.items.length > 1 && map) {
          const bounds = new google.maps.LatLngBounds();
          cluster.items.forEach(item => {
              if (item.position) bounds.extend(item.position);
          });
          map.fitBounds(bounds);
      } else {
          // It's a single track, show info
          setSelectedTrack(cluster.head);
      }
  };

  const getPixelPositionOffset = (width: number, height: number) => ({
    x: -(width / 2),
    y: -(height / 2),
  });

  return (
    <>
      {/* Track Markers */}
      {clusters.map((cluster, index) => {
        const trackPos = cluster.head;
        const albumImage = trackPos.track.album.images[0]?.url;
        const count = cluster.items.length;
        const isStack = count > 1;
        
        // Use OverlayView for custom CSS stacking effects
        return (
          <OverlayView
            key={`${trackPos.track.id}-${index}`}
            position={trackPos.position!}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={getPixelPositionOffset}
          >
            <div 
                className="marker-cluster-container"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent map click
                    handleMarkerClick(cluster);
                }}
                style={{ zIndex: 1000 + index }}
            >
                {/* Stack "Fake" Layers */}
                {isStack && (
                    <>
                        {count > 3 && <div className="marker-stack-layer marker-stack-3" />}
                        {count > 2 && <div className="marker-stack-layer marker-stack-2" />}
                        {/* Always show stack-1 if isStack (count > 1) */}
                        <div className="marker-stack-layer marker-stack-1" />
                    </>
                )}

                {/* Main Image Card */}
                <img 
                    src={albumImage || 'https://via.placeholder.com/40'} 
                    alt={trackPos.track.name}
                    className="marker-card"
                />

                {/* Badge */}
                {isStack && (
                    <div className="marker-badge">
                        {count}
                    </div>
                )}
            </div>
          </OverlayView>
        );
      })}

      {/* InfoWindow as before */}
      {selectedTrack && selectedTrack.position && (
        <InfoWindow
          position={selectedTrack.position}
          onCloseClick={() => setSelectedTrack(null)}
        >
          {/* Content remains same */}
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
