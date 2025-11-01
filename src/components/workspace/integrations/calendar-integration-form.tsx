import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createIntegrationMutationFn } from '@/lib/api';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { isValidWorkspaceId } from '@/lib/workspace-utils';

interface CalendarIntegrationFormProps {
    onSuccess?: () => void;
}

export const CalendarIntegrationForm: React.FC<CalendarIntegrationFormProps> = ({ onSuccess }) => {
    const workspaceId = useWorkspaceId();
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [refreshToken, setRefreshToken] = useState('');

    const { mutate: createIntegration, isPending } = useMutation({
        mutationFn: createIntegrationMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integrations', workspaceId] });
            toast({
                title: 'Success',
                description: 'Google Calendar integration created successfully',
                variant: 'success',
            });
            onSuccess?.();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create Google Calendar integration',
                variant: 'destructive',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !accessToken || !refreshToken) {
            toast({
                title: 'Error',
                description: 'Please fill in all required fields',
                variant: 'destructive',
            });
            return;
        }

        if (!isValidWorkspaceId(workspaceId)) return;
        createIntegration({
            workspaceId: workspaceId!,
            data: {
                type: 'google_calendar',
                name,
                config: {
                    accessToken,
                    refreshToken,
                },
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Integration Name</Label>
                <Input
                    id="name"
                    placeholder="e.g., My Google Calendar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Input
                    id="accessToken"
                    type="password"
                    placeholder="Access token from OAuth flow"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Obtain tokens through Google OAuth 2.0 flow. Required scopes: calendar.readonly, calendar.events
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="refreshToken">Refresh Token</Label>
                <Input
                    id="refreshToken"
                    type="password"
                    placeholder="Refresh token from OAuth flow"
                    value={refreshToken}
                    onChange={(e) => setRefreshToken(e.target.value)}
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Used to refresh the access token when it expires
                </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-900 dark:text-blue-200">
                <strong>Note:</strong> In a production environment, you should implement OAuth 2.0 flow
                to securely obtain these tokens. For now, you can manually paste tokens from Google Cloud Console.
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        'Connect Calendar'
                    )}
                </Button>
            </div>
        </form>
    );
};










