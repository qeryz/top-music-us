import React, { useEffect, useState } from 'react';
import { GoogleMap, DirectionsRenderer, Marker, InfoWindow } from '@react-google-maps/api';
import type { SpotifyTrack } from '../services/spotify';
import { calculateTrackPositions, decodePolyline, interpolatePointAlongRoute, type TrackPosition } from '../utils/routeUtils';

interface RouteMapProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  onRouteStatsCalculated: (stats: { distance: string; duration: string }) => void;
  tracks?: SpotifyTrack[];
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

const RouteMap: React.FC<RouteMapProps> = ({ origin, destination, onRouteStatsCalculated, tracks }) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [trackPositions, setTrackPositions] = useState<TrackPosition[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<TrackPosition | null>(null);

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
                duration: leg.duration?.text || "Unknown"
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

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={origin}
      zoom={10}
      options={mapOptions}
    >
      {directions && (
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
