import { memo } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG } from '../../config/maps';
import { GeoLocation } from '../../types/drhmms';
import { Loader2 } from 'lucide-react';

interface MiniMapProps {
  location: GeoLocation;
  height?: number;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const MiniMapComponent = ({ location, height = 150 }: MiniMapProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
  });

  const center = {
    lat: location.latitude,
    lng: location.longitude,
  };

  // Fallback SVG map when no API key
  if (!GOOGLE_MAPS_CONFIG.apiKey) {
    return (
      <div className="relative bg-gradient-to-b from-green-100 to-green-50 rounded overflow-hidden" style={{ height }}>
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <defs>
            <pattern id="mini-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d1fae5" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="200" height="100" fill="url(#mini-grid)" />
          <line x1="100" y1="0" x2="100" y2="100" stroke="#10b981" strokeWidth="0.5" strokeDasharray="4 4" />
          <line x1="0" y1="50" x2="200" y2="50" stroke="#10b981" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="100" cy="50" r="8" fill="#dc2626" stroke="#fff" strokeWidth="2" />
          <circle cx="100" cy="50" r="16" fill="#dc2626" fillOpacity="0.2" />
        </svg>
        <div className="absolute bottom-1 left-1 text-[10px] text-green-700 bg-white/80 px-1.5 py-0.5 rounded">
          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded" style={{ height }}>
        <p className="text-xs text-gray-500">Map unavailable</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded" style={{ height }}>
        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={17}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: 'none',
          clickableIcons: false,
          styles: GOOGLE_MAPS_CONFIG.mapStyles,
        }}
      >
        <Marker
          position={center}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#dc2626',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
            scale: 10,
          }}
        />
      </GoogleMap>
    </div>
  );
};

export const MiniMap = memo(MiniMapComponent);
