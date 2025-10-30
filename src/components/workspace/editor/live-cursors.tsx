import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CursorPosition {
    x: number;
    y: number;
    selection?: {
        from: number;
        to: number;
    };
}

interface User {
    userId: string;
    name: string;
    avatar?: string;
}

interface LiveCursorsProps {
    cursors: Map<string, CursorPosition>;
    connectedUsers: User[];
}

const LiveCursors: React.FC<LiveCursorsProps> = ({ cursors, connectedUsers }) => {
    return (
        <>
            {Array.from(cursors.entries()).map(([userId, cursor]) => {
                const user = connectedUsers.find(u => u.userId === userId);
                if (!user) return null;

                const getInitials = (name: string) => {
                    return name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);
                };

                return (
                    <div
                        key={userId}
                        className="fixed pointer-events-none z-50 transition-all duration-100"
                        style={{
                            left: cursor.x,
                            top: cursor.y,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        {/* Cursor */}
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-sm transform rotate-45"></div>
                            <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                                <Avatar className="h-4 w-4">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback className="text-xs">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <span>{user.name}</span>
                            </div>
                        </div>

                        {/* Selection highlight */}
                        {cursor.selection && (
                            <div
                                className="absolute bg-blue-200 opacity-30 pointer-events-none"
                                style={{
                                    left: cursor.selection.from,
                                    top: 0,
                                    width: cursor.selection.to - cursor.selection.from,
                                    height: '100%',
                                }}
                            />
                        )}
                    </div>
                );
            })}
        </>
    );
};

export default LiveCursors;
