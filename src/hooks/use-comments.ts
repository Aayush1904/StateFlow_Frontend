import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCommentsByPageQueryFn,
  createCommentMutationFn,
  updateCommentMutationFn,
  deleteCommentMutationFn,
  resolveCommentMutationFn,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseCommentsParams {
  workspaceId: string;
  pageId: string;
}

export const useComments = ({ workspaceId, pageId }: UseCommentsParams) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch comments
  const {
    data: commentsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['comments', workspaceId, pageId],
    queryFn: () => getCommentsByPageQueryFn({ workspaceId, pageId }),
    enabled: !!workspaceId && !!pageId,
  });

  const comments = commentsData?.comments || [];

  // Create comment
  const createCommentMutation = useMutation({
    mutationFn: createCommentMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', workspaceId, pageId] });
      toast({
        title: 'Comment created',
        description: 'Your comment has been added.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to create comment',
        variant: 'destructive',
      });
    },
  });

  // Update comment
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateCommentMutationFn({
        workspaceId,
        commentId,
        data: { content },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', workspaceId, pageId] });
      toast({
        title: 'Comment updated',
        description: 'Your comment has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update comment',
        variant: 'destructive',
      });
    },
  });

  // Delete comment
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      deleteCommentMutationFn({
        workspaceId,
        commentId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', workspaceId, pageId] });
      toast({
        title: 'Comment deleted',
        description: 'Your comment has been deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete comment',
        variant: 'destructive',
      });
    },
  });

  // Resolve comment
  const resolveCommentMutation = useMutation({
    mutationFn: ({ commentId, resolved }: { commentId: string; resolved: boolean }) =>
      resolveCommentMutationFn({
        workspaceId,
        commentId,
        resolved,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', workspaceId, pageId] });
      toast({
        title: 'Comment resolved',
        description: 'The comment has been marked as resolved.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to resolve comment',
        variant: 'destructive',
      });
    },
  });

  const createComment = (from: number, to: number, content: string, parentCommentId?: string) => {
    createCommentMutation.mutate({
      workspaceId,
      pageId,
      data: { content, from, to, parentCommentId },
    });
  };

  const updateComment = (commentId: string, content: string) => {
    updateCommentMutation.mutate({ commentId, content });
  };

  const deleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };

  const resolveComment = (commentId: string, resolved: boolean) => {
    resolveCommentMutation.mutate({ commentId, resolved });
  };

  return {
    comments,
    isLoading,
    error,
    createComment,
    updateComment,
    deleteComment,
    resolveComment,
    isCreating: createCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
    isResolving: resolveCommentMutation.isPending,
  };
};

