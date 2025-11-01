import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    Github,
    Calendar,
    Trash2,
    Settings,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
    getIntegrationsByWorkspaceQueryFn,
    deleteIntegrationMutationFn,
    testIntegrationMutationFn,
    Integration,
} from '@/lib/api';
import { isValidWorkspaceId } from '@/lib/workspace-utils';
import { getErrorMessage, getErrorTitle } from '@/lib/error-messages';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { GitHubIntegrationForm } from './github-integration-form';
import { CalendarIntegrationForm } from './calendar-integration-form';

const IntegrationCard: React.FC<{ integration: Integration; onDelete: () => void }> = ({
    integration,
    onDelete
}) => {
    const workspaceId = useWorkspaceId();
    const queryClient = useQueryClient();

    const { mutate: testIntegration, isPending: isTesting } = useMutation({
        mutationFn: testIntegrationMutationFn,
        onSuccess: (data) => {
            toast({
                title: data.valid ? 'Success' : 'Failed',
                description: data.message,
                variant: data.valid ? 'success' : 'destructive',
            });
        },
        onError: (error: any) => {
            const friendlyMessage = getErrorMessage(error);
            const errorTitle = getErrorTitle(error);
            toast({
                title: errorTitle,
                description: friendlyMessage,
                variant: 'destructive',
            });
        },
    });

    const { mutate: deleteIntegration, isPending: isDeleting } = useMutation({
        mutationFn: deleteIntegrationMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integrations', workspaceId] });
            toast({
                title: 'Success',
                description: 'Integration deleted successfully',
                variant: 'success',
            });
            onDelete();
        },
        onError: (error: any) => {
            const friendlyMessage = getErrorMessage(error);
            const errorTitle = getErrorTitle(error);
            toast({
                title: errorTitle,
                description: friendlyMessage,
                variant: 'destructive',
            });
        },
    });

    const getStatusIcon = () => {
        switch (integration.status) {
            case 'active':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <XCircle className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusBadge = () => {
        switch (integration.status) {
            case 'active':
                return <Badge variant="default" className="bg-green-500">Active</Badge>;
            case 'error':
                return <Badge variant="destructive">Error</Badge>;
            default:
                return <Badge variant="secondary">Inactive</Badge>;
        }
    };

    const getTypeIcon = () => {
        switch (integration.type) {
            case 'github':
                return <Github className="h-5 w-5" />;
            case 'google_calendar':
                return <Calendar className="h-5 w-5" />;
            default:
                return <Settings className="h-5 w-5" />;
        }
    };

    const handleTest = () => {
        if (!isValidWorkspaceId(workspaceId)) return;
        testIntegration({
            workspaceId: workspaceId!,
            integrationId: integration._id,
        });
    };

    const handleDelete = () => {
        if (!isValidWorkspaceId(workspaceId)) return;
        if (confirm('Are you sure you want to delete this integration?')) {
            deleteIntegration({
                workspaceId: workspaceId!,
                integrationId: integration._id,
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {getTypeIcon()}
                        <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <CardDescription className="capitalize mt-1">
                                {integration.type.replace('_', ' ')}
                            </CardDescription>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {integration.metadata?.lastSyncAt && (
                        <div className="text-sm text-muted-foreground">
                            Last synced: {new Date(integration.metadata.lastSyncAt).toLocaleString()}
                        </div>
                    )}

                    {integration.metadata?.errorMessage && (
                        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            {integration.metadata.errorMessage}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleTest}
                            disabled={isTesting}
                        >
                            {isTesting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                <>
                                    {getStatusIcon()}
                                    <span className="ml-2">Test Connection</span>
                                </>
                            )}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export const IntegrationsList: React.FC = () => {
    const workspaceId = useWorkspaceId();
    const [showGitHubDialog, setShowGitHubDialog] = useState(false);
    const [showCalendarDialog, setShowCalendarDialog] = useState(false);

    const isValid = isValidWorkspaceId(workspaceId);
    
    const { data, isLoading, error } = useQuery({
        queryKey: ['integrations', workspaceId],
        queryFn: () => getIntegrationsByWorkspaceQueryFn({ workspaceId: workspaceId! }),
        enabled: isValid,
    });

    const integrations = data?.integrations || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="py-8">
                    <p className="text-sm text-muted-foreground">Failed to load integrations</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end">
                <div className="flex gap-2">
                    <Dialog open={showGitHubDialog} onOpenChange={setShowGitHubDialog}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Github className="h-4 w-4 mr-2" />
                                GitHub
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Connect GitHub</DialogTitle>
                                <DialogDescription>
                                    Connect your GitHub repository to sync issues and create tasks
                                </DialogDescription>
                            </DialogHeader>
                            <GitHubIntegrationForm onSuccess={() => setShowGitHubDialog(false)} />
                        </DialogContent>
                    </Dialog>

                    <Dialog open={showCalendarDialog} onOpenChange={setShowCalendarDialog}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Calendar className="h-4 w-4 mr-2" />
                                Google Calendar
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Connect Google Calendar</DialogTitle>
                                <DialogDescription>
                                    Connect your Google Calendar to sync events and create meeting reminders
                                </DialogDescription>
                            </DialogHeader>
                            <CalendarIntegrationForm onSuccess={() => setShowCalendarDialog(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {integrations.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No integrations yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Get started by connecting an external service
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {integrations.map((integration) => (
                        <IntegrationCard
                            key={integration._id}
                            integration={integration}
                            onDelete={() => { }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

