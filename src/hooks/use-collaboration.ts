import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from '@/hooks/use-toast';
import useGetWorkspaceMembers from '@/hooks/api/use-get-workspace-members';

interface User {
  userId: string;
  name: string;
  avatar?: string;
}

interface CursorPosition {
  x: number;
  y: number;
  selection?: {
    from: number;
    to: number;
  };
}

export interface WhiteboardPoint {
  x: number;
  y: number;
}

export interface WhiteboardStroke {
  id: string;
  color: string;
  width: number;
  points: WhiteboardPoint[];
  userId?: string | null;
}

type WhiteboardUpdatePayload = {
  stroke?: WhiteboardStroke;
  action?: 'clear';
};

interface UseCollaborationProps {
  workspaceId: string;
  pageId?: string;
  token: string;
}

export const useCollaboration = ({ workspaceId, pageId, token }: UseCollaborationProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());
  const [whiteboardStrokes, setWhiteboardStrokes] = useState<WhiteboardStroke[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const currentSocketIdRef = useRef<string | null>(null);

  // Get workspace members to map user IDs to user objects
  const { data: membersData } = useGetWorkspaceMembers(workspaceId);
  const members = membersData?.members || [];

  // Extract current user ID from token
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId || payload._id || payload.id || payload.sub;
        currentUserIdRef.current = userId;
        console.log('Current user ID:', userId);
      } catch (error) {
        console.error('Failed to parse token:', error);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      console.warn('No token provided for collaboration');
      return;
    }

    // Prevent multiple connections
    if (socketRef.current?.connected) {
      console.log('Socket already connected, reusing connection');
      return;
    }

    // Add a small delay to ensure server is ready
    const timeoutId = setTimeout(() => {
      // Initialize socket connection
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'], // Prefer websocket
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection events
      newSocket.on('connect', () => {
        console.log('[Collaboration] ✅ Connected to collaboration server, socket ID:', newSocket.id);
        setIsConnected(true);
        currentSocketIdRef.current = (newSocket.id || null) as string | null;
        
        // Join workspace
        console.log('[Collaboration] Joining workspace:', workspaceId);
        newSocket.emit('join-workspace', workspaceId);
      });

      newSocket.on('disconnect', () => {
        console.log('[Collaboration] ❌ Disconnected from collaboration server');
        setIsConnected(false);
        setConnectedUsers([]);
        setCursors(new Map());
        setWhiteboardStrokes([]);
        currentSocketIdRef.current = null;
      });

      newSocket.on('connect_error', (error) => {
        console.error('[Collaboration] ⚠️ Connection error:', error);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to collaboration server',
          variant: 'destructive',
        });
      });

      // User presence events
      newSocket.on('user-joined', (user: User) => {
        setConnectedUsers(prev => {
          const exists = prev.find(u => u.userId === user.userId);
          if (!exists) {
            toast({
              title: 'User Joined',
              description: `${user.name} joined the workspace`,
              variant: 'default',
            });
            return [...prev, user];
          }
          return prev;
        });
      });

      newSocket.on('user-left', ({ userId }: { userId: string }) => {
        setConnectedUsers(prev => {
          const user = prev.find(u => u.userId === userId);
          if (user) {
            toast({
              title: 'User Left',
              description: `${user.name} left the workspace`,
              variant: 'default',
            });
          }
          return prev.filter(u => u.userId !== userId);
        });
        
        // Remove cursor
        setCursors(prev => {
          const newCursors = new Map(prev);
          newCursors.delete(userId);
          return newCursors;
        });
      });

      newSocket.on('current-users', (userIds: string[]) => {
        // Deduplicate user IDs to prevent duplicate keys
        const uniqueUserIds = Array.from(new Set(userIds));
        
        // Map user IDs to user objects using workspace members data
        const users: User[] = uniqueUserIds.map(userId => {
          const member = members.find(m => m.userId._id === userId);
          return {
            userId,
            name: member?.userId?.name || 'Unknown User',
            avatar: member?.userId?.profilePicture || undefined,
          };
        });
        
        setConnectedUsers(users);
      });

      // Document collaboration events
      newSocket.on('document-update', ({ update, userId, timestamp, socketId }: { update: any; userId: string; timestamp: string; socketId?: string }) => {
        console.log('[Collaboration] Document update received:', { 
          userId, 
          updateType: typeof update,
          hasContent: !!(update && update.content),
          contentPreview: update?.content?.substring(0, 50),
          socketId,
          currentSocketId: currentSocketIdRef.current,
        });
        
        if (socketId && socketId === currentSocketIdRef.current) {
          console.log('[Collaboration] Ignoring update from same socket');
          return;
        }

        // Apply the document update
        if (update && update.content) {
          // This will be handled by the editor component
          // We'll emit a custom event that the editor can listen to
          window.dispatchEvent(new CustomEvent('collaboration-update', {
            detail: { content: update.content, userId, timestamp, socketId }
          }));
          console.log('[Collaboration] Dispatched collaboration-update event');
        } else {
          console.warn('[Collaboration] Update missing content:', update);
        }
      });

      newSocket.on('cursor-update', ({ userId, cursor, socketId }: { userId: string; cursor: CursorPosition; socketId?: string }) => {
        if (socketId && socketId === currentSocketIdRef.current) {
          return;
        }
        setCursors(prev => {
          const newCursors = new Map(prev);
          newCursors.set(userId, cursor);
          return newCursors;
        });
      });

      newSocket.on('selection-update', ({ userId, selection, socketId }: { userId: string; selection: any; socketId?: string }) => {
        if (socketId && socketId === currentSocketIdRef.current) {
          return;
        }
        setCursors(prev => {
          const newCursors = new Map(prev);
          const currentCursor = newCursors.get(userId) || { x: 0, y: 0 };
          newCursors.set(userId, {
            ...currentCursor,
            selection,
          });
          return newCursors;
        });
      });

      newSocket.on('whiteboard-update', ({ stroke, action, userId }: { stroke?: WhiteboardStroke; action?: 'clear'; userId?: string }) => {
        if (action === 'clear') {
          setWhiteboardStrokes([]);
          return;
        }

        if (stroke) {
          setWhiteboardStrokes(prev => {
            const exists = prev.some(existing => existing.id === stroke.id);
            if (exists) {
              return prev;
            }
            return [...prev, { ...stroke, userId }];
          });
        }
      });
    }, 1000); // 1 second delay

    // Cleanup function for timeout and socket
    return () => {
      clearTimeout(timeoutId);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [workspaceId, token, members]);

  // Join page room when pageId changes
  useEffect(() => {
    if (socket && pageId) {
      console.log('[Collaboration] Joining page room:', pageId);
      setWhiteboardStrokes([]);
      socket.emit('join-page', pageId);
      
      return () => {
        console.log('[Collaboration] Leaving page room:', pageId);
        socket.emit('leave-page', pageId);
      };
    }
  }, [socket, pageId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const sendDocumentUpdate = (update: any) => {
    if (socket && pageId) {
      console.log('Sending document update:', { pageId, updateKeys: Object.keys(update), hasContent: !!update.content });
      socket.emit('document-update', { pageId, update });
    } else {
      console.warn('Cannot send document update:', { hasSocket: !!socket, hasPageId: !!pageId });
    }
  };

  const sendCursorUpdate = (cursor: CursorPosition) => {
    if (socket && pageId) {
      socket.emit('cursor-update', { pageId, cursor });
    }
  };

  const sendSelectionUpdate = (selection: any) => {
    if (socket && pageId) {
      socket.emit('selection-update', { pageId, selection });
    }
  };

  const sendWhiteboardStroke = (stroke: WhiteboardStroke) => {
    if (socket && pageId) {
      setWhiteboardStrokes(prev => {
        const exists = prev.some(existing => existing.id === stroke.id);
        if (exists) {
          return prev;
        }
        return [...prev, { ...stroke, userId: currentUserIdRef.current }];
      });

      socket.emit('whiteboard-update', {
        pageId,
        stroke,
      } as WhiteboardUpdatePayload & { pageId: string });
    }
  };

  const sendWhiteboardClear = () => {
    if (socket && pageId) {
      setWhiteboardStrokes([]);
      socket.emit('whiteboard-update', {
        pageId,
        action: 'clear',
      } as WhiteboardUpdatePayload & { pageId: string });
    }
  };

  return {
    socket,
    connectedUsers,
    isConnected,
    cursors,
    currentUserId: currentUserIdRef.current,
    currentSocketId: currentSocketIdRef.current,
    whiteboardStrokes,
    sendDocumentUpdate,
    sendCursorUpdate,
    sendSelectionUpdate,
    sendWhiteboardStroke,
    sendWhiteboardClear,
  };
};
