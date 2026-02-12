import React, { useEffect, useState } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import type { SpotifyTrack } from '../services/spotify';
import CoverageRoute from './CoverageRoute';
import TrackMarkers from './TrackMarkers';
import { useRouteDirections } from '../hooks/map/useRouteDirections';
import { useTrackPositions } from '../hooks/map/useTrackPositions';
import { usePlaylistCoverage } from '../hooks/map/usePlaylistCoverage';

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
  const [mapKey, setMapKey] = useState(0);
  const [zoom, setZoom] = useState(10);
  const mapRef = React.useRef<google.maps.Map | null>(null);

  const { directions, routeStats } = useRouteDirections(origin, destination);
  const trackPositions = useTrackPositions(directions, tracks);
  const coverageData = usePlaylistCoverage(directions, playlistDurationMs, playlistId, tracks);

  // Update parent with route stats when they change
  useEffect(() => {
    if (routeStats) {
      onRouteStatsCalculated(routeStats);
    }
  }, [routeStats, onRouteStatsCalculated]);

  // Force map re-render when playlist changes to clear old polylines
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [playlistId]);

  const onMapLoad = React.useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onZoomChanged = React.useCallback(() => {
    if (mapRef.current) {
      const newZoom = mapRef.current.getZoom();
      if (newZoom !== undefined) {
        setZoom(newZoom);
      }
    }
  }, []);

  return (
    <GoogleMap
      key={`map-${mapKey}`}
      mapContainerStyle={containerStyle}
      center={origin}
      zoom={zoom}
      options={mapOptions}
      onLoad={onMapLoad}
      onZoomChanged={onZoomChanged}
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
      <TrackMarkers trackPositions={trackPositions} zoom={zoom} />

    </GoogleMap>
  );
};

export default RouteMap;
