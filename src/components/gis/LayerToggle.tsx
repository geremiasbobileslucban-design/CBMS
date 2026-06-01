import { Layers, Home, Droplets, Mountain, Building2, AlertTriangle } from 'lucide-react';

export interface MapLayer {
  id: string;
  label: string;
  icon: typeof Home;
  color: string;
  enabled: boolean;
}

interface LayerToggleProps {
  layers: MapLayer[];
  onChange: (layerId: string, enabled: boolean) => void;
  className?: string;
}

export function LayerToggle({ layers, onChange, className = '' }: LayerToggleProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-3 ${className}`}>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        <Layers className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Map Layers</span>
      </div>

      <div className="space-y-2">
        {layers.map(layer => (
          <label
            key={layer.id}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={layer.enabled}
              onChange={(e) => onChange(layer.id, e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                layer.enabled
                  ? 'bg-[#143a63] text-white'
                  : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
              }`}
              style={layer.enabled ? { backgroundColor: layer.color } : {}}
            >
              <layer.icon className="w-3 h-3" />
            </div>
            <span className={`text-sm ${layer.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
              {layer.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Default layers configuration
export const defaultMapLayers: MapLayer[] = [
  { id: 'households', label: 'Households', icon: Home, color: '#4f46e5', enabled: true },
  { id: 'flood', label: 'Flood Zones', icon: Droplets, color: '#3b82f6', enabled: false },
  { id: 'landslide', label: 'Landslide Zones', icon: Mountain, color: '#ea580c', enabled: false },
  { id: 'evacuation', label: 'Evacuation Centers', icon: Building2, color: '#059669', enabled: true },
  { id: 'highRisk', label: 'High Risk HH', icon: AlertTriangle, color: '#dc2626', enabled: false },
];
