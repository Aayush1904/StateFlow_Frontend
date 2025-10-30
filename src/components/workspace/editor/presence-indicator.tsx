import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface User {
    userId: string;
    name: string;
    avatar?: string;
}

interface PresenceIndicatorProps {
    connectedUsers: User[];
    isConnected: boolean;
}

const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
    connectedUsers,
    isConnected
}) => {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                    {connectedUsers.length} online
                </span>
            </div>

            <div className="flex -space-x-2">
                {connectedUsers.slice(0, 5).map((user) => (
                    <Avatar key={user.userId} className="h-6 w-6 border-2 border-background">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-xs">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                ))}
                {connectedUsers.length > 5 && (
                    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-xs font-medium">
                            +{connectedUsers.length - 5}
                        </span>
                    </div>
                )}
            </div>

            <Badge
                variant={isConnected ? "default" : "secondary"}
                className="text-xs"
            >
                {isConnected ? "Connected" : "Disconnected"}
            </Badge>
        </div>
    );
};

export default PresenceIndicator;
