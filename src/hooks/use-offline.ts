import { useState, useEffect, useCallback } from 'react';
import { toast } from './use-toast';
import { operationQueue, PendingOperation } from '@/lib/offline-storage';
import API from '@/lib/axios-client';

export interface OfflineStatus {
  isOnline: boolean;
  isReconnecting: boolean;
  pendingOperations: number;
  lastSyncTime: Date | null;
}

export const useOffline = () => {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    isReconnecting: false,
    pendingOperations: 0,
    lastSyncTime: null,
  });

  const [syncInProgress, setSyncInProgress] = useState(false);

  // Update pending operations count
  const updatePendingCount = useCallback(async () => {
    const count = await operationQueue.count();
    setStatus(prev => ({ ...prev, pendingOperations: count }));
  }, []);

  // Sync pending operations with server
  const syncPendingOperations = useCallback(async () => {
    if (syncInProgress || !navigator.onLine) return;

    setSyncInProgress(true);
    setStatus(prev => ({ ...prev, isReconnecting: true }));

    try {
      const operations = await operationQueue.getAll();
      
      if (operations.length === 0) {
        setStatus(prev => ({ 
          ...prev, 
          isReconnecting: false,
          lastSyncTime: new Date(),
        }));
        setSyncInProgress(false);
        return;
      }

      console.log(`Syncing ${operations.length} pending operations...`);

      let successCount = 0;
      let failCount = 0;

      // Process each operation
      for (const operation of operations) {
        try {
          await processOperation(operation);
          await operationQueue.remove(operation.id);
          successCount++;
        } catch (error: any) {
          console.error(`Failed to sync operation ${operation.id}:`, error);
          
          // Retry logic: max 3 retries
          if (operation.retries < 3) {
            await operationQueue.updateRetries(operation.id);
          } else {
            // Remove after 3 failed attempts
            await operationQueue.remove(operation.id);
            console.warn(`Removed operation ${operation.id} after 3 failed attempts`);
          }
          failCount++;
        }
      }

      // Update status
      await updatePendingCount();
      
      setStatus(prev => ({ 
        ...prev, 
        isReconnecting: false,
        lastSyncTime: new Date(),
      }));

      // Show toast
      if (successCount > 0) {
        toast({
          title: 'Synced Successfully',
          description: `${successCount} operation(s) synced${failCount > 0 ? `, ${failCount} failed` : ''}`,
          variant: 'success',
        });
      }

    } catch (error) {
      console.error('Sync failed:', error);
      setStatus(prev => ({ ...prev, isReconnecting: false }));
    } finally {
      setSyncInProgress(false);
    }
  }, [syncInProgress, updatePendingCount]);

  // Process a single operation
  const processOperation = async (operation: PendingOperation): Promise<void> => {
    const { type, resource, data } = operation;

    switch (resource) {
      case 'page':
        if (type === 'create') {
          await API.post(`/pages`, data);
        } else if (type === 'update') {
          await API.put(`/pages/${data._id}`, data);
        } else if (type === 'delete') {
          await API.delete(`/pages/${data._id}`);
        }
        break;

      case 'task':
        if (type === 'create') {
          await API.post(`/tasks`, data);
        } else if (type === 'update') {
          await API.put(`/tasks/${data._id}`, data);
        } else if (type === 'delete') {
          await API.delete(`/tasks/${data._id}`);
        }
        break;

      case 'project':
        if (type === 'create') {
          await API.post(`/projects`, data);
        } else if (type === 'update') {
          await API.put(`/projects/${data._id}`, data);
        } else if (type === 'delete') {
          await API.delete(`/projects/${data._id}`);
        }
        break;

      case 'comment':
        if (type === 'create') {
          await API.post(`/comments`, data);
        } else if (type === 'delete') {
          await API.delete(`/comments/${data._id}`);
        }
        break;
    }
  };

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Connection restored');
      setStatus(prev => ({ ...prev, isOnline: true }));
      
      toast({
        title: 'Back Online',
        description: 'Connection restored. Syncing pending changes...',
        variant: 'success',
      });

      // Wait a bit before syncing to ensure connection is stable
      setTimeout(() => {
        syncPendingOperations();
      }, 1000);
    };

    const handleOffline = () => {
      console.log('Connection lost');
      setStatus(prev => ({ ...prev, isOnline: false, isReconnecting: false }));
      
      toast({
        title: 'You\'re Offline',
        description: 'Changes will be saved locally and synced when you\'re back online.',
        variant: 'default',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync if online
    if (navigator.onLine) {
      updatePendingCount();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingOperations, updatePendingCount]);

  // Add operation to queue
  const queueOperation = useCallback(async (
    type: 'create' | 'update' | 'delete',
    resource: 'page' | 'task' | 'project' | 'comment',
    data: any
  ): Promise<string> => {
    const id = await operationQueue.add({ type, resource, data });
    await updatePendingCount();
    
    // Try to sync immediately if online
    if (navigator.onLine && !syncInProgress) {
      setTimeout(() => syncPendingOperations(), 500);
    }
    
    return id;
  }, [syncInProgress, syncPendingOperations, updatePendingCount]);

  // Manual sync trigger
  const triggerSync = useCallback(() => {
    if (navigator.onLine) {
      syncPendingOperations();
    } else {
      toast({
        title: 'Offline',
        description: 'Cannot sync while offline',
        variant: 'destructive',
      });
    }
  }, [syncPendingOperations]);

  return {
    status,
    queueOperation,
    syncPendingOperations: triggerSync,
    isOnline: status.isOnline,
    isReconnecting: status.isReconnecting,
    pendingOperations: status.pendingOperations,
  };
};

