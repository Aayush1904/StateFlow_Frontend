import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/context/notification-provider';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import useWorkspaceId from '@/hooks/use-workspace-id';

const NotificationBadge: React.FC = () => {
    const workspaceId = useWorkspaceId();
    const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const handleNotificationClick = (notification: any) => {
        markAsRead(notification._id);
        setIsOpen(false);
    };

    const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation();
        deleteNotification(notificationId);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'mention':
                return '@';
            case 'task_assigned':
                return '✓';
            case 'page_shared':
                return '📄';
            case 'workspace_invite':
                return '👥';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'mention':
                return 'bg-blue-100 text-blue-800';
            case 'task_assigned':
                return 'bg-green-100 text-green-800';
            case 'page_shared':
                return 'bg-purple-100 text-purple-800';
            case 'workspace_invite':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative text-foreground hover:bg-accent hover:text-accent-foreground">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-3 border-b border-border">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                        <Badge variant="secondary">{unreadCount} unread</Badge>
                    )}
                </div>

                <DropdownMenuSeparator />

                <ScrollArea className="h-96">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                            No notifications yet
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification._id}
                                    className={`p-3 cursor-pointer ${!notification.isRead ? 'bg-accent' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start gap-3 w-full">
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getNotificationColor(notification.type)}`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium text-foreground ${!notification.isRead ? 'font-semibold' : ''}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
                                                    </p>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => handleDeleteNotification(e, notification._id)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>

                                            {notification.data?.mentionedByUser && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Avatar className="h-4 w-4">
                                                        <AvatarImage src={notification.data.mentionedByUser.profilePicture} />
                                                        <AvatarFallback
                                                            className="text-xs"
                                                            style={{ backgroundColor: getAvatarColor(notification.data.mentionedByUser.name) }}
                                                        >
                                                            {getAvatarFallbackText(notification.data.mentionedByUser.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs text-muted-foreground">
                                                        by {notification.data.mentionedByUser.name}
                                                    </span>
                                                </div>
                                            )}

                                            {notification.data?.assignedByUser && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Avatar className="h-4 w-4">
                                                        <AvatarImage src={notification.data.assignedByUser.profilePicture} />
                                                        <AvatarFallback
                                                            className="text-xs"
                                                            style={{ backgroundColor: getAvatarColor(notification.data.assignedByUser.name) }}
                                                        >
                                                            {getAvatarFallbackText(notification.data.assignedByUser.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs text-muted-foreground">
                                                        assigned by {notification.data.assignedByUser.name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                            <Link
                                to={`/workspace/${workspaceId}/notifications`}
                                className="text-sm text-primary hover:text-primary/80 underline"
                                onClick={() => setIsOpen(false)}
                            >
                                View all notifications
                            </Link>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBadge;
