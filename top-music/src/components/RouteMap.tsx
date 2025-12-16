import React, { useEffect, useState } from 'react';
import { GoogleMap, DirectionsRenderer, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import type { SpotifyTrack } from '../services/spotify';
import { calculateTrackPositions, decodePolyline, interpolatePointAlongRoute, splitPolylineAtPercentage, calculateCoveragePercentage, type TrackPosition } from '../utils/routeUtils';

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
  const [selectedTrack, setSelectedTrack] = useState<TrackPosition | null>(null);
  const [coverageData, setCoverageData] = useState<{
    coveredPath: google.maps.LatLng[];
    uncoveredPath: google.maps.LatLng[];
    coveragePercentage: number;
    endPoint: google.maps.LatLng | null;
    gapMinutes: number;
  } | null>(null);
  const [showCoverageInfo, setShowCoverageInfo] = useState(false);
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
        <React.Fragment key={`coverage-${playlistId}`}>
          {/* Hide default route markers but keep the route structure */}
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeOpacity: 0, // Hide the default polyline
              },
              markerOptions: {
                icon: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png"
              },
              suppressMarkers: false
            }}
          />

          {/* Covered portion - Green */}
          {coverageData.coveredPath.length > 0 && (
            <Polyline
              path={coverageData.coveredPath}
              options={{
                strokeColor: "#1ed760",
                strokeWeight: 6,
                strokeOpacity: 0.8,
                zIndex: 100
              }}
            />
          )}

          {/* Uncovered portion - Orange */}
          {coverageData.uncoveredPath.length > 0 && (
            <Polyline
              path={coverageData.uncoveredPath}
              options={{
                strokeColor: "#ff9500",
                strokeWeight: 6,
                strokeOpacity: 0.8,
                zIndex: 100
              }}
            />
          )}

          {/* End-of-playlist marker */}
          {coverageData.endPoint && (
            <Marker
              position={coverageData.endPoint}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#ff9500",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
              onClick={() => setShowCoverageInfo(true)}
              zIndex={2000}
            />
          )}

          {/* Coverage info window */}
          {showCoverageInfo && coverageData.endPoint && (
            <InfoWindow
              position={coverageData.endPoint}
              onCloseClick={() => setShowCoverageInfo(false)}
            >
              <div className="p-2">
                <h3 className="font-bold text-sm text-gray-900 mb-1">🎵 Playlist Ends Here</h3>
                <p className="text-xs text-gray-600">
                  {coverageData.gapMinutes} minute{coverageData.gapMinutes !== 1 ? 's' : ''} of trip remaining
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Coverage: {Math.round(coverageData.coveragePercentage * 100)}%
                </p>
              </div>
            </InfoWindow>
          )}
        </React.Fragment>
      )}

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
                  Plays at: {Math.floor(selectedTrack.cumulativeTimeMs / 60000)}:
                  {String(Math.floor((selectedTrack.cumulativeTimeMs % 60000) / 1000)).padStart(2, '0')}
                </p>
              </div>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default RouteMap;
