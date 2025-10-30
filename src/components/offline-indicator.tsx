import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { useOffline } from '@/hooks/use-offline';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export const OfflineIndicator: React.FC = () => {
  const { status, syncPendingOperations } = useOffline();

  if (status.isOnline && status.pendingOperations === 0) {
    return null; // Don't show indicator when online with no pending ops
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className="bg-card border border-border rounded-lg shadow-lg p-3 flex items-center gap-3">
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {status.isReconnecting ? (
              <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
            ) : status.isOnline ? (
              <Cloud className="h-5 w-5 text-green-500" />
            ) : (
              <CloudOff className="h-5 w-5 text-orange-500" />
            )}
          </div>

          {/* Status Text */}
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-medium text-foreground">
              {status.isReconnecting
                ? 'Syncing...'
                : status.isOnline
                ? 'Connected'
                : 'Offline Mode'}
            </p>
            {status.pendingOperations > 0 && (
              <p className="text-xs text-muted-foreground">
                {status.pendingOperations} pending change{status.pendingOperations > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Sync Button */}
          {status.isOnline && status.pendingOperations > 0 && !status.isReconnecting && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={syncPendingOperations}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sync now</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Status Badge */}
          <Badge
            variant={
              status.isReconnecting
                ? 'default'
                : status.isOnline
                ? 'default'
                : 'secondary'
            }
            className="flex-shrink-0"
          >
            {status.isReconnecting ? (
              'Syncing'
            ) : status.isOnline ? (
              <span className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Online
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                Offline
              </span>
            )}
          </Badge>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Compact version for header
export const OfflineStatusBadge: React.FC = () => {
  const { status } = useOffline();

  if (status.isOnline && status.pendingOperations === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            {status.isReconnecting ? (
              <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
            ) : status.isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-orange-500" />
            )}
            {status.pendingOperations > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {status.pendingOperations}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {status.isReconnecting
              ? 'Syncing changes...'
              : status.isOnline
              ? `${status.pendingOperations} pending changes`
              : 'Offline - changes will sync when online'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

