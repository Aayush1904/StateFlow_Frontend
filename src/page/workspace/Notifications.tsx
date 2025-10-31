import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X, CheckCheck, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper';
import { format } from 'date-fns';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useNotifications } from '@/context/notification-provider';

const Notifications: React.FC = () => {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications();

    const filteredNotifications = showUnreadOnly
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const handleNotificationClick = (notification: any) => {
        markAsRead(notification._id);

        // Navigate based on notification type
        if (notification.type === 'mention' && notification.data?.pageId) {
            navigate(`/workspace/${workspaceId}/pages/${notification.data.pageId}`);
        } else if (notification.type === 'task_assigned' && notification.data?.projectId) {
            navigate(`/workspace/${workspaceId}/project/${notification.data.projectId}`);
        }
    };

    const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation();
        deleteNotification(notificationId);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
        toast({
            title: "Success",
            description: "All notifications marked as read",
        });
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
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'task_assigned':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'page_shared':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'workspace_invite':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-6">
            <Link
                to={`/workspace/${workspaceId}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    <p className="text-muted-foreground mt-1">
                        {unreadCount > 0
                            ? `${unreadCount} unread ${unreadCount === 1 ? 'notification' : 'notifications'}`
                            : 'All caught up!'}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                    >
                        {showUnreadOnly ? 'Show All' : 'Show Unread Only'}
                    </Button>

                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Mark All Read
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {showUnreadOnly ? 'Unread Notifications' : 'All Notifications'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔔</div>
                            <p className="text-lg font-medium text-muted-foreground">
                                {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                {showUnreadOnly
                                    ? 'All your notifications have been read'
                                    : 'You\'ll see new notifications here when they arrive'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`
                                        p-4 rounded-lg border cursor-pointer transition-colors
                                        ${!notification.isRead ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`
                                            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium
                                            ${getNotificationColor(notification.type)}
                                        `}>
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{notification.title}</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
                                                    </p>

                                                    {notification.data?.mentionedByUser && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Avatar className="h-5 w-5">
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
                                                            <Avatar className="h-5 w-5">
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

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => handleDeleteNotification(e, notification._id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Notifications;

