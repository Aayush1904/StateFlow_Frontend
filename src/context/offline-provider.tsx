import React, { createContext, useContext, ReactNode } from 'react';
import { useOffline, OfflineStatus } from '@/hooks/use-offline';

interface OfflineContextType {
  status: OfflineStatus;
  queueOperation: (
    type: 'create' | 'update' | 'delete',
    resource: 'page' | 'task' | 'project' | 'comment',
    data: any
  ) => Promise<string>;
  syncPendingOperations: () => void;
  isOnline: boolean;
  isReconnecting: boolean;
  pendingOperations: number;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const offline = useOffline();

  const value: OfflineContextType = {
    status: offline.status,
    queueOperation: offline.queueOperation,
    syncPendingOperations: offline.syncPendingOperations,
    isOnline: offline.isOnline,
    isReconnecting: offline.isReconnecting,
    pendingOperations: offline.pendingOperations,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOfflineContext = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOfflineContext must be used within OfflineProvider');
  }
  return context;
};

