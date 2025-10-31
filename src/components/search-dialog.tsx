import React, { useState, useEffect } from 'react';
import { useSearch } from '@/hooks/use-search';
import useWorkspaceId from '@/hooks/use-workspace-id';
import {
    CommandDialog,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { SearchResultType } from '@/lib/api';
import { FileText, CheckSquare, FolderKanban, ArrowRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const SearchDialog: React.FC<SearchDialogProps> = ({ open, onOpenChange }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<('page' | 'task' | 'project')[]>(['page', 'task', 'project']);
    const workspaceId = useWorkspaceId();
    const navigate = useNavigate();

    const { results, isLoading, error } = useSearch({
        workspaceId: workspaceId || '',
        query: searchQuery,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        enabled: open && searchQuery.trim().length > 0,
    });

    // Debug logging
    useEffect(() => {
        if (searchQuery.trim().length > 0) {
            console.log('SearchDialog - Search query:', searchQuery);
            console.log('SearchDialog - Workspace ID:', workspaceId);
            console.log('SearchDialog - Selected types:', selectedTypes);
            console.log('SearchDialog - Results:', results);
            console.log('SearchDialog - Results detail:', JSON.stringify(results, null, 2));
            console.log('SearchDialog - Loading:', isLoading);
            console.log('SearchDialog - Error:', error);

            // Group results for debugging
            const grouped = {
                page: results.filter((r) => r.type === 'page'),
                task: results.filter((r) => r.type === 'task'),
                project: results.filter((r) => r.type === 'project'),
            };
            console.log('SearchDialog - Grouped results:', grouped);
        }
    }, [searchQuery, workspaceId, selectedTypes, results, isLoading, error]);

    const handleSelect = (result: SearchResultType) => {
        if (result.type === 'page') {
            navigate(`/workspace/${workspaceId}/pages/${result.id}`);
        } else if (result.type === 'task' && result.project) {
            navigate(`/workspace/${workspaceId}/project/${result.project.id}`);
        } else if (result.type === 'project') {
            navigate(`/workspace/${workspaceId}/project/${result.id}`);
        }
        onOpenChange(false);
        setSearchQuery('');
    };

    const toggleType = (type: 'page' | 'task' | 'project') => {
        setSelectedTypes((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'page':
                return <FileText className="h-4 w-4" />;
            case 'task':
                return <CheckSquare className="h-4 w-4" />;
            case 'project':
                return <FolderKanban className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'done':
                return 'bg-green-100 text-green-800';
            case 'in progress':
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'todo':
            case 'pending':
                return 'bg-gray-100 text-gray-800';
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            '#f87171', '#fb923c', '#fbbf24', '#84cc16',
            '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
            '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getAvatarFallback = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Group results by type
    const groupedResults = {
        page: results.filter((r) => r.type === 'page'),
        task: results.filter((r) => r.type === 'task'),
        project: results.filter((r) => r.type === 'project'),
    };

    // Debug: Log grouped results
    if (results.length > 0 && searchQuery.trim().length > 0) {
        console.log('Grouped results for rendering:', groupedResults);
        console.log('Total results:', results.length);
        console.log('Page results:', groupedResults.page.length);
        console.log('Task results:', groupedResults.task.length);
        console.log('Project results:', groupedResults.project.length);
    }

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <Command className="rounded-lg border shadow-md" shouldFilter={false}>
                <CommandInput
                    placeholder="Search pages, tasks, and projects..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                />

                {/* Type filters */}
                {searchQuery.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 border-b">
                        <span className="text-xs text-muted-foreground">Filter:</span>
                        <div className="flex items-center gap-2">
                            {(['page', 'task', 'project'] as const).map((type) => (
                                <div key={type} className="flex items-center gap-1">
                                    <Checkbox
                                        checked={selectedTypes.includes(type)}
                                        onCheckedChange={() => toggleType(type)}
                                        id={type}
                                    />
                                    <label
                                        htmlFor={type}
                                        className="text-xs cursor-pointer capitalize flex items-center gap-1"
                                    >
                                        {getIcon(type)}
                                        {type}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <CommandList>
                    {error ? (
                        <CommandEmpty>
                            <div className="flex flex-col items-center gap-2 py-6">
                                <p className="text-sm text-red-600">Error searching: {error instanceof Error ? error.message : 'Unknown error'}</p>
                                <p className="text-xs text-muted-foreground">Check console for details</p>
                            </div>
                        </CommandEmpty>
                    ) : isLoading ? (
                        <CommandEmpty>Searching...</CommandEmpty>
                    ) : searchQuery.length === 0 ? (
                        <CommandEmpty>
                            <div className="flex flex-col items-center gap-2 py-6">
                                <Search className="h-8 w-8 text-muted-foreground opacity-50" />
                                <p className="text-sm text-muted-foreground">
                                    Start typing to search across pages, tasks, and projects
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                    {(['page', 'task', 'project'] as const).map((type) => (
                                        <Badge key={type} variant="outline" className="text-xs">
                                            {getIcon(type)}
                                            <span className="ml-1 capitalize">{type}</span>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CommandEmpty>
                    ) : results.length === 0 ? (
                        <CommandEmpty>No results found for &quot;{searchQuery}&quot;</CommandEmpty>
                    ) : (
                        <>
                            {groupedResults.project.length > 0 && (
                                <CommandGroup heading="Projects">
                                    {groupedResults.project.map((result) => (
                                        <CommandItem
                                            key={result.id}
                                            value={result.id}
                                            onSelect={() => handleSelect(result)}
                                            className="flex items-start gap-3 p-3 cursor-pointer"
                                        >
                                            <div className="mt-0.5">{getIcon(result.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium truncate">{result.title}</p>
                                                </div>
                                                {result.description && (
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {result.description}
                                                    </p>
                                                )}
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-50" />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {groupedResults.page.length > 0 && (
                                <CommandGroup heading="Pages">
                                    {groupedResults.page.map((result) => (
                                        <CommandItem
                                            key={result.id}
                                            value={result.id}
                                            onSelect={() => handleSelect(result)}
                                            className="flex items-start gap-3 p-3 cursor-pointer"
                                        >
                                            <div className="mt-0.5">{getIcon(result.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium truncate">{result.title}</p>
                                                    {result.project && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {result.project.emoji} {result.project.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {result.content && (
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {result.content.replace(/<[^>]*>/g, ' ').substring(0, 100)}...
                                                    </p>
                                                )}
                                                {result.metadata?.updatedAt && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Updated {formatDistanceToNow(new Date(result.metadata.updatedAt), { addSuffix: true })}
                                                    </p>
                                                )}
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-50" />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {groupedResults.task.length > 0 && (
                                <CommandGroup heading="Tasks">
                                    {groupedResults.task.map((result) => (
                                        <CommandItem
                                            key={result.id}
                                            value={result.id}
                                            onSelect={() => handleSelect(result)}
                                            className="flex items-start gap-3 p-3 cursor-pointer"
                                        >
                                            <div className="mt-0.5">{getIcon(result.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-medium truncate">{result.title}</p>
                                                    {result.project && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {result.project.emoji} {result.project.name}
                                                        </Badge>
                                                    )}
                                                    {result.metadata?.status && (
                                                        <Badge className={`text-xs ${getStatusColor(result.metadata.status)}`}>
                                                            {result.metadata.status}
                                                        </Badge>
                                                    )}
                                                    {result.metadata?.priority && (
                                                        <Badge className={`text-xs ${getStatusColor(result.metadata.priority)}`}>
                                                            {result.metadata.priority}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {result.description && (
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                        {result.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3 mt-2">
                                                    {result.metadata?.assignedTo && (
                                                        <div className="flex items-center gap-1">
                                                            <Avatar className="h-5 w-5">
                                                                <AvatarImage src={result.metadata.assignedTo.profilePicture} />
                                                                <AvatarFallback
                                                                    className="text-xs"
                                                                    style={{ backgroundColor: getAvatarColor(result.metadata.assignedTo.name) }}
                                                                >
                                                                    {getAvatarFallback(result.metadata.assignedTo.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-xs text-muted-foreground">
                                                                {result.metadata.assignedTo.name}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {result.metadata?.createdAt && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(result.metadata.createdAt), { addSuffix: true })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 opacity-50" />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </>
                    )}
                </CommandList>
            </Command>
        </CommandDialog>
    );
};

export default SearchDialog;

