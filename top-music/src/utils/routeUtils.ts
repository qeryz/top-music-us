import type { SpotifyTrack } from '../services/spotify';

export interface TrackPosition {
    track: SpotifyTrack;
    cumulativeTimeMs: number;
    percentageAlongRoute: number;
    position?: google.maps.LatLng;
}

/**
 * Calculates the cumulative time and percentage along route for each track
 */
export const calculateTrackPositions = (
    tracks: SpotifyTrack[],
    routeDurationSeconds: number
): TrackPosition[] => {
    const routeDurationMs = routeDurationSeconds * 1000;
    let cumulativeMs = 0;

    return tracks.map(track => {
        const position: TrackPosition = {
            track,
            cumulativeTimeMs: cumulativeMs,
            percentageAlongRoute: cumulativeMs / routeDurationMs,
        };

        cumulativeMs += track.duration_ms;

        // Only include tracks that start before the route ends
        return position;
    }).filter(pos => pos.percentageAlongRoute <= 1.0);
};

/**
 * Decodes a Google Maps encoded polyline string to an array of LatLng points
 * Based on Google's polyline encoding algorithm
 */
export const decodePolyline = (encoded: string): google.maps.LatLng[] => {
    const points: google.maps.LatLng[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
        let b;
        let shift = 0;
        let result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;

        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push(new google.maps.LatLng(lat / 1e5, lng / 1e5));
    }

    return points;
};

/**
 * Interpolates a point along a route at a given percentage (0.0 to 1.0)
 */
export const interpolatePointAlongRoute = (
    polylinePoints: google.maps.LatLng[],
    percentage: number
): google.maps.LatLng | null => {
    if (polylinePoints.length === 0) return null;
    if (percentage <= 0) return polylinePoints[0];
    if (percentage >= 1) return polylinePoints[polylinePoints.length - 1];

    // Calculate total distance
    let totalDistance = 0;
    const distances: number[] = [0];

    for (let i = 1; i < polylinePoints.length; i++) {
        const dist = google.maps.geometry.spherical.computeDistanceBetween(
            polylinePoints[i - 1],
            polylinePoints[i]
        );
        totalDistance += dist;
        distances.push(totalDistance);
    }

    // Find the target distance
    const targetDistance = totalDistance * percentage;

    // Find the segment containing the target distance
    for (let i = 1; i < distances.length; i++) {
        if (distances[i] >= targetDistance) {
            const segmentStart = polylinePoints[i - 1];
            const segmentEnd = polylinePoints[i];
            const segmentDistance = distances[i] - distances[i - 1];
            const distanceIntoSegment = targetDistance - distances[i - 1];
            const segmentPercentage = distanceIntoSegment / segmentDistance;

            // Interpolate between the two points
            const lat = segmentStart.lat() + (segmentEnd.lat() - segmentStart.lat()) * segmentPercentage;
            const lng = segmentStart.lng() + (segmentEnd.lng() - segmentStart.lng()) * segmentPercentage;

            return new google.maps.LatLng(lat, lng);
        }
    }

    return polylinePoints[polylinePoints.length - 1];
};

/**
 * Calculates the total duration of a playlist in milliseconds
 */
export const calculatePlaylistDuration = (tracks: SpotifyTrack[]): number => {
    return tracks.reduce((total, track) => total + track.duration_ms, 0);
};

/**
 * Calculates what percentage of the route is covered by the playlist
 * Returns a value between 0.0 and 1.0 (or > 1.0 if playlist is longer than route)
 */
export const calculateCoveragePercentage = (
    playlistDurationMs: number,
    routeDurationSeconds: number
): number => {
    const routeDurationMs = routeDurationSeconds * 1000;
    return playlistDurationMs / routeDurationMs;
};

/**
 * Splits a polyline into two segments at a given percentage point
 * Returns [coveredSegment, uncoveredSegment]
 */
export const splitPolylineAtPercentage = (
    polylinePoints: google.maps.LatLng[],
    percentage: number
): [google.maps.LatLng[], google.maps.LatLng[]] => {
    if (percentage <= 0) {
        return [[], polylinePoints];
    }
    if (percentage >= 1) {
        return [polylinePoints, []];
    }

    // Calculate total distance
    let totalDistance = 0;
    const distances: number[] = [0];

    for (let i = 1; i < polylinePoints.length; i++) {
        const dist = google.maps.geometry.spherical.computeDistanceBetween(
            polylinePoints[i - 1],
            polylinePoints[i]
        );
        totalDistance += dist;
        distances.push(totalDistance);
    }

    const targetDistance = totalDistance * percentage;

    // Find the segment containing the split point
    for (let i = 1; i < distances.length; i++) {
        if (distances[i] >= targetDistance) {
            const segmentStart = polylinePoints[i - 1];
            const segmentEnd = polylinePoints[i];
            const segmentDistance = distances[i] - distances[i - 1];
            const distanceIntoSegment = targetDistance - distances[i - 1];
            const segmentPercentage = distanceIntoSegment / segmentDistance;

            // Calculate the split point
            const lat = segmentStart.lat() + (segmentEnd.lat() - segmentStart.lat()) * segmentPercentage;
            const lng = segmentStart.lng() + (segmentEnd.lng() - segmentStart.lng()) * segmentPercentage;
            const splitPoint = new google.maps.LatLng(lat, lng);

            // Build the two segments
            const coveredSegment = [...polylinePoints.slice(0, i), splitPoint];
            const uncoveredSegment = [splitPoint, ...polylinePoints.slice(i)];

            return [coveredSegment, uncoveredSegment];
        }
    }

    // Fallback (shouldn't reach here)
    return [polylinePoints, []];
};

