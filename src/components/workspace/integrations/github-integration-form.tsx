import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createIntegrationMutationFn } from '@/lib/api';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { getErrorMessage, getErrorTitle } from '@/lib/error-messages';
import { isValidWorkspaceId } from '@/lib/workspace-utils';

interface GitHubIntegrationFormProps {
    onSuccess?: () => void;
}

export const GitHubIntegrationForm: React.FC<GitHubIntegrationFormProps> = ({ onSuccess }) => {
    const workspaceId = useWorkspaceId();
    const queryClient = useQueryClient();

    const [name, setName] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [organization, setOrganization] = useState('');
    const [repository, setRepository] = useState('');

    const { mutate: createIntegration, isPending } = useMutation({
        mutationFn: createIntegrationMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integrations', workspaceId] });
            toast({
                title: 'Success',
                description: 'GitHub integration created successfully',
                variant: 'success',
            });
            onSuccess?.();
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !accessToken || !organization || !repository) {
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
                type: 'github',
                name,
                config: {
                    accessToken,
                    organization,
                    repository,
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
                    placeholder="e.g., My GitHub Repo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="accessToken">GitHub Personal Access Token</Label>
                <Input
                    id="accessToken"
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Create a token at{' '}
                    <a
                        href="https://github.com/settings/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                    >
                        GitHub Settings
                    </a>
                    . Required scopes: repo, issues:read, issues:write
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="organization">Organization/Username</Label>
                <Input
                    id="organization"
                    placeholder="your-org or your-username"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="repository">Repository Name</Label>
                    {organization && repository && (
                        <a
                            href={`https://github.com/${organization}/${repository}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="h-3 w-3" />
                            Verify Repository
                        </a>
                    )}
                </div>
                <Input
                    id="repository"
                    placeholder="repository-name"
                    value={repository}
                    onChange={(e) => setRepository(e.target.value)}
                    required
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        'Connect GitHub'
                    )}
                </Button>
            </div>
        </form>
    );
};

