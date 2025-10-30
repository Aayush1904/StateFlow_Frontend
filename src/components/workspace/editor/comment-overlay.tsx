import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { CommentBubble } from './comment-bubble';
import { CommentsPanel } from './comments-panel';
import { CommentType } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface CommentOverlayProps {
    editor: Editor | null;
    comments: CommentType[];
    onAddComment: (from: number, to: number, content: string) => void;
    onReply: (commentId: string, content: string) => void;
    onEdit: (commentId: string, content: string) => void;
    onDelete: (commentId: string) => void;
    onResolve: (commentId: string, resolved: boolean) => void;
    workspaceId: string;
    pageId: string;
}

export const CommentOverlay: React.FC<CommentOverlayProps> = ({
    editor,
    comments,
    onAddComment,
    onReply,
    onEdit,
    onDelete,
    onResolve,
    workspaceId,
    pageId,
}) => {
    const [selectedText, setSelectedText] = useState<{ from: number; to: number; position?: { top: number; left: number } } | null>(null);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [openCommentId, setOpenCommentId] = useState<string | null>(null);
    const [showCommentsPanel, setShowCommentsPanel] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!editor) return;

        const handleSelectionUpdate = () => {
            const { from, to } = editor.state.selection;
            if (from !== to) {
                try {
                    const coords = editor.view.coordsAtPos(from);
                    const editorRect = editor.view.dom.getBoundingClientRect();
                    setSelectedText({
                        from,
                        to,
                        position: {
                            top: coords.top - editorRect.top,
                            left: coords.left - editorRect.left,
                        },
                    });
                } catch (error) {
                    setSelectedText({ from, to });
                }
            } else {
                setSelectedText(null);
                setShowCommentForm(false);
            }
        };

        editor.on('selectionUpdate', handleSelectionUpdate);

        return () => {
            editor.off('selectionUpdate', handleSelectionUpdate);
        };
    }, [editor]);

    const handleAddComment = () => {
        if (selectedText && commentContent.trim()) {
            onAddComment(selectedText.from, selectedText.to, commentContent);
            setCommentContent('');
            setShowCommentForm(false);
            setSelectedText(null);
            editor?.commands.blur();
        }
    };

    const getCommentPosition = (comment: CommentType) => {
        if (!editor || !overlayRef.current) return { top: 0, left: 0 };

        try {
            // Get coordinates at the start position of the comment
            const coords = editor.view.coordsAtPos(comment.from);
            const editorElement = editor.view.dom;
            const editorRect = editorElement.getBoundingClientRect();
            const overlayRect = overlayRef.current.getBoundingClientRect();

            // Calculate position relative to viewport (for portal rendering)
            const viewportLeft = coords.right + 10; // Position to the right of the text
            const viewportTop = coords.top;

            // Ensure bubble doesn't go off-screen
            const bubbleWidth = 320; // 80 * 4 = 320px (w-80)
            const maxLeft = window.innerWidth - bubbleWidth - 20;
            const adjustedLeft = Math.min(viewportLeft, maxLeft);

            return {
                top: Math.max(20, viewportTop),
                left: adjustedLeft > 0 ? adjustedLeft : 20,
            };
        } catch (error) {
            console.error('Error calculating comment position:', error);
            return { top: 100, left: 100 };
        }
    };

    // Filter out resolved comments and group by position
    const activeComments = comments.filter((c) => !c.resolved);
    const resolvedComments = comments.filter((c) => c.resolved);

    // Apply comment marks to the editor content
    useEffect(() => {
        if (!editor || !comments.length) return;

        // Apply marks for active comments
        activeComments.forEach((comment) => {
            try {
                // Check if the comment range is valid
                const docLength = editor.state.doc.content.size;
                if (comment.from >= 0 && comment.to <= docLength && comment.from < comment.to) {
                    // Set comment mark at the specified range
                    editor
                        .chain()
                        .setTextSelection({ from: comment.from, to: comment.to })
                        .setComment(comment._id)
                        .setTextSelection(comment.to) // Move cursor back
                        .run();
                }
            } catch (error) {
                console.error('Error applying comment mark:', error, comment);
            }
        });
    }, [editor, activeComments]);

    // Handle clicks on comment marks
    useEffect(() => {
        if (!editor) return;

        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Check if we clicked inside a comment bubble or panel
            const clickedInBubble = target.closest('.comment-bubble') || target.closest('[class*="comment-bubble"]');
            const clickedInPanel = target.closest('[class*="CommentsPanel"]') || target.closest('[class*="comments-panel"]');

            if (clickedInBubble || clickedInPanel) {
                return; // Don't handle clicks inside bubbles/panels
            }

            const commentMark = target.closest('.comment-mark') as HTMLElement;

            if (commentMark) {
                const commentId = commentMark.getAttribute('data-comment-id');
                if (commentId) {
                    setOpenCommentId(commentId);
                    event.preventDefault();
                    event.stopPropagation();
                }
            } else {
                // Close bubble if clicking outside
                if (openCommentId) {
                    setOpenCommentId(null);
                }
            }
        };

        const editorElement = editor.view.dom;
        editorElement.addEventListener('click', handleClick, true); // Use capture phase

        return () => {
            editorElement.removeEventListener('click', handleClick, true);
        };
    }, [editor, openCommentId]);

    return (
        <div ref={overlayRef} className="absolute inset-0 pointer-events-none z-10">
            {/* Comment marks - rendered via decorations in Comment extension */}

            {/* Floating comment form for selected text */}
            {selectedText && showCommentForm && (
                <div
                    className="absolute bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
                    style={{
                        top: '20px',
                        right: '20px',
                        width: '300px',
                        pointerEvents: 'auto',
                    }}
                >
                    <h3 className="text-sm font-medium mb-2">Add Comment</h3>
                    <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="Write your comment..."
                        className="w-full min-h-[80px] p-2 border rounded mb-2 resize-none text-sm"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleAddComment}>
                            Add Comment
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                setShowCommentForm(false);
                                setCommentContent('');
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Show "Add Comment" button when text is selected */}
            {selectedText && !showCommentForm && selectedText.position && (
                <div
                    className="absolute z-50"
                    style={{
                        top: `${selectedText.position.top - 40}px`,
                        left: `${selectedText.position.left}px`,
                        pointerEvents: 'auto',
                    }}
                >
                    <Button
                        size="sm"
                        onClick={() => setShowCommentForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Add Comment
                    </Button>
                </div>
            )}

            {/* Comment bubbles */}
            {openCommentId && (
                <>
                    {activeComments
                        .filter((c) => c._id === openCommentId)
                        .map((comment) => {
                            const position = getCommentPosition(comment);
                            return (
                                <CommentBubble
                                    key={comment._id}
                                    comment={comment}
                                    position={position}
                                    onClose={() => setOpenCommentId(null)}
                                    onReply={onReply}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onResolve={onResolve}
                                />
                            );
                        })}
                </>
            )}

            {/* Comments list indicator */}
            {comments.length > 0 && (
                <div
                    className="absolute top-4 right-4 z-[60] pointer-events-auto"
                >
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setShowCommentsPanel(!showCommentsPanel);
                            if (showCommentsPanel) {
                                setOpenCommentId(null);
                            }
                        }}
                        className="bg-white shadow-md hover:bg-gray-50 border-gray-300"
                    >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {activeComments.length} {activeComments.length === 1 ? 'Comment' : 'Comments'}
                    </Button>
                </div>
            )}

            {/* Comments Panel */}
            <CommentsPanel
                comments={comments}
                onCommentClick={(comment) => {
                    setOpenCommentId(comment._id);
                    setShowCommentsPanel(false);
                    // Try to scroll to comment position
                    try {
                        if (editor) {
                            const coords = editor.view.coordsAtPos(comment.from);
                            editor.view.dom.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            editor.chain().setTextSelection({ from: comment.from, to: comment.to }).run();
                        }
                    } catch (error) {
                        console.error('Error navigating to comment:', error);
                    }
                }}
                onClose={() => setShowCommentsPanel(false)}
                isOpen={showCommentsPanel}
            />
        </div>
    );
};

