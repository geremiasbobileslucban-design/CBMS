import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { GoogleMapWrapper } from './GoogleMapWrapper';
import { LayerToggle, defaultMapLayers, MapLayer } from './LayerToggle';
import { Household } from '../../types/cbms';
import { GOOGLE_MAPS_CONFIG } from '../../config/maps';

interface InteractiveMapProps {
  selectedHousehold?: Household | null;
  onHouseholdSelect?: (household: Household) => void;
  height?: number;
  showControls?: boolean;
}

export function InteractiveMap({
  selectedHousehold,
  onHouseholdSelect,
  height = 500,
  showControls = true,
}: InteractiveMapProps) {
  const { households } = useData();
  const [layers, setLayers] = useState<MapLayer[]>(defaultMapLayers);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');

  const isLayerEnabled = (layerId: string) => layers.find(l => l.id === layerId)?.enabled ?? false;

  const handleLayerChange = (layerId: string, enabled: boolean) => {
    setLayers(layers.map(l => l.id === layerId ? { ...l, enabled } : l));
  };

  // Filter households based on layers
  const visibleHouseholds = households.filter(h => {
    if (!isLayerEnabled('households') && !isLayerEnabled('highRisk')) return false;
    if (isLayerEnabled('highRisk') && !isLayerEnabled('households')) {
      return h.disasterVulnerability === 'High';
    }
    return true;
  });

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Map Container */}
        <div className="flex-1 relative">
          <GoogleMapWrapper
            households={visibleHouseholds}
            selectedHousehold={selectedHousehold}
            onHouseholdSelect={onHouseholdSelect}
            showFloodZones={isLayerEnabled('flood')}
            showLandslideZones={isLayerEnabled('landslide')}
            showEvacuationCenters={isLayerEnabled('evacuation')}
            showHouseholds={isLayerEnabled('households') || isLayerEnabled('highRisk')}
            height={height}
            mapType={mapType}
          />
        </div>

        {/* Layer Controls */}
        {showControls && (
          <div className="lg:w-52 border-t lg:border-t-0 lg:border-l border-gray-200 p-3 bg-gray-50">
            <LayerToggle
              layers={layers}
              onChange={handleLayerChange}
              className="shadow-none border-0 bg-transparent p-0"
            />

            {/* Map Type Selector */}
            {GOOGLE_MAPS_CONFIG.apiKey && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Map Type</p>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: 'roadmap', label: 'Road' },
                    { id: 'satellite', label: 'Satellite' },
                    { id: 'hybrid', label: 'Hybrid' },
                    { id: 'terrain', label: 'Terrain' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setMapType(type.id as typeof mapType)}
                      className={`px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                        mapType === type.id
                          ? 'bg-[#143a63] text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Risk Levels</p>
              <div className="space-y-1.5">
                {[
                  { label: 'High Risk', color: '#dc2626' },
                  { label: 'Medium Risk', color: '#f59e0b' },
                  { label: 'Low Risk', color: '#22c55e' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>

              {(isLayerEnabled('flood') || isLayerEnabled('landslide')) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Hazard Zones</p>
                  <div className="space-y-1.5">
                    {isLayerEnabled('flood') && (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm bg-blue-500 opacity-50" />
                        <span className="text-xs text-gray-600">Flood Zone</span>
                      </div>
                    )}
                    {isLayerEnabled('landslide') && (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm bg-orange-500 opacity-50" />
                        <span className="text-xs text-gray-600">Landslide Zone</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isLayerEnabled('evacuation') && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-600" />
                    <span className="text-xs text-gray-600">Evacuation Center</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
