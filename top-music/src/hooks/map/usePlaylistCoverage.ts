import { useState, useEffect } from 'react';
import type { SpotifyTrack } from '../../services/spotify';
import { calculateCoveragePercentage, decodePolyline, splitPolylineAtPercentage } from '../../utils/routeUtils';

interface CoverageData {
  coveredPath: google.maps.LatLng[];
  uncoveredPath: google.maps.LatLng[];
  coveragePercentage: number;
  endPoint: google.maps.LatLng | null;
  gapMinutes: number;
}

export const usePlaylistCoverage = (
  directions: google.maps.DirectionsResult | null,
  playlistDurationMs: number | undefined,
  playlistId: string | undefined,
  tracks?: SpotifyTrack[] // Included to ensure recalculation if tracks change but duration stays same
) => {
  const [coverageData, setCoverageData] = useState<CoverageData | null>(null);

  useEffect(() => {
    // Clear coverage if no playlist is selected or no duration
    if (!directions || !playlistDurationMs || !playlistId) {
      setCoverageData(null);
      return;
    }

    const route = directions.routes[0];
    if (!route || !route.legs || route.legs.length === 0) return;

    const leg = route.legs[0];
    const routeDurationSeconds = leg.duration?.value;
    if (!routeDurationSeconds) return;

    const coveragePercentage = calculateCoveragePercentage(playlistDurationMs, routeDurationSeconds);
    
    // Decode polyline
    const encodedPolyline = route.overview_polyline;
    if (!encodedPolyline) return;
    
    const polylinePoints = decodePolyline(encodedPolyline);
    
    if (coveragePercentage < 1.0) {
      // Playlist is shorter than route - split the polyline
      const [coveredPath, uncoveredPath] = splitPolylineAtPercentage(polylinePoints, coveragePercentage);
      const endPoint = coveredPath[coveredPath.length - 1] || null;
      const gapSeconds = routeDurationSeconds * (1 - coveragePercentage);
      const gapMinutes = Math.ceil(gapSeconds / 60);
      
      setCoverageData({
        coveredPath,
        uncoveredPath,
        coveragePercentage,
        endPoint,
        gapMinutes
      });
    } else {
      // Playlist covers entire route or is longer
      setCoverageData({
        coveredPath: polylinePoints,
        uncoveredPath: [],
        coveragePercentage,
        endPoint: null,
        gapMinutes: 0
      });
    }
  }, [directions, playlistDurationMs, tracks, playlistId]);

  return coverageData;
};
