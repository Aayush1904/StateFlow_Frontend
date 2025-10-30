import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { RichTextEditor } from '@/components/workspace/editor';
import { createPageMutationFn, getTemplateByIdQueryFn, getTemplatesByWorkspaceQueryFn } from '@/lib/api';
import useWorkspaceId from '@/hooks/use-workspace-id';
import Breadcrumbs, { useBreadcrumbs } from '@/components/ui/breadcrumbs';
import { TemplateSelector } from './template-selector';
import { markdownToHTML } from '@/lib/markdown';

const NewPageEditor: React.FC = () => {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const workspaceIdFromHook = useWorkspaceId();
    const { getNewPageBreadcrumbs } = useBreadcrumbs();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [suggestedTemplateId, setSuggestedTemplateId] = useState<string | null>(null);
    const [showTemplateSelector, setShowTemplateSelector] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch template content when a template is selected
    const { data: templateData } = useQuery({
        queryKey: ['template', workspaceIdFromHook, selectedTemplateId],
        queryFn: () => getTemplateByIdQueryFn({ workspaceId: workspaceIdFromHook, templateId: selectedTemplateId! }),
        enabled: !!selectedTemplateId && !showTemplateSelector,
    });

    const { data: templatesData } = useQuery({
        queryKey: ['templates-all', workspaceIdFromHook],
        queryFn: () => getTemplatesByWorkspaceQueryFn({ workspaceId: workspaceIdFromHook }),
    });

    // Update content when template is loaded
    useEffect(() => {
        if (templateData?.template && selectedTemplateId && !showTemplateSelector) {
            // Convert markdown to HTML for the editor
            const htmlContent = markdownToHTML(templateData.template.content);
            setContent(htmlContent);
            if (!title && templateData.template.name) {
                setTitle(templateData.template.name);
            }
        }
    }, [templateData, selectedTemplateId, showTemplateSelector, title]);

    // Smart suggestion based on title keywords
    useEffect(() => {
        if (!title || !templatesData?.templates) return;
        const titleLower = title.toLowerCase();
        const keywordToMatch = [
            { key: 'retrospective', hints: ['retro', 'retrospective', 'sprint retro'] },
            { key: 'meeting', hints: ['meeting', 'meeting notes'] },
            { key: 'standup', hints: ['standup', 'daily'] },
            { key: 'project plan', hints: ['plan', 'project plan'] },
        ];
        let match: any = null;
        for (const entry of keywordToMatch) {
            if (entry.hints.some(h => titleLower.includes(h))) {
                match = templatesData.templates.find((t: any) =>
                    t.name?.toLowerCase().includes(entry.key) || t.category?.toLowerCase().includes(entry.key)
                );
                if (match) break;
            }
        }
        if (match && match._id !== selectedTemplateId) {
            setSuggestedTemplateId(match._id);
        } else {
            setSuggestedTemplateId(null);
        }
    }, [title, templatesData, selectedTemplateId]);

    const applySuggestedTemplate = async () => {
        if (!suggestedTemplateId) return;
        const res = await getTemplateByIdQueryFn({ workspaceId: workspaceIdFromHook, templateId: suggestedTemplateId });
        const html = markdownToHTML(res.template.content || '');
        setContent(html);
        setSelectedTemplateId(suggestedTemplateId);
        setSuggestedTemplateId(null);
        toast({ title: 'Template applied', description: `Applied suggested template.` });
    };

    const { mutate: createPage } = useMutation({
        mutationFn: createPageMutationFn,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['pages', workspaceIdFromHook] });
            toast({
                title: 'Success',
                description: 'Page created successfully',
                variant: 'success',
            });
            navigate(`/workspace/${workspaceId}/pages`);
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create page',
                variant: 'destructive',
            });
            setIsSaving(false);
        },
    });

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
        createPage({
            workspaceId: workspaceIdFromHook,
            data: {
                title: title.trim(),
                content,
                isPublished: false,
                templateId: selectedTemplateId || undefined,
            },
        });
    };

    const handleBack = () => {
        navigate(`/workspace/${workspaceId}/pages`);
    };

    const handleTemplateSelect = (templateId: string | null) => {
        setSelectedTemplateId(templateId);
        setShowTemplateSelector(false);
    };

    const handleBackToTemplates = () => {
        setShowTemplateSelector(true);
        setSelectedTemplateId(null);
        setContent('');
        setTitle('');
    };

    if (showTemplateSelector) {
        return (
            <div className="w-full h-full flex-col space-y-4 sm:space-y-6 pt-3 px-2 sm:px-0">
                {/* Breadcrumbs */}
                <Breadcrumbs items={getNewPageBreadcrumbs()} />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <Button variant="ghost" size="sm" onClick={handleBack} className="w-fit">
                            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            <span className="text-sm sm:text-base">Back to Pages</span>
                        </Button>
                        <h1 className="text-xl sm:text-2xl font-bold">Create New Page</h1>
                    </div>
                </div>

                {/* Template Selector */}
                <TemplateSelector
                    workspaceId={workspaceIdFromHook}
                    onSelectTemplate={handleTemplateSelect}
                    selectedTemplateId={selectedTemplateId}
                />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex-col space-y-4 sm:space-y-6 pt-3 px-2 sm:px-0">
            {/* Breadcrumbs */}
            <Breadcrumbs items={getNewPageBreadcrumbs()} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <Button variant="ghost" size="sm" onClick={handleBackToTemplates} className="w-fit">
                        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        <span className="text-sm sm:text-base">Back to Templates</span>
                    </Button>
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground hidden sm:block" />
                    <h1 className="text-xl sm:text-2xl font-bold">Create New Page</h1>
                </div>
                <Button onClick={handleSave} disabled={isSaving || !title.trim()} className="w-full sm:w-auto" size="sm">
                    <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span className="text-sm sm:text-base">{isSaving ? 'Creating...' : 'Create Page'}</span>
                </Button>
            </div>

            {/* Page Editor */}
            <Card>
                <CardHeader>
                    <CardTitle>Page Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {suggestedTemplateId && (
                        <div className="flex items-center justify-between border rounded-md p-2 text-sm">
                            <span>Suggested template detected from title.</span>
                            <Button size="sm" onClick={applySuggestedTemplate}>Apply</Button>
                        </div>
                    )}
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
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default NewPageEditor;
