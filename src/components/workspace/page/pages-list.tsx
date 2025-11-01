import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    FileText,
    Plus,
    Search,
    Eye,
    EyeOff,
    Edit,
    Trash2,
    Folder,
    Calendar
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import { getPagesByWorkspaceQueryFn, deletePageMutationFn } from '@/lib/api';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { isValidWorkspaceId } from '@/lib/workspace-utils';
import { ConfirmDialog } from '@/components/resuable/confirm-dialog';
import { motion } from 'framer-motion';

const PagesList: React.FC = () => {
    const workspaceId = useWorkspaceId();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; pageId: string; pageTitle: string }>({
        isOpen: false,
        pageId: '',
        pageTitle: '',
    });

    const isValid = isValidWorkspaceId(workspaceId);
    
    // Fetch pages
    const { data, isLoading } = useQuery({
        queryKey: ['pages', workspaceId],
        queryFn: () => getPagesByWorkspaceQueryFn({ workspaceId: workspaceId! }),
        enabled: isValid,
    });

    // Delete page mutation
    const { mutate: deletePage, isPending: isDeleting } = useMutation({
        mutationFn: deletePageMutationFn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pages', workspaceId] });
            toast({
                title: 'Success',
                description: 'Page deleted successfully',
                variant: 'success',
            });
            setDeleteDialog({ isOpen: false, pageId: '', pageTitle: '' });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const pages = data?.pages || [];

    // Filter pages based on search term
    const filteredPages = pages.filter((page: any) =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (pageId: string) => {
        if (!isValidWorkspaceId(workspaceId)) return;
        deletePage({ workspaceId: workspaceId!, pageId });
    };

    const openDeleteDialog = (pageId: string, pageTitle: string) => {
        setDeleteDialog({ isOpen: true, pageId, pageTitle });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading pages...</div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Folder className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">Pages</h2>
                    <Badge variant="secondary">{pages.length}</Badge>
                </div>
                <Link to={`/workspace/${workspaceId}/pages/new`}>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Page
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search pages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Pages Grid */}
            {filteredPages.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No pages found</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            {searchTerm
                                ? 'No pages match your search criteria.'
                                : 'Get started by creating your first page.'
                            }
                        </p>
                        {!searchTerm && (
                            <Link to={`/workspace/${workspaceId}/pages/new`}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Page
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPages.map((page: any, index: number) => (
                        <motion.div
                            key={page._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                        >
                            <Card className="hover:shadow-md transition-shadow h-full">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg line-clamp-2">
                                            <Link
                                                to={`/workspace/${workspaceId}/pages/${page._id}`}
                                                className="hover:text-primary transition-colors"
                                            >
                                                {page.title}
                                            </Link>
                                        </CardTitle>
                                        <Badge variant={page.isPublished ? 'default' : 'secondary'}>
                                            {page.isPublished ? (
                                                <>
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Published
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="h-3 w-3 mr-1" />
                                                    Draft
                                                </>
                                            )}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-3">
                                        {/* Content Preview */}
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {page.content.replace(/<[^>]*>/g, '') || 'No content yet...'}
                                        </p>

                                        {/* Metadata */}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(page.updatedAt), 'MMM d, yyyy')}
                                            </div>
                                            <div>
                                                by {page.updatedBy?.name || 'Unknown'}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 pt-2 border-t">
                                            <Link to={`/workspace/${workspaceId}/pages/${page._id}`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Edit className="h-3 w-3 mr-1" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openDeleteDialog(page._id, page.title)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                isLoading={isDeleting}
                onClose={() => setDeleteDialog({ isOpen: false, pageId: '', pageTitle: '' })}
                onConfirm={() => handleDelete(deleteDialog.pageId)}
                title="Delete Page"
                description={`Are you sure you want to delete "${deleteDialog.pageTitle}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default PagesList;
