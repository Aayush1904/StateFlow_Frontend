import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    History,
    Clock,
    User,
    RotateCcw,
    GitCompare,
    Plus,
    Eye,
    Calendar,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
    getPageVersionsQueryFn,
    createPageVersionMutationFn,
    restorePageVersionMutationFn,
    comparePageVersionsQueryFn,
} from '@/lib/api';
import useWorkspaceId from '@/hooks/use-workspace-id';

interface PageVersionHistoryProps {
    pageId: string;
    onVersionRestore?: () => void;
}

const PageVersionHistory: React.FC<PageVersionHistoryProps> = ({ pageId, onVersionRestore }) => {
    const workspaceId = useWorkspaceId();
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false);
    const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
    const [changeDescription, setChangeDescription] = useState('');

    // Fetch page versions
    const { data: versionsData, isLoading } = useQuery({
        queryKey: ['pageVersions', workspaceId, pageId],
        queryFn: () => getPageVersionsQueryFn({ workspaceId, pageId }),
        enabled: !!pageId,
    });

    const versions = versionsData?.versions || [];

    // Create version mutation
    const { mutate: createVersion, isPending: isCreatingVersion } = useMutation({
        mutationFn: createPageVersionMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pageVersions', workspaceId, pageId] });
            setIsCreateDialogOpen(false);
            setChangeDescription('');
            toast({
                title: 'Version created',
                description: 'A new version has been created successfully.',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create version',
                variant: 'destructive',
            });
        },
    });

    // Restore version mutation
    const { mutate: restoreVersion, isPending: isRestoring } = useMutation({
        mutationFn: restorePageVersionMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pageVersions', workspaceId, pageId] });
            queryClient.invalidateQueries({ queryKey: ['page', workspaceId, pageId] });
            onVersionRestore?.();
            toast({
                title: 'Version restored',
                description: 'The page has been restored to the selected version.',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to restore version',
                variant: 'destructive',
            });
        },
    });

    // Compare versions query
    const { data: compareData, isLoading: isComparing } = useQuery({
        queryKey: ['compareVersions', workspaceId, pageId, selectedVersions[0], selectedVersions[1]],
        queryFn: () => comparePageVersionsQueryFn({
            workspaceId,
            pageId,
            versionId1: selectedVersions[0],
            versionId2: selectedVersions[1],
        }),
        enabled: selectedVersions.length === 2,
    });

    const handleCreateVersion = () => {
        createVersion({
            workspaceId,
            pageId,
            data: { changeDescription: changeDescription || undefined },
        });
    };

    const handleRestoreVersion = (versionId: string) => {
        restoreVersion({ workspaceId, pageId, versionId });
    };

    const handleVersionSelect = (versionId: string) => {
        if (selectedVersions.includes(versionId)) {
            setSelectedVersions(selectedVersions.filter(id => id !== versionId));
        } else if (selectedVersions.length < 2) {
            setSelectedVersions([...selectedVersions, versionId]);
        } else {
            setSelectedVersions([selectedVersions[1], versionId]);
        }
    };

    const canCompare = selectedVersions.length === 2;

    return (
        <div className="w-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Version History</h3>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Version
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Version</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">Change Description (Optional)</label>
                                    <Textarea
                                        placeholder="Describe what changed in this version..."
                                        value={changeDescription}
                                        onChange={(e) => setChangeDescription(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsCreateDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateVersion}
                                        disabled={isCreatingVersion}
                                    >
                                        {isCreatingVersion ? 'Creating...' : 'Create Version'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {canCompare && (
                        <Dialog open={isCompareDialogOpen} onOpenChange={setIsCompareDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <GitCompare className="h-4 w-4 mr-2" />
                                    Compare
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>Compare Versions</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    {isComparing ? (
                                        <div className="text-center py-8">Loading comparison...</div>
                                    ) : compareData ? (
                                        <div className="space-y-4">
                                            <div className="flex gap-2">
                                                {compareData.titleChanged && (
                                                    <Badge variant="destructive">Title Changed</Badge>
                                                )}
                                                {compareData.contentChanged && (
                                                    <Badge variant="destructive">Content Changed</Badge>
                                                )}
                                                {!compareData.titleChanged && !compareData.contentChanged && (
                                                    <Badge variant="secondary">No Changes</Badge>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-medium mb-2">Version {compareData.version1.version}</h4>
                                                    <div className="border rounded p-3 bg-gray-50">
                                                        <div dangerouslySetInnerHTML={{ __html: compareData.version1.content }} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium mb-2">Version {compareData.version2.version}</h4>
                                                    <div className="border rounded p-3 bg-gray-50">
                                                        <div dangerouslySetInnerHTML={{ __html: compareData.version2.content }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            Select two versions to compare
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Versions List */}
            <ScrollArea className="h-96">
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="text-center py-8">Loading versions...</div>
                    ) : versions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No versions found. Create your first version to get started.
                        </div>
                    ) : (
                        versions.map((version: any) => (
                            <Card key={version._id} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline">v{version.version}</Badge>
                                            {version.version === versions[0]?.version && (
                                                <Badge variant="default">Current</Badge>
                                            )}
                                        </div>

                                        <div className="space-y-1 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span>{version.createdBy?.name || 'Unknown User'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>{format(new Date(version.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                                            </div>
                                            {version.changeDescription && (
                                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                                    {version.changeDescription}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleVersionSelect(version._id)}
                                            className={selectedVersions.includes(version._id) ? 'bg-blue-50' : ''}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>

                                        {version.version !== versions[0]?.version && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRestoreVersion(version._id)}
                                                disabled={isRestoring}
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Selection Info */}
            {selectedVersions.length > 0 && (
                <div className="text-sm text-gray-600">
                    {selectedVersions.length === 1 ? (
                        <span>1 version selected. Select another to compare.</span>
                    ) : (
                        <span>2 versions selected. Click Compare to see differences.</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default PageVersionHistory;
