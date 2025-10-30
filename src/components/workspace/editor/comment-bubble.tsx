import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, X, Check, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { CommentType } from '@/lib/api';
import { useAuthContext } from '@/context/auth-provider';

interface CommentBubbleProps {
    comment: CommentType;
    position: { top: number; left: number };
    onClose: () => void;
    onReply: (commentId: string, content: string) => void;
    onEdit: (commentId: string, content: string) => void;
    onDelete: (commentId: string) => void;
    onResolve: (commentId: string, resolved: boolean) => void;
}

export const CommentBubble: React.FC<CommentBubbleProps> = ({
    comment,
    position,
    onClose,
    onReply,
    onEdit,
    onDelete,
    onResolve,
}) => {
    const { user } = useAuthContext();
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [editContent, setEditContent] = useState(comment.content);
    const isCurrentUser = user?._id === comment.userId._id;

    const handleReply = () => {
        if (replyContent.trim()) {
            onReply(comment._id, replyContent);
            setReplyContent('');
            setIsReplying(false);
        }
    };

    const handleEdit = () => {
        if (editContent.trim()) {
            onEdit(comment._id, editContent);
            setIsEditing(false);
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
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return createPortal(
        <div
            className="fixed z-[100] w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-h-[400px] overflow-y-auto pointer-events-auto comment-bubble"
            style={{
                top: `${Math.max(20, position.top)}px`,
                left: `${position.left}px`,
                maxWidth: 'calc(100vw - 40px)',
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Avatar className="h-7 w-7 flex-shrink-0">
                        <AvatarImage src={comment.userId.profilePicture || undefined} />
                        <AvatarFallback
                            className="text-xs"
                            style={{ backgroundColor: getAvatarColor(comment.userId.name) }}
                        >
                            {getAvatarFallback(comment.userId.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{comment.userId.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0 ml-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {isEditing ? (
                <div className="space-y-2">
                    <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[80px] text-sm"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit();
                            }}
                            className="flex-1"
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Save
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(false);
                                setEditContent(comment.content);
                            }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                <>
                    <p className="text-sm text-gray-800 mb-3 whitespace-pre-wrap break-words">{comment.content}</p>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {comment.resolved && (
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1 px-2 py-1 bg-green-50 rounded-full">
                                <Check className="h-3 w-3" />
                                Resolved
                            </span>
                        )}
                        {comment.replies && comment.replies.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {!comment.resolved && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsReplying(true);
                                }}
                                className="text-xs h-7"
                            >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Reply
                            </Button>
                        )}
                        {isCurrentUser && (
                            <>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsEditing(true);
                                    }}
                                    className="text-xs h-7"
                                >
                                    <Edit2 className="h-3 w-3 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(comment._id);
                                    }}
                                    className="text-xs h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                </Button>
                            </>
                        )}
                        {!comment.resolved && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onResolve(comment._id, true);
                                }}
                                className="text-xs h-7 text-green-600 border-green-200 hover:bg-green-50"
                            >
                                <Check className="h-3 w-3 mr-1" />
                                Resolve
                            </Button>
                        )}
                    </div>

                    {isReplying && (
                        <div className="mt-3 space-y-2 border-t pt-3">
                            <Textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="min-h-[80px] text-sm"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleReply();
                                    }}
                                    className="flex-1"
                                >
                                    Reply
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsReplying(false);
                                        setReplyContent('');
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 space-y-3 border-t pt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Replies</p>
                            {comment.replies.map((reply) => (
                                <div key={reply._id} className="flex gap-2">
                                    <Avatar className="h-6 w-6 flex-shrink-0">
                                        <AvatarImage src={reply.userId.profilePicture || undefined} />
                                        <AvatarFallback
                                            className="text-xs"
                                            style={{ backgroundColor: getAvatarColor(reply.userId.name) }}
                                        >
                                            {getAvatarFallback(reply.userId.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-xs font-medium">{reply.userId.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-700 break-words">{reply.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>,
        document.body
    );
};

