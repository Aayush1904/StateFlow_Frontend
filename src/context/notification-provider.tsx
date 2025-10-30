import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { toast } from '@/hooks/use-toast';
import { getUserNotificationsQueryFn, markNotificationAsReadMutationFn, markAllNotificationsAsReadMutationFn, deleteNotificationMutationFn } from '@/lib/api';

interface Notification {
    _id: string;
    userId: string;
    workspaceId: string;
    pageId?: string;
    type: 'mention' | 'task_assigned' | 'page_shared' | 'workspace_invite';
    title: string;
    message: string;
    data?: any;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    socket: Socket | null;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (notificationId: string) => void;
    refetchNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const queryClient = useQueryClient();

    // Get notifications
    const { data: notificationsData, isLoading, refetch } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => getUserNotificationsQueryFn({ limit: 50 }),
        staleTime: 30000, // 30 seconds
        refetchInterval: 60000, // Refetch every minute
    });

    const notifications = notificationsData?.notifications || [];
    const unreadCount = notificationsData?.unreadCount || 0;

    // Mutations
    const { mutate: markAsReadMutation } = useMutation({
        mutationFn: markNotificationAsReadMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const { mutate: markAllAsReadMutation } = useMutation({
        mutationFn: markAllNotificationsAsReadMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast({ title: 'All notifications marked as read' });
        },
    });

    const { mutate: deleteNotificationMutation } = useMutation({
        mutationFn: deleteNotificationMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    // Socket connection for real-time notifications
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
            auth: { token },
        });

        newSocket.on('connect', () => {
            console.log('Connected to notification server');
        });

        newSocket.on('mention-notification', (data: any) => {
            console.log('Received mention notification:', data);

            // Show toast notification
            toast({
                title: data.title,
                description: data.message,
                action: (
                    <button
                        onClick={() => {
                            // Navigate to the page
                            window.location.href = `/workspace/${data.workspaceId}/pages/${data.pageId}`;
                        }}
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        View Page
                    </button>
                ),
            });

            // Refresh notifications
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        newSocket.on('task-assigned-notification', (data: any) => {
            console.log('Received task assignment notification:', data);

            // Show toast notification
            toast({
                title: data.title,
                description: data.message,
                action: (
                    <button
                        onClick={() => {
                            // Navigate to the task/project
                            window.location.href = `/workspace/${data.workspaceId}/project/${data.projectId}`;
                        }}
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        View Task
                    </button>
                ),
            });

            // Refresh notifications
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from notification server');
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [queryClient]);

    const markAsRead = (notificationId: string) => {
        markAsReadMutation(notificationId);
    };

    const markAllAsRead = () => {
        markAllAsReadMutation();
    };

    const deleteNotification = (notificationId: string) => {
        deleteNotificationMutation(notificationId);
    };

    const refetchNotifications = () => {
        refetch();
    };

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        isLoading,
        socket,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetchNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
