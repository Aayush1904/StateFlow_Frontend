import localforage from 'localforage';

// Configure IndexedDB storage
const offlineStore = localforage.createInstance({
  name: 'StateflowOffline',
  storeName: 'offline_data',
  description: 'Offline storage for Stateflow application',
});

const pendingQueue = localforage.createInstance({
  name: 'StateflowOffline',
  storeName: 'pending_queue',
  description: 'Queue for pending operations during offline',
});

// Types
export interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: 'page' | 'task' | 'project' | 'comment';
  data: any;
  timestamp: number;
  retries: number;
}

export interface OfflineData {
  pages: Map<string, any>;
  tasks: Map<string, any>;
  projects: Map<string, any>;
  workspaces: Map<string, any>;
  lastSync: number;
}

// Storage operations
export const offlineStorage = {
  // Save data to offline storage
  async save(key: string, data: any): Promise<void> {
    try {
      await offlineStore.setItem(key, data);
    } catch (error) {
      console.error('Error saving to offline storage:', error);
    }
  },

  // Get data from offline storage
  async get<T>(key: string): Promise<T | null> {
    try {
      return await offlineStore.getItem<T>(key);
    } catch (error) {
      console.error('Error getting from offline storage:', error);
      return null;
    }
  },

  // Remove data from offline storage
  async remove(key: string): Promise<void> {
    try {
      await offlineStore.removeItem(key);
    } catch (error) {
      console.error('Error removing from offline storage:', error);
    }
  },

  // Clear all offline storage
  async clear(): Promise<void> {
    try {
      await offlineStore.clear();
      await pendingQueue.clear();
    } catch (error) {
      console.error('Error clearing offline storage:', error);
    }
  },

  // Get all keys
  async keys(): Promise<string[]> {
    try {
      return await offlineStore.keys();
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  },
};

// Pending operations queue
export const operationQueue = {
  // Add operation to queue
  async add(operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>): Promise<string> {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const pendingOp: PendingOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retries: 0,
    };

    try {
      await pendingQueue.setItem(id, pendingOp);
      return id;
    } catch (error) {
      console.error('Error adding to queue:', error);
      throw error;
    }
  },

  // Get all pending operations
  async getAll(): Promise<PendingOperation[]> {
    try {
      const keys = await pendingQueue.keys();
      const operations: PendingOperation[] = [];

      for (const key of keys) {
        const op = await pendingQueue.getItem<PendingOperation>(key);
        if (op) {
          operations.push(op);
        }
      }

      // Sort by timestamp
      return operations.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Error getting pending operations:', error);
      return [];
    }
  },

  // Remove operation from queue
  async remove(id: string): Promise<void> {
    try {
      await pendingQueue.removeItem(id);
    } catch (error) {
      console.error('Error removing from queue:', error);
    }
  },

  // Update operation (increment retries)
  async updateRetries(id: string): Promise<void> {
    try {
      const op = await pendingQueue.getItem<PendingOperation>(id);
      if (op) {
        op.retries += 1;
        await pendingQueue.setItem(id, op);
      }
    } catch (error) {
      console.error('Error updating retries:', error);
    }
  },

  // Clear all pending operations
  async clear(): Promise<void> {
    try {
      await pendingQueue.clear();
    } catch (error) {
      console.error('Error clearing queue:', error);
    }
  },

  // Get count of pending operations
  async count(): Promise<number> {
    try {
      const keys = await pendingQueue.keys();
      return keys.length;
    } catch (error) {
      console.error('Error getting count:', error);
      return 0;
    }
  },
};

// Helper functions for specific resources
export const offlinePages = {
  async save(pageId: string, page: any): Promise<void> {
    await offlineStorage.save(`page_${pageId}`, page);
  },

  async get(pageId: string): Promise<any | null> {
    return await offlineStorage.get(`page_${pageId}`);
  },

  async remove(pageId: string): Promise<void> {
    await offlineStorage.remove(`page_${pageId}`);
  },

  async getAll(): Promise<any[]> {
    const keys = await offlineStorage.keys();
    const pageKeys = keys.filter(key => key.startsWith('page_'));
    const pages: any[] = [];

    for (const key of pageKeys) {
      const page = await offlineStorage.get(key);
      if (page) {
        pages.push(page);
      }
    }

    return pages;
  },
};

export const offlineTasks = {
  async save(taskId: string, task: any): Promise<void> {
    await offlineStorage.save(`task_${taskId}`, task);
  },

  async get(taskId: string): Promise<any | null> {
    return await offlineStorage.get(`task_${taskId}`);
  },

  async remove(taskId: string): Promise<void> {
    await offlineStorage.remove(`task_${taskId}`);
  },

  async getAll(): Promise<any[]> {
    const keys = await offlineStorage.keys();
    const taskKeys = keys.filter(key => key.startsWith('task_'));
    const tasks: any[] = [];

    for (const key of taskKeys) {
      const task = await offlineStorage.get(key);
      if (task) {
        tasks.push(task);
      }
    }

    return tasks;
  },
};

export const offlineProjects = {
  async save(projectId: string, project: any): Promise<void> {
    await offlineStorage.save(`project_${projectId}`, project);
  },

  async get(projectId: string): Promise<any | null> {
    return await offlineStorage.get(`project_${projectId}`);
  },

  async remove(projectId: string): Promise<void> {
    await offlineStorage.remove(`project_${projectId}`);
  },

  async getAll(): Promise<any[]> {
    const keys = await offlineStorage.keys();
    const projectKeys = keys.filter(key => key.startsWith('project_'));
    const projects: any[] = [];

    for (const key of projectKeys) {
      const project = await offlineStorage.get(key);
      if (project) {
        projects.push(project);
      }
    }

    return projects;
  },
};

