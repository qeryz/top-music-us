import { useState, useEffect } from 'react';
import type { RouteStats } from '../../types';

export const useRouteDirections = (
  origin: { lat: number; lng: number } | null,
  destination: { lat: number; lng: number } | null,
  startDate?: string,
  startTime?: string
) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeStats, setRouteStats] = useState<RouteStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!origin || !destination) return;

    const directionsService = new google.maps.DirectionsService();

    let drivingOptions = undefined;
    if (startDate || startTime) {
      const departureTime = new Date();
      
      if (startDate) {
        const [year, month, day] = startDate.split('-').map(Number);
        departureTime.setFullYear(year, month - 1, day);
      }

      if (startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        departureTime.setHours(hours, minutes, 0, 0);
      }
      
      if (!startDate && startTime && departureTime < new Date()) {
        departureTime.setDate(departureTime.getDate() + 1);
      }
      
      // Ensure departure time is not in the past
      const now = new Date();
      now.setSeconds(now.getSeconds() + 10);
      const finalDepartureTime = departureTime < now ? now : departureTime;
      
      drivingOptions = {
        departureTime: finalDepartureTime,
        trafficModel: google.maps.TrafficModel.BEST_GUESS
      };
    }

    const request: google.maps.DirectionsRequest = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        ...(drivingOptions && { drivingOptions })
    };

    directionsService.route(
      request,
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
                duration: leg.duration_in_traffic?.text || leg.duration?.text || "Unknown",
                durationSeconds: leg.duration_in_traffic?.value || leg.duration?.value || 0
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
