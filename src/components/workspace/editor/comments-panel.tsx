import React from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { CommentType } from '@/lib/api';

interface CommentsPanelProps {
    comments: CommentType[];
    onCommentClick: (comment: CommentType) => void;
    onClose: () => void;
    isOpen: boolean;
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({
    comments,
    onCommentClick,
    onClose,
    isOpen,
}) => {
    const activeComments = comments.filter((c) => !c.resolved);
    const resolvedComments = comments.filter((c) => c.resolved);

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
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-[90]"
                    onClick={onClose}
                />
            )}

            {/* Comments Panel */}
            <div
                className={`fixed top-0 right-0 w-80 h-full bg-white border-l shadow-xl z-[100] flex flex-col transition-transform duration-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <h3 className="font-semibold flex items-center gap-2 text-base">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Comments ({activeComments.length})
                    </h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="h-8 w-8 hover:bg-gray-200 rounded-full"
                        aria-label="Close comments panel"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </Button>
                </div>

                <ScrollArea className="flex-1 p-4">
                    {activeComments.length === 0 && resolvedComments.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No comments yet</p>
                            <p className="text-xs mt-1">Select text to add a comment</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeComments.length > 0 && (
                                <>
                                    <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                                        Active Comments
                                    </h4>
                                    {activeComments.map((comment) => (
                                        <div
                                            key={comment._id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onCommentClick(comment);
                                            }}
                                            className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all"
                                        >
                                            <div className="flex items-start gap-2 mb-2">
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
                                                    <p className="text-sm font-medium truncate">{comment.userId.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 line-clamp-3 break-words">{comment.content}</p>
                                            {comment.replies && comment.replies.length > 0 && (
                                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                                    <MessageSquare className="h-3 w-3" />
                                                    {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}

                            {resolvedComments.length > 0 && (
                                <>
                                    <h4 className="text-xs font-semibold text-muted-foreground mb-3 mt-6 uppercase tracking-wide">
                                        Resolved Comments
                                    </h4>
                                    {resolvedComments.map((comment) => (
                                        <div
                                            key={comment._id}
                                            className="p-3 border rounded-lg opacity-60"
                                        >
                                            <div className="flex items-start gap-2 mb-2">
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
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium truncate">{comment.userId.name}</p>
                                                        <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 line-clamp-3 break-words">{comment.content}</p>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </>,
        document.body
    );
};

