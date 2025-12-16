import { useState, useEffect } from 'react';
import type { SpotifyTrack } from '../../services/spotify';
import { calculateTrackPositions, decodePolyline, interpolatePointAlongRoute, type TrackPosition } from '../../utils/routeUtils';

export const useTrackPositions = (
  directions: google.maps.DirectionsResult | null,
  tracks?: SpotifyTrack[]
) => {
  const [trackPositions, setTrackPositions] = useState<TrackPosition[]>([]);

  useEffect(() => {
    if (!directions || !tracks || tracks.length === 0) {
      setTrackPositions([]);
      return;
    }

    const route = directions.routes[0];
    if (!route || !route.legs || route.legs.length === 0) return;

    const leg = route.legs[0];
    if (!leg.duration?.value) return;

    const positions = calculateTrackPositions(tracks, leg.duration.value);
    
    // Decode the polyline to get all route points
    const encodedPolyline = route.overview_polyline;
    if (encodedPolyline) {
      const polylinePoints = decodePolyline(encodedPolyline);
      
      // Calculate geographical position for each track
      const positionsWithCoords = positions.map(pos => ({
        ...pos,
        position: interpolatePointAlongRoute(polylinePoints, pos.percentageAlongRoute)
      })).filter(pos => pos.position !== null);

      setTrackPositions(positionsWithCoords as TrackPosition[]);
    }
  }, [directions, tracks]);

  return trackPositions;
};
