import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, History } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/workspace/editor';
import { getPageByIdQueryFn, updatePageMutationFn } from '@/lib/api';
import useWorkspaceId from '@/hooks/use-workspace-id';
import Breadcrumbs, { useBreadcrumbs } from '@/components/ui/breadcrumbs';
import PageVersionHistory from './page-version-history';

const PageEditor: React.FC = () => {
    const { workspaceId, pageId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const workspaceIdFromHook = useWorkspaceId();
    const { getPageBreadcrumbs } = useBreadcrumbs();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    

    // Fetch page data
    const { data, isLoading } = useQuery({
        queryKey: ['page', workspaceIdFromHook, pageId],
        queryFn: () => getPageByIdQueryFn({ workspaceId: workspaceIdFromHook, pageId: pageId! }),
        enabled: !!pageId,
    });

    const { mutate: updatePage } = useMutation({
        mutationFn: updatePageMutationFn,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['page', workspaceIdFromHook, pageId] });
            queryClient.invalidateQueries({ queryKey: ['pages', workspaceIdFromHook] });
            toast({
                title: 'Success',
                description: 'Page updated successfully',
                variant: 'success',
            });
            setIsSaving(false);
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
            setIsSaving(false);
        },
    });

    // Update local state when page data loads
    useEffect(() => {
        if (data?.page) {
            setTitle(data.page.title);
            setContent(data.page.content || '');
        }
    }, [data]);

    const handleSave = () => {
        if (!title.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a page title',
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);
        updatePage({
            workspaceId: workspaceIdFromHook,
            pageId: pageId!,
            data: {
                title: title.trim(),
                content,
            },
        });
    };

    const handleBack = () => {
        navigate(`/workspace/${workspaceId}/pages`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading page...</div>
            </div>
        );
    }

    if (!data?.page) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Page not found</div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex-col space-y-4 sm:space-y-6 pt-3 px-2 sm:px-0">
            {/* Breadcrumbs */}
            <Breadcrumbs items={getPageBreadcrumbs(title)} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <Button variant="ghost" size="sm" onClick={handleBack} className="w-fit">
                        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        <span className="text-sm sm:text-base">Back to Pages</span>
                    </Button>
                    <h1 className="text-xl sm:text-2xl font-bold">Edit Page</h1>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowVersionHistory(!showVersionHistory)}
                            className="w-full sm:w-auto"
                        >
                            <History className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            <span className="text-sm sm:text-base">Version History</span>
                        </Button>
                        </div>
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving || !title.trim()}
                        size="sm"
                        className="w-full sm:w-auto"
                    >
                        <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        <span className="text-sm sm:text-base">{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative">
                <div className={`flex gap-6 ${showVersionHistory ? 'lg:grid lg:grid-cols-3' : ''}`}>
                    {/* Page Editor */}
                    <div className={`${showVersionHistory ? 'hidden lg:block lg:col-span-2' : 'w-full'}`}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Page Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Title Input */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Page Title</label>
                                    <Input
                                        placeholder="Enter page title..."
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="text-lg"
                                    />
                                </div>

                                {/* Rich Text Editor */}
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Content</label>
                                    <RichTextEditor
                                        content={content}
                                        onUpdate={setContent}
                                        placeholder="Start writing your page content..."
                                        className="min-h-[400px]"
                                        pageId={pageId}
                                        enableCollaboration={true}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

            

                    {/* Version History Sidebar - Full screen on mobile, sidebar on desktop */}
                    {showVersionHistory && (
                        <div className="fixed inset-0 z-50 bg-background lg:relative lg:inset-auto lg:z-auto lg:col-span-1 lg:bg-transparent">
                            <div className="h-full overflow-auto">
                                <Card className="h-full lg:h-auto">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Version History</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowVersionHistory(false)}
                                            className="lg:hidden"
                                        >
                                            ✕
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <PageVersionHistory
                                            pageId={pageId!}
                                            onVersionRestore={() => {
                                                // Refresh page data when version is restored
                                                queryClient.invalidateQueries({ queryKey: ['page', workspaceIdFromHook, pageId] });
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
        </div>
    );
};

export default PageEditor;