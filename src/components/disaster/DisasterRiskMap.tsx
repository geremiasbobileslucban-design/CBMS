import { useState, useCallback, memo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polygon, InfoWindow } from '@react-google-maps/api';
import { useData } from '../../context/DataContext';
import { GOOGLE_MAPS_CONFIG, BARANGAY_CENTERS, FLOOD_ZONES, LANDSLIDE_ZONES } from '../../config/maps';
import { RiskZone, Household } from '../../types/drhmms';
import { Loader2, MapPin, AlertTriangle, Building2 } from 'lucide-react';

interface DisasterRiskMapProps {
  selectedRiskType: 'all' | 'flood' | 'landslide' | 'fire' | 'earthquake';
  showEvacuationCenters: boolean;
  showHouseholds: boolean;
  onZoneSelect?: (zone: RiskZone | null) => void;
  height?: number;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Evacuation centers with coordinates
const EVACUATION_CENTER_COORDS = [
  { id: 'ec-1', name: 'San Jose City Gym', position: { lat: 15.7920, lng: 120.9905 }, capacity: 500, barangay: 'A. Pascual (Pob.)' },
  { id: 'ec-2', name: 'Caanawan Elementary School', position: { lat: 15.8150, lng: 120.9660 }, capacity: 200, barangay: 'Caanawan' },
  { id: 'ec-3', name: 'Malasin Barangay Hall', position: { lat: 15.7710, lng: 121.0190 }, capacity: 150, barangay: 'Malasin' },
  { id: 'ec-4', name: 'San Agustin Community Center', position: { lat: 15.7650, lng: 120.9850 }, capacity: 180, barangay: 'San Agustin' },
  { id: 'ec-5', name: 'Santo Nino Chapel Hall', position: { lat: 15.7450, lng: 120.9750 }, capacity: 120, barangay: 'Santo Nino 1st' },
];

// Fire risk zones (polygons around dense areas)
const FIRE_ZONES: google.maps.LatLngLiteral[][] = [
  [
    { lat: 15.7950, lng: 120.9870 },
    { lat: 15.7950, lng: 120.9940 },
    { lat: 15.7880, lng: 120.9940 },
    { lat: 15.7880, lng: 120.9870 },
  ],
];

// Earthquake risk zones (fault line areas)
const EARTHQUAKE_ZONES: google.maps.LatLngLiteral[][] = [
  [
    { lat: 15.8100, lng: 121.0100 },
    { lat: 15.8200, lng: 121.0300 },
    { lat: 15.7900, lng: 121.0400 },
    { lat: 15.7700, lng: 121.0250 },
    { lat: 15.7800, lng: 121.0100 },
  ],
  [
    { lat: 15.7500, lng: 120.9600 },
    { lat: 15.7600, lng: 120.9800 },
    { lat: 15.7400, lng: 120.9900 },
    { lat: 15.7300, lng: 120.9700 },
  ],
];

// Get risk color based on type and level
function getRiskColor(type: string, opacity: number = 0.4) {
  const colors: Record<string, string> = {
    flood: `rgba(59, 130, 246, ${opacity})`,
    landslide: `rgba(234, 88, 12, ${opacity})`,
    fire: `rgba(220, 38, 38, ${opacity})`,
    earthquake: `rgba(147, 51, 234, ${opacity})`,
  };
  return colors[type] || `rgba(107, 114, 128, ${opacity})`;
}

function getRiskStrokeColor(type: string) {
  const colors: Record<string, string> = {
    flood: '#1d4ed8',
    landslide: '#c2410c',
    fire: '#b91c1c',
    earthquake: '#7c3aed',
  };
  return colors[type] || '#6b7280';
}

const DisasterRiskMapComponent = ({
  selectedRiskType,
  showEvacuationCenters,
  showHouseholds,
  onZoneSelect,
  height = 500,
}: DisasterRiskMapProps) => {
  const { riskZones, evacuationCenters, households } = useData();
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);
  const [selectedZoneInfo, setSelectedZoneInfo] = useState<RiskZone | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Get household position
  const getHouseholdPosition = (household: Household): { lat: number; lng: number } => {
    if (household.location) {
      return {
        lat: household.location.latitude,
        lng: household.location.longitude,
      };
    }
    const barangayCenter = BARANGAY_CENTERS[household.barangay];
    if (barangayCenter) {
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
      scale: 7,
    };
  };

  // Handle zone click
  const handleZoneClick = (zone: RiskZone) => {
    setSelectedZoneInfo(zone);
    onZoneSelect?.(zone);
  };

  // Fallback SVG map when no API key
  if (!GOOGLE_MAPS_CONFIG.apiKey) {
    return <FallbackSVGMap
      selectedRiskType={selectedRiskType}
      showEvacuationCenters={showEvacuationCenters}
      showHouseholds={showHouseholds}
      onZoneSelect={onZoneSelect}
      height={height}
    />;
  }

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
          <p className="text-sm text-gray-600">Loading disaster risk map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div style={{ height }} className="rounded-lg overflow-hidden border border-gray-200">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={GOOGLE_MAPS_CONFIG.defaultCenter}
          zoom={GOOGLE_MAPS_CONFIG.defaultZoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            styles: GOOGLE_MAPS_CONFIG.mapStyles,
            streetViewControl: false,
            mapTypeControl: true,
            mapTypeControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT,
            },
            fullscreenControl: true,
            zoomControl: true,
          }}
        >
          {/* Flood Zones */}
          {(selectedRiskType === 'all' || selectedRiskType === 'flood') && FLOOD_ZONES.map((zone, index) => (
            <Polygon
              key={`flood-${index}`}
              paths={zone}
              options={{
                fillColor: '#3b82f6',
                fillOpacity: 0.35,
                strokeColor: '#1d4ed8',
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
              onClick={() => handleZoneClick({
                id: `flood-zone-${index}`,
                name: `Flood Zone ${index + 1}`,
                type: 'flood',
                riskLevel: 'High',
                description: 'Area prone to flooding during heavy rainfall',
                affectedBarangays: ['Caanawan', 'Abar 1st'],
                coordinates: zone,
              })}
            />
          ))}

          {/* Landslide Zones */}
          {(selectedRiskType === 'all' || selectedRiskType === 'landslide') && LANDSLIDE_ZONES.map((zone, index) => (
            <Polygon
              key={`landslide-${index}`}
              paths={zone}
              options={{
                fillColor: '#ea580c',
                fillOpacity: 0.35,
                strokeColor: '#c2410c',
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
              onClick={() => handleZoneClick({
                id: `landslide-zone-${index}`,
                name: `Landslide Zone ${index + 1}`,
                type: 'landslide',
                riskLevel: 'High',
                description: 'Elevated terrain with landslide susceptibility',
                affectedBarangays: ['Dizol', 'Tondod'],
                coordinates: zone,
              })}
            />
          ))}

          {/* Fire Zones */}
          {(selectedRiskType === 'all' || selectedRiskType === 'fire') && FIRE_ZONES.map((zone, index) => (
            <Polygon
              key={`fire-${index}`}
              paths={zone}
              options={{
                fillColor: '#dc2626',
                fillOpacity: 0.35,
                strokeColor: '#b91c1c',
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
              onClick={() => handleZoneClick({
                id: `fire-zone-${index}`,
                name: `Fire Risk Zone ${index + 1}`,
                type: 'fire',
                riskLevel: 'Medium',
                description: 'Dense residential area with fire risk',
                affectedBarangays: ['A. Pascual (Pob.)'],
                coordinates: zone,
              })}
            />
          ))}

          {/* Earthquake Zones */}
          {(selectedRiskType === 'all' || selectedRiskType === 'earthquake') && EARTHQUAKE_ZONES.map((zone, index) => (
            <Polygon
              key={`earthquake-${index}`}
              paths={zone}
              options={{
                fillColor: '#9333ea',
                fillOpacity: 0.35,
                strokeColor: '#7c3aed',
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
              onClick={() => handleZoneClick({
                id: `earthquake-zone-${index}`,
                name: `Earthquake Risk Zone ${index + 1}`,
                type: 'earthquake',
                riskLevel: 'Medium',
                description: 'Area near fault line with seismic activity risk',
                affectedBarangays: ['Malasin', 'Dizol'],
                coordinates: zone,
              })}
            />
          ))}

          {/* Evacuation Centers */}
          {showEvacuationCenters && EVACUATION_CENTER_COORDS.map((center) => (
            <Marker
              key={center.id}
              position={center.position}
              icon={{
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                fillColor: '#059669',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 7,
              }}
              title={center.name}
              onClick={() => setActiveInfoWindow(center.id)}
            >
              {activeInfoWindow === center.id && (
                <InfoWindow onCloseClick={() => setActiveInfoWindow(null)}>
                  <div className="p-1">
                    <p className="font-semibold text-sm flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      {center.name}
                    </p>
                    <p className="text-xs text-gray-500">{center.barangay}</p>
                    <p className="text-xs text-gray-600 mt-1">Capacity: {center.capacity} people</p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}

          {/* Household Markers */}
          {showHouseholds && households.map((household) => (
            <Marker
              key={household.id}
              position={getHouseholdPosition(household)}
              icon={getMarkerIcon(household)}
              onClick={() => setActiveInfoWindow(household.id)}
            >
              {activeInfoWindow === household.id && (
                <InfoWindow onCloseClick={() => setActiveInfoWindow(null)}>
                  <div className="p-1 min-w-[200px]">
                    <p className="font-semibold text-sm text-gray-900">{household.headOfFamily}</p>
                    <p className="text-xs text-gray-500 mb-2">{household.barangay}</p>

                    {/* Individual Risk Levels */}
                    {household.disasterRisk && (
                      <div className="space-y-1 border-t border-gray-100 pt-2">
                        <p className="text-[10px] font-semibold text-gray-600 uppercase">Risk Assessment</p>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span className="text-[10px] text-gray-600">Flood:</span>
                            <span className={`text-[10px] font-medium ${
                              household.disasterRisk.floodRisk === 'Critical' ? 'text-red-600' :
                              household.disasterRisk.floodRisk === 'High' ? 'text-red-500' :
                              household.disasterRisk.floodRisk === 'Medium' ? 'text-amber-500' : 'text-green-500'
                            }`}>{household.disasterRisk.floodRisk}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-[10px] text-gray-600">Landslide:</span>
                            <span className={`text-[10px] font-medium ${
                              household.disasterRisk.landslideRisk === 'Critical' ? 'text-red-600' :
                              household.disasterRisk.landslideRisk === 'High' ? 'text-red-500' :
                              household.disasterRisk.landslideRisk === 'Medium' ? 'text-amber-500' : 'text-green-500'
                            }`}>{household.disasterRisk.landslideRisk}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            <span className="text-[10px] text-gray-600">Earthquake:</span>
                            <span className={`text-[10px] font-medium ${
                              household.disasterRisk.earthquakeRisk === 'Critical' ? 'text-red-600' :
                              household.disasterRisk.earthquakeRisk === 'High' ? 'text-red-500' :
                              household.disasterRisk.earthquakeRisk === 'Medium' ? 'text-amber-500' : 'text-green-500'
                            }`}>{household.disasterRisk.earthquakeRisk}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-[10px] text-gray-600">Fire:</span>
                            <span className={`text-[10px] font-medium ${
                              household.disasterRisk.fireRisk === 'Critical' ? 'text-red-600' :
                              household.disasterRisk.fireRisk === 'High' ? 'text-red-500' :
                              household.disasterRisk.fireRisk === 'Medium' ? 'text-amber-500' : 'text-green-500'
                            }`}>{household.disasterRisk.fireRisk}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {household.vulnerableMembers && household.vulnerableMembers.length > 0 && (
                      <p className="text-[10px] text-gray-500 mt-2 pt-1 border-t border-gray-100">
                        {household.vulnerableMembers.length} vulnerable member(s)
                      </p>
                    )}
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </div>

      {/* Selected zone info overlay */}
      {selectedZoneInfo && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs z-10">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-sm text-gray-900">{selectedZoneInfo.name}</h4>
            <button
              onClick={() => setSelectedZoneInfo(null)}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          </div>
          <div className="mt-2">
            <span className={`inline-block px-2 py-0.5 rounded text-white text-xs ${
              selectedZoneInfo.type === 'flood' ? 'bg-blue-500' :
              selectedZoneInfo.type === 'landslide' ? 'bg-orange-500' :
              selectedZoneInfo.type === 'fire' ? 'bg-red-500' : 'bg-purple-500'
            }`}>
              {selectedZoneInfo.type}
            </span>
            <span className="text-xs text-gray-600 ml-2">{selectedZoneInfo.riskLevel} Risk</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{selectedZoneInfo.description}</p>
          {selectedZoneInfo.affectedBarangays && (
            <p className="text-xs text-gray-400 mt-1">
              Affects: {selectedZoneInfo.affectedBarangays.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
        <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Risk Zones</p>
        <div className="space-y-1.5">
          {(selectedRiskType === 'all' || selectedRiskType === 'flood') && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-blue-500 opacity-60" />
              <span className="text-xs text-gray-600">Flood Zone</span>
            </div>
          )}
          {(selectedRiskType === 'all' || selectedRiskType === 'landslide') && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-orange-500 opacity-60" />
              <span className="text-xs text-gray-600">Landslide Zone</span>
            </div>
          )}
          {(selectedRiskType === 'all' || selectedRiskType === 'fire') && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-red-500 opacity-60" />
              <span className="text-xs text-gray-600">Fire Risk Zone</span>
            </div>
          )}
          {(selectedRiskType === 'all' || selectedRiskType === 'earthquake') && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-purple-500 opacity-60" />
              <span className="text-xs text-gray-600">Earthquake Zone</span>
            </div>
          )}
          {showEvacuationCenters && (
            <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span className="text-xs text-gray-600">Evacuation Center</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Fallback SVG Map (original implementation for when Google Maps API is not available)
function FallbackSVGMap({
  selectedRiskType,
  showEvacuationCenters,
  showHouseholds,
  onZoneSelect,
  height
}: DisasterRiskMapProps) {
  const { riskZones, evacuationCenters, households } = useData();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Map region coordinates
  const SJC_REGIONS = [
    { id: 'POB', label: 'Poblacion', short: 'POB', points: '430,270 500,235 590,235 640,310 600,400 470,400 400,355' },
    { id: 'NW', label: 'Caanawan / Abar', short: 'NW', points: '140,200 280,120 440,160 420,270 250,290 60,260' },
    { id: 'NWO', label: 'Calaocan', short: 'CAL', points: '250,290 420,270 400,355 220,360 130,330' },
    { id: 'N', label: 'Kaliwanagan / Bagong Sikat', short: 'N', points: '440,160 580,50 700,80 660,150 590,235 500,235' },
    { id: 'NE', label: 'Sibut / Tondod', short: 'NE', points: '700,80 820,140 850,250 720,270 660,150' },
    { id: 'NEO', label: 'Dizol', short: 'DIZ', points: '820,140 900,230 870,350 770,330 850,250' },
    { id: 'WMID', label: 'Santo Tomas', short: 'STO', points: '60,260 250,290 220,360 130,420 70,360' },
    { id: 'WS', label: 'Villa Marina', short: 'VM', points: '130,420 220,360 240,460 130,470' },
    { id: 'EMID', label: 'Malasin / Kita-Kita', short: 'MAL', points: '720,270 850,250 870,350 820,440 660,420 600,400 640,310' },
    { id: 'EOUT', label: 'Manicla', short: 'MAN', points: '870,350 940,330 920,430 870,510 820,440' },
    { id: 'CMID', label: 'San Agustin / Palestina', short: 'SAG', points: '400,355 470,400 600,400 660,420 620,510 440,500 360,460 220,360' },
    { id: 'SW', label: 'Tayabo / San Juan', short: 'TAY', points: '130,470 240,460 360,460 320,575 220,540' },
    { id: 'S', label: 'Santo Nino', short: 'SN', points: '360,460 440,500 460,590 320,575' },
    { id: 'SE', label: 'Sinipit / Soledad', short: 'SOL', points: '440,500 620,510 760,560 600,580 460,590' },
  ];

  const SJC_LABELS: Record<string, [number, number]> = {
    'POB': [520, 320], 'NW': [270, 200], 'NWO': [310, 320], 'N': [560, 150],
    'NE': [760, 200], 'NEO': [860, 280], 'WMID': [150, 320], 'WS': [180, 415],
    'EMID': [770, 350], 'EOUT': [890, 410], 'CMID': [490, 450], 'SW': [240, 510],
    'S': [400, 535], 'SE': [560, 545],
  };

  const SJC_OUTLINE = '140,200 280,120 440,70 580,50 700,80 820,140 900,230 940,330 920,430 870,510 760,560 600,580 460,590 320,575 220,540 130,470 70,360 60,260';

  const RISK_ZONE_REGIONS: Record<string, string[]> = {
    'rz-1': ['NW', 'NWO'],
    'rz-2': ['NEO', 'NE', 'EOUT'],
    'rz-3': ['EMID'],
    'rz-4': ['POB'],
    'rz-5': ['S', 'SW'],
    'rz-6': ['WMID', 'WS'],
  };

  function riskColor(riskLevel: string, type: string) {
    const colors = {
      flood: { 'Very High': '#1e3a8a', 'High': '#3b82f6', 'Medium': '#93c5fd', 'Low': '#dbeafe' },
      landslide: { 'Very High': '#7c2d12', 'High': '#ea580c', 'Medium': '#fdba74', 'Low': '#ffedd5' },
      fire: { 'Very High': '#7f1d1d', 'High': '#dc2626', 'Medium': '#fca5a5', 'Low': '#fee2e2' },
      earthquake: { 'Very High': '#581c87', 'High': '#9333ea', 'Medium': '#d8b4fe', 'Low': '#f3e8ff' },
    };
    return colors[type as keyof typeof colors]?.[riskLevel as keyof (typeof colors)['flood']] || '#e5e7eb';
  }

  const getRegionRisk = (regionId: string) => {
    const affectingZones = riskZones.filter(zone => {
      const regions = RISK_ZONE_REGIONS[zone.id] || [];
      return regions.includes(regionId);
    });
    if (selectedRiskType !== 'all') {
      return affectingZones.filter(z => z.type === selectedRiskType);
    }
    return affectingZones;
  };

  const getRegionColor = (regionId: string) => {
    const zones = getRegionRisk(regionId);
    if (zones.length === 0) return { fill: '#f0f9ff', stroke: '#94a3b8' };
    const riskOrder = ['Very High', 'High', 'Medium', 'Low'];
    zones.sort((a, b) => riskOrder.indexOf(a.riskLevel) - riskOrder.indexOf(b.riskLevel));
    const highestRisk = zones[0];
    return {
      fill: riskColor(highestRisk.riskLevel, highestRisk.type),
      stroke: highestRisk.riskLevel === 'Very High' || highestRisk.riskLevel === 'High' ? '#1f2937' : '#6b7280',
    };
  };

  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(selectedRegion === regionId ? null : regionId);
    const zones = getRegionRisk(regionId);
    onZoneSelect?.(zones.length > 0 ? zones[0] : null);
  };

  return (
    <div className="relative">
      <div className="absolute top-2 left-2 bg-amber-50 border border-amber-200 rounded px-2 py-1 z-10">
        <p className="text-xs text-amber-700">SVG Map (Configure Google Maps API for enhanced view)</p>
      </div>
      <svg viewBox="0 0 1000 640" className="w-full h-auto" style={{ maxHeight: height }}>
        <defs>
          <pattern id="riskgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e6e9ee" strokeWidth="0.5" />
          </pattern>
        </defs>

        <rect width="1000" height="640" fill="#f8fafc" />
        <rect width="1000" height="640" fill="url(#riskgrid)" opacity="0.4" />

        <g fontFamily="Public Sans, sans-serif" fontSize="11" fill="#64748b" letterSpacing="0.12em">
          <text x="540" y="22" textAnchor="middle">LUPAO</text>
          <text x="970" y="320" textAnchor="end">CARRANGLAN</text>
          <text x="520" y="630" textAnchor="middle">QUEZON</text>
          <text x="22" y="320" textAnchor="start">MUNOZ</text>
        </g>

        <polygon points={SJC_OUTLINE} fill="#fff" stroke="#475569" strokeWidth="2" opacity="0.95" />

        {SJC_REGIONS.map(r => {
          const col = getRegionColor(r.id);
          const isHovered = hoveredRegion === r.id;
          const isSelected = selectedRegion === r.id;

          return (
            <g
              key={r.id}
              style={{ cursor: 'pointer' }}
              onClick={() => handleRegionClick(r.id)}
              onMouseEnter={() => setHoveredRegion(r.id)}
              onMouseLeave={() => setHoveredRegion(null)}
            >
              <polygon
                points={r.points}
                fill={col.fill}
                stroke={isSelected ? '#0f172a' : isHovered ? '#334155' : col.stroke}
                strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                opacity={isSelected || isHovered ? 1 : 0.85}
              />
            </g>
          );
        })}

        <path d="M 460 600 Q 500 460 520 320 Q 540 180 580 70" fill="none" stroke="#334155" strokeWidth="5" opacity="0.7" strokeLinecap="round" />
        <path d="M 460 600 Q 500 460 520 320 Q 540 180 580 70" fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="8 5" />

        {showEvacuationCenters && evacuationCenters.map(ec => {
          const positions: Record<string, [number, number]> = {
            'A. Pascual (Pob.)': [510, 295],
            'Crisanto Sanchez (Pob.)': [550, 340],
            'Caanawan': [280, 180],
            'Malasin': [780, 380],
            'San Agustin': [520, 460],
            'Sibut': [750, 180],
            'Santo Nino 1st': [380, 520],
            'Tayabo': [250, 500],
          };
          const pos = positions[ec.barangay];
          if (!pos) return null;

          return (
            <g key={ec.id} transform={`translate(${pos[0]}, ${pos[1]})`}>
              <circle r="12" fill="#059669" stroke="#fff" strokeWidth="2" />
              <path d="M-5,-3 L0,-8 L5,-3 L5,5 L-5,5 Z" fill="#fff" />
              <title>{ec.name} - Capacity: {ec.capacity}</title>
            </g>
          );
        })}

        {showHouseholds && households.slice(0, 20).map((h, i) => {
          const x = 200 + (i % 5) * 150 + Math.random() * 50;
          const y = 200 + Math.floor(i / 5) * 100 + Math.random() * 50;
          const rColor = h.disasterVulnerability === 'High' ? '#dc2626' :
            h.disasterVulnerability === 'Medium' ? '#f59e0b' : '#22c55e';

          return (
            <circle
              key={h.id}
              cx={x}
              cy={y}
              r="4"
              fill={rColor}
              stroke="#fff"
              strokeWidth="1"
              opacity="0.8"
            >
              <title>{h.headOfFamily} - {h.disasterVulnerability} Risk</title>
            </circle>
          );
        })}

        {SJC_REGIONS.map(r => {
          const [x, y] = SJC_LABELS[r.id] || [500, 320];
          const zones = getRegionRisk(r.id);
          const hasRisk = zones.length > 0;

          return (
            <g key={r.id + '-l'} pointerEvents="none">
              <text
                x={x}
                y={y}
                fontFamily="Public Sans, sans-serif"
                fontSize="11"
                fontWeight="600"
                fill={hasRisk ? '#1f2937' : '#64748b'}
                textAnchor="middle"
              >
                {r.short}
              </text>
              {hasRisk && (
                <text
                  x={x}
                  y={y + 14}
                  fontFamily="Public Sans, sans-serif"
                  fontSize="9"
                  fill="#374151"
                  textAnchor="middle"
                >
                  {zones[0].riskLevel}
                </text>
              )}
            </g>
          );
        })}

        <g transform="translate(60, 60)">
          <circle r="22" fill="#fff" stroke="#64748b" />
          <path d="M 0 -14 L 5 0 L 0 14 L -5 0 Z" fill="#334155" />
          <text y="-26" textAnchor="middle" fontSize="10" fontFamily="Public Sans, sans-serif" fill="#64748b" fontWeight="600">N</text>
        </g>

        <g transform="translate(60, 540)">
          <text fontSize="10" fontWeight="600" fill="#374151" fontFamily="Public Sans, sans-serif">RISK LEGEND</text>
          <g transform="translate(0, 16)">
            {[
              { label: 'Flood Zone', color: '#3b82f6' },
              { label: 'Landslide', color: '#ea580c' },
              { label: 'Fire Risk', color: '#dc2626' },
              { label: 'Evac Center', color: '#059669' },
            ].map((item, i) => (
              <g key={item.label} transform={`translate(${i * 100}, 0)`}>
                <rect width="12" height="12" fill={item.color} rx="2" />
                <text x="16" y="10" fontSize="9" fill="#64748b" fontFamily="Public Sans, sans-serif">{item.label}</text>
              </g>
            ))}
          </g>
        </g>
      </svg>

      {selectedRegion && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
          <h4 className="font-semibold text-sm text-gray-900">
            {SJC_REGIONS.find(r => r.id === selectedRegion)?.label}
          </h4>
          {getRegionRisk(selectedRegion).map(zone => (
            <div key={zone.id} className="mt-2 text-xs">
              <span className={`inline-block px-2 py-0.5 rounded text-white mr-2 ${
                zone.type === 'flood' ? 'bg-blue-500' :
                zone.type === 'landslide' ? 'bg-orange-500' :
                zone.type === 'fire' ? 'bg-red-500' : 'bg-purple-500'
              }`}>
                {zone.type}
              </span>
              <span className="text-gray-600">{zone.riskLevel} Risk</span>
              <p className="text-gray-500 mt-1">{zone.description}</p>
            </div>
          ))}
          {getRegionRisk(selectedRegion).length === 0 && (
            <p className="text-xs text-gray-500 mt-1">No significant risk zones identified</p>
          )}
        </div>
      )}
    </div>
  );
}

export const DisasterRiskMap = memo(DisasterRiskMapComponent);
