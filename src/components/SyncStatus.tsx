import { useData } from '../context/DataContext';
import { Wifi, WifiOff, Cloud, CloudOff, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface SyncStatusProps {
  variant?: 'compact' | 'detailed';
  className?: string;
}

export function SyncStatus({ variant = 'compact', className = '' }: SyncStatusProps) {
  const { syncStatus, syncData } = useData();

  const formatLastSync = (timestamp?: string) => {
    if (!timestamp) return 'Never';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {syncStatus.isSyncing ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
            <span className="text-blue-500 text-xs">Syncing...</span>
          </>
        ) : syncStatus.isOnline ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-[#5cc99f]" />
            <span className="text-[#cfdbeb] text-xs">
              {syncStatus.pendingItems > 0
                ? `${syncStatus.pendingItems} pending`
                : `Synced ${formatLastSync(syncStatus.lastSyncTime)}`
              }
            </span>
          </>
        ) : (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-amber-400 text-xs">
              Offline {syncStatus.pendingItems > 0 && `(${syncStatus.pendingItems} pending)`}
            </span>
          </>
        )}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Sync Status</h4>
        {syncStatus.isOnline && !syncStatus.isSyncing && syncStatus.pendingItems > 0 && (
          <button
            onClick={() => syncData()}
            className="flex items-center gap-1 text-xs text-[#143a63] hover:underline"
          >
            <RefreshCw className="w-3 h-3" />
            Sync Now
          </button>
        )}
      </div>

      {/* Connection Status */}
      <div className={`flex items-center gap-3 p-3 rounded-lg mb-3 ${
        syncStatus.isOnline ? 'bg-green-50' : 'bg-amber-50'
      }`}>
        {syncStatus.isOnline ? (
          <>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-700">Online</p>
              <p className="text-xs text-green-600">Connected to server</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-700">Offline Mode</p>
              <p className="text-xs text-amber-600">Data saved locally</p>
            </div>
          </>
        )}
      </div>

      {/* Sync Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Last Sync</span>
          <span className="text-gray-700 font-medium">
            {formatLastSync(syncStatus.lastSyncTime)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Pending Items</span>
          <span className={`font-medium ${syncStatus.pendingItems > 0 ? 'text-amber-600' : 'text-gray-700'}`}>
            {syncStatus.pendingItems}
          </span>
        </div>

        {syncStatus.isSyncing && (
          <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Synchronizing data...</span>
          </div>
        )}
      </div>

      {/* Pending Items Warning */}
      {!syncStatus.isOnline && syncStatus.pendingItems > 0 && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-700">
                {syncStatus.pendingItems} item{syncStatus.pendingItems !== 1 ? 's' : ''} waiting to sync
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Data will sync automatically when connection is restored.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success state */}
      {syncStatus.isOnline && syncStatus.pendingItems === 0 && !syncStatus.isSyncing && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-xs font-medium text-green-700">All data synchronized</p>
          </div>
        </div>
      )}
    </div>
  );
}
