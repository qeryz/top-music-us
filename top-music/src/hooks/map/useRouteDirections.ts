import { useState, useEffect } from 'react';

interface RouteStats {
  distance: string;
  duration: string;
  durationSeconds: number;
}

export const useRouteDirections = (
  origin: { lat: number; lng: number } | null,
  destination: { lat: number; lng: number } | null
) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeStats, setRouteStats] = useState<RouteStats | null>(null);
  const [error, setError] = useState<string | null>(null);

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
          setError(null);
          
          // Extract Duration and Distance
          const route = result.routes[0];
          if (route && route.legs && route.legs.length > 0) {
            const leg = route.legs[0];
            setRouteStats({
                distance: leg.distance?.text || "Unknown",
                duration: leg.duration?.text || "Unknown",
                durationSeconds: leg.duration?.value || 0
            });
          }
        } else {
          console.error(`error fetching directions ${result}`);
          setError('Failed to fetch directions');
        }
      }
    );
  }, [origin, destination]);

  return { directions, routeStats, error };
};
