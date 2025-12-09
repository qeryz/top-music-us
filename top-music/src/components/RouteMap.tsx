import React, { useEffect, useState } from 'react';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';

interface RouteMapProps {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  onRouteStatsCalculated: (stats: { distance: string; duration: string }) => void;
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

const RouteMap: React.FC<RouteMapProps> = ({ origin, destination, onRouteStatsCalculated }) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

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
              strokeColor: "#4986e8ff",
              strokeWeight: 6,
              strokeOpacity: 0.7,
            },
            markerOptions: {
              icon: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png"
            }
          }}
        />
      )}
    </GoogleMap>
  );
};

export default RouteMap;
