import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
    syncGitHubAllDataMutationFn,
    GitHubIssue,
    GitHubPullRequest,
    GitHubCommit,
    GitHubRelease,
    GitHubContributor,
    GitHubBranch,
    GitHubRepository,
} from '@/lib/api';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { Integration } from '@/lib/api';
import { format } from 'date-fns';

interface GitHubIssuesSyncProps {
    integration: Integration;
}

export const GitHubIssuesSync: React.FC<GitHubIssuesSyncProps> = ({ integration }) => {
    const workspaceId = useWorkspaceId();
    const [repository, setRepository] = useState<GitHubRepository | null>(null);
    const [issues, setIssues] = useState<GitHubIssue[]>([]);
    const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([]);
    const [commits, setCommits] = useState<GitHubCommit[]>([]);
    const [releases, setReleases] = useState<GitHubRelease[]>([]);
    const [contributors, setContributors] = useState<GitHubContributor[]>([]);
    const [branches, setBranches] = useState<GitHubBranch[]>([]);
    const [isSynced, setIsSynced] = useState(false);
    const [syncStats, setSyncStats] = useState<{
        issues: number;
        pullRequests: number;
        commits: number;
        releases: number;
        contributors: number;
        branches: number;
    } | null>(null);

    const { mutate: syncAllData, isPending: isSyncing } = useMutation({
        mutationFn: syncGitHubAllDataMutationFn,
        onSuccess: (data) => {
            setRepository(data.repository);
            setIssues(data.issues);
            setPullRequests(data.pullRequests);
            setCommits(data.commits);
            setReleases(data.releases);
            setContributors(data.contributors);
            setBranches(data.branches);
            setSyncStats(data.synced);
            setIsSynced(true);
            const totalSynced = data.synced.issues + data.synced.pullRequests +
                data.synced.commits + data.synced.releases +
                data.synced.contributors + data.synced.branches;
            toast({
                title: 'Success',
                description: `Synced ${totalSynced} GitHub items (${data.synced.issues} issues, ${data.synced.pullRequests} PRs, ${data.synced.commits} commits, ${data.synced.releases} releases)`,
                variant: 'success',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to sync GitHub data',
                variant: 'destructive',
            });
        },
    });

    const handleSync = () => {
        syncAllData({
            workspaceId,
            integrationId: integration._id,
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Github className="h-5 w-5" />
                        <div>
                            <CardTitle>GitHub Repository</CardTitle>
                            <CardDescription>
                                {integration.config.organization}/{integration.config.repository}
                            </CardDescription>
                        </div>
                    </div>
                    <Button onClick={handleSync} disabled={isSyncing} size="sm">
                        {isSyncing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Syncing...
                            </>
                        ) : (
                            'Sync All Data'
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isSynced && repository ? (
                    <div className="space-y-6">
                        {/* Repository Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{repository.stars}</div>
                                <div className="text-xs text-muted-foreground">Stars</div>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{repository.forks}</div>
                                <div className="text-xs text-muted-foreground">Forks</div>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{repository.watchers}</div>
                                <div className="text-xs text-muted-foreground">Watchers</div>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                                <div className="text-2xl font-bold">{repository.open_issues}</div>
                                <div className="text-xs text-muted-foreground">Issues</div>
                            </div>
                        </div>

                        {/* Sync Stats */}
                        {syncStats && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <Badge variant="outline" className="justify-center p-2">
                                    {syncStats.issues} Issues
                                </Badge>
                                <Badge variant="outline" className="justify-center p-2">
                                    {syncStats.pullRequests} Pull Requests
                                </Badge>
                                <Badge variant="outline" className="justify-center p-2">
                                    {syncStats.commits} Commits
                                </Badge>
                                <Badge variant="outline" className="justify-center p-2">
                                    {syncStats.releases} Releases
                                </Badge>
                                <Badge variant="outline" className="justify-center p-2">
                                    {syncStats.contributors} Contributors
                                </Badge>
                                <Badge variant="outline" className="justify-center p-2">
                                    {syncStats.branches} Branches
                                </Badge>
                            </div>
                        )}

                        {/* Repository Link */}
                        <div className="flex items-center justify-center">
                            <a
                                href={repository.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-primary hover:underline"
                            >
                                View on GitHub
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>

                        {/* Issues List */}
                        {issues.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg">Recent Issues</h3>
                                {issues.slice(0, 5).map((issue) => (
                                    <div
                                        key={issue.id}
                                        className="border rounded-lg p-4 hover:bg-accent transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <a
                                                        href={issue.html_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-semibold hover:underline flex items-center gap-1"
                                                    >
                                                        #{issue.number} {issue.title}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                    <Badge
                                                        variant={issue.state === 'open' ? 'default' : 'secondary'}
                                                    >
                                                        {issue.state}
                                                    </Badge>
                                                </div>
                                                {issue.body && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                        {issue.body}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    {issue.assignee && (
                                                        <span>Assigned to: {issue.assignee.login}</span>
                                                    )}
                                                    <span>
                                                        Updated: {format(new Date(issue.updated_at), 'MMM d, yyyy')}
                                                    </span>
                                                </div>
                                                {issue.labels.length > 0 && (
                                                    <div className="flex gap-1 mt-2">
                                                        {issue.labels.map((label, idx) => (
                                                            <Badge
                                                                key={idx}
                                                                variant="outline"
                                                                style={{
                                                                    borderColor: `#${label.color}`,
                                                                    color: `#${label.color}`,
                                                                }}
                                                            >
                                                                {label.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {issues.length > 5 && (
                                    <p className="text-sm text-muted-foreground text-center">
                                        Showing 5 of {issues.length} issues
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ) : isSynced && !repository ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No data found in this repository
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        Click "Sync All Data" to fetch repository information, issues, PRs, commits, releases, contributors, and branches
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

