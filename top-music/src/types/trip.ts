import type { SpotifyTrack } from './spotify';

export interface RouteStats {
  distance: string;
  duration: string;
  durationSeconds: number;
}

export interface TripLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface TrackPosition {
    track: SpotifyTrack;
    cumulativeTimeMs: number;
    percentageAlongRoute: number;
    position?: google.maps.LatLng;
}

export interface CoverageData {
  coveredPath: google.maps.LatLng[];
  uncoveredPath: google.maps.LatLng[];
  coveragePercentage: number;
  endPoint: google.maps.LatLng | null;
  gapMinutes: number;
}
