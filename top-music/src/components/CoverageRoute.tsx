import React, { useState } from 'react';
import { DirectionsRenderer, Polyline, Marker, InfoWindow } from '@react-google-maps/api';

interface CoverageData {
  coveredPath: google.maps.LatLng[];
  uncoveredPath: google.maps.LatLng[];
  coveragePercentage: number;
  endPoint: google.maps.LatLng | null;
  gapMinutes: number;
}

interface CoverageRouteProps {
  directions: google.maps.DirectionsResult;
  coverageData: CoverageData;
  playlistId: string;
}

const CoverageRoute: React.FC<CoverageRouteProps> = ({ directions, coverageData, playlistId }) => {
  const [showCoverageInfo, setShowCoverageInfo] = useState(false);

  return (
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
  );
};

export default CoverageRoute;
