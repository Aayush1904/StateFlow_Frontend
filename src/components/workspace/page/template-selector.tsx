import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Sparkles, Calendar, Target, Users } from 'lucide-react';
import { getTemplatesByWorkspaceQueryFn } from '@/lib/api';

interface Template {
    _id: string;
    name: string;
    description?: string;
    category: string;
    isDefault: boolean;
}

interface TemplateSelectorProps {
    workspaceId: string;
    onSelectTemplate: (templateId: string | null) => void;
    selectedTemplateId?: string | null;
}

const categoryIcons: Record<string, React.ReactNode> = {
    'meeting-notes': <Users className="h-5 w-5" />,
    'sprint-retro': <Sparkles className="h-5 w-5" />,
    'daily-standup': <Calendar className="h-5 w-5" />,
    'project-plan': <Target className="h-5 w-5" />,
    'custom': <FileText className="h-5 w-5" />,
    'other': <FileText className="h-5 w-5" />,
};

const categoryLabels: Record<string, string> = {
    'meeting-notes': 'Meeting Notes',
    'sprint-retro': 'Sprint Retro',
    'daily-standup': 'Daily Standup',
    'project-plan': 'Project Plan',
    'custom': 'Custom',
    'other': 'Other',
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
    workspaceId,
    onSelectTemplate,
    selectedTemplateId,
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['templates', workspaceId, selectedCategory],
        queryFn: () => getTemplatesByWorkspaceQueryFn({ workspaceId, category: selectedCategory || undefined }),
    });

    const templates = data?.templates || [];
    const categories = Array.from(new Set(templates.map((t: Template) => t.category)));

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="py-8">
                    <p className="text-sm text-muted-foreground">Failed to load templates</p>
                </CardContent>
            </Card>
        );
    }

    const filteredTemplates = selectedCategory
        ? templates.filter((t: Template) => t.category === selectedCategory)
        : templates;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Choose a Template</CardTitle>
                <CardDescription>Start with a pre-built template or create a blank page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Category Filter */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <Button
                            variant={selectedCategory === null ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs sm:text-sm h-8 px-2 sm:px-3"
                            onClick={() => setSelectedCategory(null)}
                        >
                            All
                        </Button>
                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? 'default' : 'outline'}
                                size="sm"
                                className="text-xs sm:text-sm h-8 px-2 sm:px-3"
                                onClick={() => setSelectedCategory(category)}
                            >
                                {categoryLabels[category] || category}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Blank Page Option */}
                <div className="grid gap-2 sm:gap-3">
                    <Button
                        variant={selectedTemplateId === null ? 'default' : 'outline'}
                        className="w-full justify-start h-auto py-2 sm:py-3 px-3 sm:px-4"
                        onClick={() => onSelectTemplate(null)}
                    >
                        <div className="flex items-start gap-2 sm:gap-3 w-full">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 text-left min-w-0">
                                <div className="font-semibold text-sm sm:text-base">Blank Page</div>
                                <div className="text-xs sm:text-sm text-muted-foreground">Start with an empty page</div>
                            </div>
                        </div>
                    </Button>

                    {/* Template List */}
                    {filteredTemplates.map((template: Template) => (
                        <Button
                            key={template._id}
                            variant={selectedTemplateId === template._id ? 'default' : 'outline'}
                            className="w-full justify-start h-auto py-2 sm:py-3 px-3 sm:px-4"
                            onClick={() => onSelectTemplate(template._id)}
                        >
                            <div className="flex items-start gap-2 sm:gap-3 w-full">
                                {categoryIcons[template.category] || <FileText className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />}
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                        <span className="font-semibold text-sm sm:text-base">{template.name}</span>
                                        {template.isDefault && (
                                            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1 sm:px-2 py-0">
                                                Default
                                            </Badge>
                                        )}
                                    </div>
                                    {template.description && (
                                        <div className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{template.description}</div>
                                    )}
                                    <Badge variant="outline" className="mt-1 text-[10px] sm:text-xs px-1 sm:px-2 py-0">
                                        {categoryLabels[template.category] || template.category}
                                    </Badge>
                                </div>
                            </div>
                        </Button>
                    ))}

                    {filteredTemplates.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            No templates found. Choose "Blank Page" to create a new page.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

