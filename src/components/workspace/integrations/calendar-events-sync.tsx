import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Badge import removed
import { Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
    syncCalendarEventsMutationFn,
    CalendarEvent,
} from '@/lib/api';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { isValidWorkspaceId } from '@/lib/workspace-utils';
import { Integration } from '@/lib/api';
import { format } from 'date-fns';

interface CalendarEventsSyncProps {
    integration: Integration;
}

export const CalendarEventsSync: React.FC<CalendarEventsSyncProps> = ({ integration }) => {
    const workspaceId = useWorkspaceId();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isSynced, setIsSynced] = useState(false);

    const { mutate: syncEvents, isPending: isSyncing } = useMutation({
        mutationFn: syncCalendarEventsMutationFn,
        onSuccess: (data) => {
            setEvents(data.events);
            setIsSynced(true);
            toast({
                title: 'Success',
                description: `Synced ${data.synced} calendar events`,
                variant: 'success',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to sync calendar events',
                variant: 'destructive',
            });
        },
    });

    const handleSync = () => {
        if (!isValidWorkspaceId(workspaceId)) return;
        const now = new Date();
        const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Next 30 days

        syncEvents({
            workspaceId: workspaceId!,
            integrationId: integration._id,
            timeMin: now.toISOString(),
            timeMax: timeMax.toISOString(),
        });
    };

    const formatEventTime = (event: CalendarEvent) => {
        if (event.start.dateTime) {
            return format(new Date(event.start.dateTime), 'MMM d, yyyy h:mm a');
        }
        if (event.start.date) {
            return format(new Date(event.start.date), 'MMM d, yyyy');
        }
        return 'All day';
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5" />
                        <div>
                            <CardTitle>Calendar Events</CardTitle>
                            <CardDescription>Upcoming events from your Google Calendar</CardDescription>
                        </div>
                    </div>
                    <Button onClick={handleSync} disabled={isSyncing} size="sm">
                        {isSyncing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Syncing...
                            </>
                        ) : (
                            'Sync Events'
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isSynced && events.length > 0 ? (
                    <div className="space-y-3">
                        {events.slice(0, 10).map((event) => (
                            <div
                                key={event.id}
                                className="border rounded-lg p-4 hover:bg-accent transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-semibold">{event.summary}</h4>
                                            {event.htmlLink && (
                                                <a
                                                    href={event.htmlLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                        {event.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                {event.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>{formatEventTime(event)}</span>
                                            {event.location && (
                                                <span className="truncate">📍 {event.location}</span>
                                            )}
                                        </div>
                                        {event.attendees && event.attendees.length > 0 && (
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                Attendees: {event.attendees.map((a) => a.email).join(', ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {events.length > 10 && (
                            <p className="text-sm text-muted-foreground text-center">
                                Showing 10 of {events.length} events
                            </p>
                        )}
                    </div>
                ) : isSynced && events.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No upcoming events found
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Click "Sync Events" to fetch calendar events
                    </p>
                )}
            </CardContent>
        </Card>
    );
};










