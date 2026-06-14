import { useState } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { GeoLocation } from '../../types/drhmms';
import { MiniMap } from './MiniMap';
import { MapPin, Loader2, AlertCircle, Check, RefreshCw, X } from 'lucide-react';

interface GPSCaptureProps {
  value?: GeoLocation | null;
  onChange?: (location: GeoLocation | null) => void;
  disabled?: boolean;
  showMap?: boolean;
}

export function GPSCapture({ value, onChange, disabled = false, showMap = true }: GPSCaptureProps) {
  const { location, error, isLoading, getCurrentPosition, clearLocation, isSupported } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
  });

  const [captureError, setCaptureError] = useState<string | null>(null);

  const currentLocation = value || location;

  const handleCapture = async () => {
    setCaptureError(null);
    try {
      const loc = await getCurrentPosition();
      onChange?.(loc);
    } catch (err) {
      setCaptureError((err as Error).message);
    }
  };

  const handleClear = () => {
    clearLocation();
    onChange?.(null);
    setCaptureError(null);
  };

  const formatCoordinate = (coord: number, type: 'lat' | 'lng') => {
    const direction = type === 'lat'
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W');
    return `${Math.abs(coord).toFixed(6)}° ${direction}`;
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-700">GPS Not Available</p>
            <p className="text-xs text-yellow-600 mt-1">
              Your browser does not support GPS location capture. You can manually enter coordinates if needed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Status Display */}
      {currentLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Location Captured</p>
                <div className="text-xs text-green-600 mt-1 space-y-0.5">
                  <p>Latitude: {formatCoordinate(currentLocation.latitude, 'lat')}</p>
                  <p>Longitude: {formatCoordinate(currentLocation.longitude, 'lng')}</p>
                  {currentLocation.accuracy && (
                    <p>Accuracy: ±{currentLocation.accuracy.toFixed(0)}m</p>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleClear}
              disabled={disabled}
              className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
              title="Clear location"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mini Map Preview */}
          {showMap && (
            <div className="mt-3 bg-white border border-green-200 rounded overflow-hidden">
              <MiniMap location={currentLocation} height={140} />
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {(error || captureError) && !currentLocation && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">Location Error</p>
              <p className="text-xs text-red-600 mt-1">{error || captureError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Capture Button */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCapture}
          disabled={disabled || isLoading}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            currentLocation
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-[#143a63] text-white hover:bg-[#0a1c33]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Capturing Location...
            </>
          ) : currentLocation ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Update Location
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Capture GPS Location
            </>
          )}
        </button>
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500">
        Click to capture the current GPS coordinates. Make sure you are at the household location when capturing.
      </p>
    </div>
  );
}
