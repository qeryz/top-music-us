import React, { useEffect, useState } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import type { SpotifyTrack } from '../services/spotify';
import { calculateTrackPositions, decodePolyline, interpolatePointAlongRoute, splitPolylineAtPercentage, calculateCoveragePercentage, type TrackPosition } from '../utils/routeUtils';
import CoverageRoute from './CoverageRoute';
import TrackMarkers from './TrackMarkers';

interface RouteMapProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  onRouteStatsCalculated: (stats: { distance: string; duration: string; durationSeconds: number }) => void;
  tracks?: SpotifyTrack[];
  playlistDurationMs?: number; // Total duration of the playlist in milliseconds
  playlistId?: string; // Unique playlist identifier to force re-render on playlist change
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  gestureHandling: 'greedy',
  mapId: "2d38b57f5cf31bb91d4dacb2",
  colorScheme: "DARK"
};

const RouteMap: React.FC<RouteMapProps> = ({ origin, destination, onRouteStatsCalculated, tracks, playlistDurationMs, playlistId }) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [trackPositions, setTrackPositions] = useState<TrackPosition[]>([]);
  const [coverageData, setCoverageData] = useState<{
    coveredPath: google.maps.LatLng[];
    uncoveredPath: google.maps.LatLng[];
    coveragePercentage: number;
    endPoint: google.maps.LatLng | null;
    gapMinutes: number;
  } | null>(null);
  const [mapKey, setMapKey] = useState(0);

  // Force map re-render when playlist changes to clear old polylines
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [playlistId]);

  // Fetch route directions (only when origin/destination changes)
  useEffect(() => {
    if (!origin || !destination) return;

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          
          // Extract Duration and Distance
          const route = result.routes[0];
          if (route && route.legs && route.legs.length > 0) {
            const leg = route.legs[0];
            onRouteStatsCalculated({
                distance: leg.distance?.text || "Unknown",
                duration: leg.duration?.text || "Unknown",
                durationSeconds: leg.duration?.value || 0
            });
          }
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  }, [origin, destination, onRouteStatsCalculated]);

  // Calculate track positions when tracks or directions change
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

  // Calculate coverage visualization when playlist duration or directions change
  useEffect(() => {
    console.log('[RouteMap] Coverage effect triggered:', { 
      hasDirections: !!directions, 
      playlistDurationMs, 
      tracksCount: tracks?.length,
      playlistId
    });
    
    // Clear coverage if no playlist is selected or no duration
    if (!directions || !playlistDurationMs || !playlistId) {
      console.log('[RouteMap] Clearing coverage data - missing directions, duration, or playlistId');
      setCoverageData(null);
      return;
    }

    const route = directions.routes[0];
    if (!route || !route.legs || route.legs.length === 0) return;

    const leg = route.legs[0];
    const routeDurationSeconds = leg.duration?.value;
    if (!routeDurationSeconds) return;

    const coveragePercentage = calculateCoveragePercentage(playlistDurationMs, routeDurationSeconds);
    console.log('[RouteMap] Coverage calculation:', { playlistDurationMs, routeDurationSeconds, coveragePercentage });
    
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

  // Cleanup effect: explicitly clear coverage when playlist is deselected
  useEffect(() => {
    if (!playlistId && coverageData) {
      console.log('[RouteMap] Playlist deselected - clearing coverage data');
      setCoverageData(null);
    }
  }, [playlistId, coverageData]);

  return (
    <GoogleMap
      key={`map-${mapKey}`}
      mapContainerStyle={containerStyle}
      center={origin}
      zoom={10}
      options={mapOptions}
    >
      {/* Render route - either default or dual-color based on coverage */}
      {directions && !coverageData && (
        <DirectionsRenderer
          directions={directions}
          options={{
            polylineOptions: {
              strokeColor: "#35a4ffff",
              strokeWeight: 6,
              strokeOpacity: 0.7,
            },
            markerOptions: {
              icon: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png"
            }
          }}
        />
      )}

      {/* Dual-color route when playlist coverage is calculated */}
      {directions && coverageData && playlistId && (
        <CoverageRoute 
          directions={directions}
          coverageData={coverageData}
          playlistId={playlistId}
        />
      )}

      {/* Track Markers */}
      <TrackMarkers trackPositions={trackPositions} />

    </GoogleMap>
  );
};

export default RouteMap;
