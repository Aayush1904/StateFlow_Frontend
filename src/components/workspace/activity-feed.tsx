import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { io, Socket } from 'socket.io-client';
import {
    Activity,
    Filter,
    X,
    FileText,
    CheckSquare,
    FolderOpen,
    Users,
    MessageSquare,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

import { getActivityFeedQueryFn, ActivityFeedFilters, ActivityType } from '@/lib/api';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper';

interface ActivityFeedProps {
    className?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ className }) => {
    const workspaceId = useWorkspaceId();
    const [filters, setFilters] = useState<ActivityFeedFilters>({
        limit: 20,
        offset: 0,
    });
    const [showFilters, setShowFilters] = useState(false);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['activity-feed', workspaceId, filters],
        queryFn: () => getActivityFeedQueryFn({ workspaceId, filters }),
        enabled: !!workspaceId,
        staleTime: 30000, // 30 seconds
        refetchInterval: 60000, // Refetch every minute
    });

    const activities = data?.activities || [];
    const hasMore = data?.pagination?.hasMore || false;
    const queryClient = useQueryClient();

    // Real-time updates via WebSocket
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !workspaceId) return;

        const socket: Socket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
            auth: { token },
        });

        socket.on('connect', () => {
            console.log('Connected to activity feed WebSocket');
            socket.emit('join-workspace', workspaceId);
        });

        socket.on('activity-update', (data: { activity: ActivityType; timestamp: string }) => {
            console.log('Received activity update:', data);

            // Invalidate and refetch activity feed
            queryClient.invalidateQueries({ queryKey: ['activity-feed', workspaceId] });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from activity feed WebSocket');
        });

        return () => {
            socket.disconnect();
        };
    }, [workspaceId, queryClient]);

    const getActivityIcon = (type: ActivityType['type']) => {
        switch (type) {
            case 'page_created':
            case 'page_updated':
            case 'page_deleted':
                return <FileText className="h-4 w-4" />;
            case 'task_created':
            case 'task_updated':
            case 'task_deleted':
            case 'task_moved':
                return <CheckSquare className="h-4 w-4" />;
            case 'project_created':
            case 'project_updated':
            case 'project_deleted':
                return <FolderOpen className="h-4 w-4" />;
            case 'member_added':
            case 'member_removed':
            case 'member_role_changed':
                return <Users className="h-4 w-4" />;
            case 'comment_added':
            case 'mention_added':
                return <MessageSquare className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    const getActivityColor = (type: ActivityType['type']) => {
        switch (type) {
            case 'page_created':
            case 'task_created':
            case 'project_created':
            case 'member_added':
                return 'text-green-600 bg-green-50';
            case 'page_updated':
            case 'task_updated':
            case 'project_updated':
            case 'member_role_changed':
                return 'text-blue-600 bg-blue-50';
            case 'page_deleted':
            case 'task_deleted':
            case 'project_deleted':
            case 'member_removed':
                return 'text-red-600 bg-red-50';
            case 'task_moved':
                return 'text-orange-600 bg-orange-50';
            case 'comment_added':
            case 'mention_added':
                return 'text-purple-600 bg-purple-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getResourceLink = (activity: ActivityType) => {
        if (!activity.resourceId) return null;

        switch (activity.resourceType) {
            case 'page':
                return `/workspace/${workspaceId}/pages/${activity.resourceId}`;
            case 'task':
                return `/workspace/${workspaceId}/projects/${activity.projectId}/tasks/${activity.resourceId}`;
            case 'project':
                return `/workspace/${workspaceId}/projects/${activity.resourceId}`;
            default:
                return null;
        }
    };

    const handleFilterChange = (key: keyof ActivityFeedFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            offset: 0, // Reset offset when filters change
        }));
    };

    const clearFilters = () => {
        setFilters({
            limit: 20,
            offset: 0,
        });
    };

    const loadMore = () => {
        setFilters(prev => ({
            ...prev,
            offset: (prev.offset || 0) + (prev.limit || 20),
        }));
    };

    const activeFiltersCount = Object.values(filters).filter(
        (value) => value !== undefined && value !== 20 && value !== 0
    ).length;

    if (error) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Activity Feed
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Failed to load activity feed</p>
                        <Button onClick={() => refetch()} className="mt-2">
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Activity Feed
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}
                            </Badge>
                        )}
                        <DropdownMenu open={showFilters} onOpenChange={setShowFilters}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filters
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="p-2">
                                    <h4 className="font-medium text-sm mb-2">Filter by Resource Type</h4>
                                    <div className="space-y-1">
                                        {['page', 'task', 'project', 'member', 'comment'].map((type) => (
                                            <label key={type} className="flex items-center space-x-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.resourceType === type}
                                                    onChange={(e) =>
                                                        handleFilterChange('resourceType', e.target.checked ? type : undefined)
                                                    }
                                                    className="rounded"
                                                />
                                                <span className="capitalize">{type}s</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <div className="p-2">
                                    <h4 className="font-medium text-sm mb-2">Filter by Action</h4>
                                    <div className="space-y-1">
                                        {['created', 'updated', 'deleted', 'moved'].map((action) => (
                                            <label key={action} className="flex items-center space-x-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.type?.includes(action)}
                                                    onChange={(e) => {
                                                        const currentTypes = filters.type?.split(',') || [];
                                                        const newTypes = e.target.checked
                                                            ? [...currentTypes, action]
                                                            : currentTypes.filter(t => t !== action);
                                                        handleFilterChange('type', newTypes.length > 0 ? newTypes.join(',') : undefined);
                                                    }}
                                                    className="rounded"
                                                />
                                                <span className="capitalize">{action}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={clearFilters} className="text-red-600">
                                    <X className="h-4 w-4 mr-2" />
                                    Clear Filters
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading && activities.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2 text-muted-foreground">Loading activities...</span>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="text-center py-8">
                        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No activities found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Activities will appear here as team members work on projects
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-[600px]">
                        <div className="space-y-4">
                            {activities.map((activity) => {
                                const resourceLink = getResourceLink(activity);
                                const initials = getAvatarFallbackText(activity.user.name);
                                const avatarColor = getAvatarColor(activity.user.name);

                                return (
                                    <div key={activity._id} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                        {/* Avatar */}
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={activity.user.profilePicture} />
                                            <AvatarFallback className={`text-xs ${avatarColor}`}>
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Activity Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={`p-1 rounded ${getActivityColor(activity.type)}`}>
                                                            {getActivityIcon(activity.type)}
                                                        </div>
                                                        <span className="font-medium text-sm">{activity.user.name}</span>
                                                        <span className="text-sm text-muted-foreground">{activity.title}</span>
                                                    </div>

                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {activity.description}
                                                    </p>

                                                    {/* Resource Link */}
                                                    {resourceLink && (
                                                        <div className="flex items-center gap-1 text-sm">
                                                            <Link
                                                                to={resourceLink}
                                                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                                            >
                                                                {activity.resourceName}
                                                                <ArrowRight className="h-3 w-3" />
                                                            </Link>
                                                        </div>
                                                    )}

                                                    {/* Project Context */}
                                                    {activity.projectName && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            in <span className="font-medium">{activity.projectName}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Timestamp */}
                                                <div className="text-xs text-muted-foreground ml-2">
                                                    {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                                                </div>
                                            </div>

                                            {/* Additional Data */}
                                            {activity.data && (
                                                <div className="mt-2 text-xs text-muted-foreground">
                                                    {activity.data.oldStatus && activity.data.newStatus && (
                                                        <Badge variant="outline" className="mr-1">
                                                            {activity.data.oldStatus} → {activity.data.newStatus}
                                                        </Badge>
                                                    )}
                                                    {activity.data.oldPriority && activity.data.newPriority && (
                                                        <Badge variant="outline" className="mr-1">
                                                            Priority: {activity.data.oldPriority} → {activity.data.newPriority}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Load More Button */}
                            {hasMore && (
                                <div className="flex justify-center pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={loadMore}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Loading...
                                            </>
                                        ) : (
                                            'Load More'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
};

export default ActivityFeed;
