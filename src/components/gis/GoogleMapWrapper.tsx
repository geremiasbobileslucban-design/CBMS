import { useCallback, useState, memo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polygon, InfoWindow } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG, FLOOD_ZONES, LANDSLIDE_ZONES, BARANGAY_CENTERS } from '../../config/maps';
import { Household } from '../../types/cbms';
import { Loader2, MapPin, AlertTriangle, Home, Building2 } from 'lucide-react';

interface GoogleMapWrapperProps {
  households?: Household[];
  selectedHousehold?: Household | null;
  onHouseholdSelect?: (household: Household) => void;
  showFloodZones?: boolean;
  showLandslideZones?: boolean;
  showEvacuationCenters?: boolean;
  showHouseholds?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string | number;
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  children?: React.ReactNode;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Memoized map component to prevent unnecessary re-renders
const GoogleMapWrapperComponent = ({
  households = [],
  selectedHousehold,
  onHouseholdSelect,
  showFloodZones = false,
  showLandslideZones = false,
  showEvacuationCenters = false,
  showHouseholds = true,
  center = GOOGLE_MAPS_CONFIG.defaultCenter,
  zoom = GOOGLE_MAPS_CONFIG.defaultZoom,
  height = 500,
  mapType = 'roadmap',
  children,
}: GoogleMapWrapperProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Get household position - use actual GPS if available, otherwise approximate from barangay
  const getHouseholdPosition = (household: Household): { lat: number; lng: number } => {
    if (household.location) {
      return {
        lat: household.location.latitude,
        lng: household.location.longitude,
      };
    }
    // Fallback to barangay center with slight offset
    const barangayCenter = BARANGAY_CENTERS[household.barangay];
    if (barangayCenter) {
      // Add small random offset to prevent marker stacking
      const offset = (household.id.charCodeAt(0) % 10) * 0.001;
      return {
        lat: barangayCenter.lat + offset - 0.005,
        lng: barangayCenter.lng + offset - 0.005,
      };
    }
    return GOOGLE_MAPS_CONFIG.defaultCenter;
  };

  // Get marker icon based on risk level
  const getMarkerIcon = (household: Household) => {
    const color = household.disasterVulnerability === 'High'
      ? '#dc2626'
      : household.disasterVulnerability === 'Medium'
        ? '#f59e0b'
        : '#22c55e';

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.9,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: selectedHousehold?.id === household.id ? 12 : 8,
    };
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <div className="text-center p-6">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-medium">Failed to load Google Maps</p>
          <p className="text-sm text-gray-500 mt-1">Please check your API key configuration</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ height }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#143a63] animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!GOOGLE_MAPS_CONFIG.apiKey) {
    return (
      <div className="flex items-center justify-center bg-amber-50 border border-amber-200 rounded-lg" style={{ height }}>
        <div className="text-center p-6 max-w-md">
          <MapPin className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-700 font-medium">Google Maps API Key Required</p>
          <p className="text-sm text-amber-600 mt-2">
            To enable the map, create a <code className="bg-amber-100 px-1 rounded">.env</code> file with:
          </p>
          <pre className="text-xs bg-amber-100 p-2 rounded mt-2 text-left">
            VITE_GOOGLE_MAPS_API_KEY=your_key_here
          </pre>
          <p className="text-xs text-amber-500 mt-2">
            Get a key from <a href="https://console.cloud.google.com/" target="_blank" className="underline">Google Cloud Console</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border border-gray-200">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selectedHousehold ? getHouseholdPosition(selectedHousehold) : center}
        zoom={selectedHousehold ? GOOGLE_MAPS_CONFIG.householdZoom : zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        mapTypeId={mapType}
        options={{
          styles: GOOGLE_MAPS_CONFIG.mapStyles,
          streetViewControl: false,
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain'],
          },
          fullscreenControl: true,
          zoomControl: true,
        }}
      >
        {/* Flood Zones */}
        {showFloodZones && FLOOD_ZONES.map((zone, index) => (
          <Polygon
            key={`flood-${index}`}
            paths={zone}
            options={{
              fillColor: '#3b82f6',
              fillOpacity: 0.3,
              strokeColor: '#1d4ed8',
              strokeOpacity: 0.8,
              strokeWeight: 2,
            }}
          />
        ))}

        {/* Landslide Zones */}
        {showLandslideZones && LANDSLIDE_ZONES.map((zone, index) => (
          <Polygon
            key={`landslide-${index}`}
            paths={zone}
            options={{
              fillColor: '#ea580c',
              fillOpacity: 0.3,
              strokeColor: '#c2410c',
              strokeOpacity: 0.8,
              strokeWeight: 2,
            }}
          />
        ))}

        {/* Evacuation Centers */}
        {showEvacuationCenters && (
          <>
            {/* Import from config */}
            {[
              { name: 'San Jose City Gym', position: { lat: 15.7920, lng: 120.9905 }, capacity: 500 },
              { name: 'Caanawan Elementary School', position: { lat: 15.8150, lng: 120.9660 }, capacity: 200 },
              { name: 'Malasin Barangay Hall', position: { lat: 15.7710, lng: 121.0190 }, capacity: 150 },
            ].map((center, index) => (
              <Marker
                key={`evac-${index}`}
                position={center.position}
                icon={{
                  path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                  fillColor: '#059669',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  scale: 6,
                }}
                title={center.name}
                onClick={() => setActiveInfoWindow(`evac-${index}`)}
              >
                {activeInfoWindow === `evac-${index}` && (
                  <InfoWindow onCloseClick={() => setActiveInfoWindow(null)}>
                    <div className="p-1">
                      <p className="font-semibold text-sm">{center.name}</p>
                      <p className="text-xs text-gray-600">Capacity: {center.capacity}</p>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
          </>
        )}

        {/* Household Markers */}
        {showHouseholds && households.map((household) => (
          <Marker
            key={household.id}
            position={getHouseholdPosition(household)}
            icon={getMarkerIcon(household)}
            onClick={() => {
              onHouseholdSelect?.(household);
              setActiveInfoWindow(household.id);
            }}
            zIndex={selectedHousehold?.id === household.id ? 1000 : 1}
          >
            {activeInfoWindow === household.id && (
              <InfoWindow onCloseClick={() => setActiveInfoWindow(null)}>
                <div className="p-1 min-w-[180px]">
                  <p className="font-semibold text-sm text-gray-900">{household.headOfFamily}</p>
                  <p className="text-xs text-gray-500">{household.barangay}</p>
                  <p className="text-xs text-gray-500 font-mono">{household.householdNumber}</p>
                  <div className="flex gap-1 mt-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      household.disasterVulnerability === 'High' ? 'bg-red-100 text-red-700' :
                      household.disasterVulnerability === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {household.disasterVulnerability} Risk
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      household.povertyLevel === 'Non-Poor' ? 'bg-green-100 text-green-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {household.povertyLevel}
                    </span>
                  </div>
                  {household.location && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      GPS: {household.location.latitude.toFixed(5)}, {household.location.longitude.toFixed(5)}
                    </p>
                  )}
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {children}
      </GoogleMap>
    </div>
  );
};

export const GoogleMapWrapper = memo(GoogleMapWrapperComponent);
