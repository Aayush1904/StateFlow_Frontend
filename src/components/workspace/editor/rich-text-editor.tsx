import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Mention from '@tiptap/extension-mention';
import { useMentionExtension } from './mention-extension';
import { SlashCommand } from './slash-command-extension';
import { Comment } from './comment-extension';
import { AIFloatingMenu } from './ai-floating-menu';
import { AIAutocomplete, AIAutocompleteIndicator } from './ai-autocomplete-extension';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Minus,
    Link as LinkIcon,
    Image as ImageIcon,
    CheckSquare,
    Code2,
    Undo,
    Redo,
    Save,
    Mic,
    MicOff,
    Loader2,
    Wand2,
    AlertCircle
} from 'lucide-react';

import { cn } from '@/lib/utils';
import EditorToolbar from './editor-toolbar';
import LiveCursors from './live-cursors';
import PresenceIndicator from './presence-indicator';
import { CommentOverlay } from './comment-overlay';
import { CommentsPanel } from './comments-panel';
import { useCollaboration, WhiteboardStroke } from '@/hooks/use-collaboration';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { useComments } from '@/hooks/use-comments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import WhiteboardModal from './whiteboard-modal';
import { aiAssistMutationFn } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface RichTextEditorProps {
    content?: string;
    onUpdate?: (content: string) => void;
    onSave?: (content: string) => void;
    placeholder?: string;
    className?: string;
    editable?: boolean;
    autoSave?: boolean;
    autoSaveDelay?: number;
    pageId?: string;
    enableCollaboration?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    content = '',
    onUpdate,
    onSave,
    placeholder = 'Start writing...',
    className,
    editable = true,
    autoSave = true,
    autoSaveDelay = 2000,
    pageId,
    enableCollaboration = false,
}) => {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [aiAutocompleteEnabled, setAiAutocompleteEnabled] = useState(false);
    const workspaceId = useWorkspaceId();

    // Initialize comments if pageId is provided
    const comments = useComments({
        workspaceId: workspaceId || '',
        pageId: pageId || '',
    });

    // Get token from localStorage
    const [token, setToken] = useState<string>('');
    const recognitionConstructorRef = useRef<any>(null);
    const recognitionRef = useRef<any>(null);
    const [isVoiceSupported, setIsVoiceSupported] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [localWhiteboardStrokes, setLocalWhiteboardStrokes] = useState<WhiteboardStroke[]>([]);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryContent, setSummaryContent] = useState<string | null>(null);
    const [summaryTimestamp, setSummaryTimestamp] = useState<Date | null>(null);
    const [conflictFlash, setConflictFlash] = useState(false);
    const isApplyingRemoteUpdate = React.useRef(false);
    const [dictationError, setDictationError] = useState<string | null>(null);
    
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            console.log('[Editor] Token retrieved from localStorage, length:', storedToken.length);
        } else {
            console.warn('[Editor] No token found in localStorage');
        }
    }, []);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionConstructorRef.current = SpeechRecognition;
            setIsVoiceSupported(true);
        } else {
            setIsVoiceSupported(false);
            setDictationError('Voice dictation is only available in Chromium-based browsers such as Chrome or Edge.');
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const handleWhiteboardOpen = () => setIsWhiteboardOpen(true);
        window.addEventListener('editor-open-whiteboard', handleWhiteboardOpen);
        return () => window.removeEventListener('editor-open-whiteboard', handleWhiteboardOpen);
    }, []);

    useEffect(() => {
        setLocalWhiteboardStrokes([]);
    }, [pageId]);

    // Initialize collaboration if enabled
    const collaboration = useCollaboration({
        workspaceId: workspaceId || '',
        pageId: pageId || '',
        token: token,
    });

    // Log collaboration state
    useEffect(() => {
        console.log('[Editor] Collaboration state:', {
            enableCollaboration,
            isConnected: collaboration.isConnected,
            hasSocket: !!collaboration.socket,
            hasSendFn: !!collaboration.sendDocumentUpdate,
            workspaceId,
            pageId,
            tokenLength: token.length
        });
    }, [enableCollaboration, collaboration.isConnected, collaboration.socket, workspaceId, pageId, token]);

    const mentionOptions = useMentionExtension();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline cursor-pointer',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg',
                },
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Mention.configure(mentionOptions),
            SlashCommand,
            Comment,
            AIFloatingMenu,
            AIAutocomplete.configure({
                enabled: aiAutocompleteEnabled,
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onUpdate?.(html);

            if (enableCollaboration && collaboration.sendDocumentUpdate && !isApplyingRemoteUpdate.current) {
                console.log('[Editor] Sending local update to other users', {
                    hasCollaboration: !!collaboration,
                    hasSendFn: !!collaboration.sendDocumentUpdate,
                    contentLength: html.length
                });
                collaboration.sendDocumentUpdate({
                    type: 'update',
                    content: html,
                });
            } else if (isApplyingRemoteUpdate.current) {
                console.log('[Editor] Skipping send (applying remote update)');
            } else if (!enableCollaboration) {
                console.log('[Editor] Collaboration not enabled');
            }
        },
        onSelectionUpdate: ({ editor }) => {
            if (!enableCollaboration) return;
            const { from, to } = editor.state.selection;
            const coords = editor.view.coordsAtPos(from);
            collaboration.sendCursorUpdate?.({
                x: coords.left,
                y: coords.top,
                selection: { from, to },
            });
            collaboration.sendSelectionUpdate?.({ from, to });
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
                    'min-h-[200px] p-4 border rounded-lg',
                    className
                ),
            },
        },
    });

    const startDictation = useCallback(() => {
        if (!recognitionConstructorRef.current) {
            setDictationError('Voice dictation is not supported in this browser. Try Chrome or Edge instead.');
            return;
        }

        if (isListening) return;

        try {
            const recognition = new recognitionConstructorRef.current();
            recognition.lang = navigator.language || 'en-US';
            recognition.continuous = true;
            recognition.interimResults = true;
            setDictationError(null);

            recognition.onresult = (event: any) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i += 1) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        transcript += result[0]?.transcript || '';
                    }
                }

                if (transcript.trim()) {
                    editor?.chain().focus().insertContent(`${transcript.trim()} `).run();
                }
            };

            recognition.onerror = (error: any) => {
                console.error('[Editor] Speech recognition error:', error);
                const errorType = error?.error || 'unknown';
                const networkState = navigator.onLine ? 'online' : 'offline';
                const detailedMessage = (() => {
                    switch (errorType) {
                        case 'network':
                            return `Speech recognition could not reach the speech service. (Network status: ${networkState}). If you are online, make sure you are using HTTPS or localhost and try again.`;
                        case 'not-allowed':
                            return 'Microphone access was denied. Please grant permission in your browser settings and try again.';
                        case 'service-not-allowed':
                            return 'Speech services are blocked for this origin. Ensure your site is served over HTTPS or use Chrome on desktop.';
                        case 'no-speech':
                            return 'No speech was detected. Try speaking again after clicking the mic.';
                        case 'audio-capture':
                            return 'No microphone was found. Please connect a microphone and try again.';
                        default:
                            return error?.message || 'Microphone access failed. Please check permissions and try again.';
                    }
                })();
                try {
                    recognition.stop();
                } catch (stopError) {
                    console.warn('[Editor] Failed to stop recognition after error', stopError);
                }
                setDictationError(detailedMessage);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
            setIsListening(true);
        } catch (error: any) {
            console.error('[Editor] Failed to start dictation', error);
            setDictationError(error?.message || 'Unable to start dictation. Check microphone permissions and try again.');
        }
    }, [editor, isListening]);

    const stopDictation = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.error('[Editor] Failed to stop dictation', error);
            }
            recognitionRef.current = null;
        }
        setIsListening(false);
    }, []);

    const toggleDictation = useCallback(() => {
        if (isListening) {
            stopDictation();
        } else {
            startDictation();
        }
    }, [isListening, startDictation, stopDictation]);

    const displayedWhiteboardStrokes = useMemo(() => (
        enableCollaboration ? collaboration.whiteboardStrokes : localWhiteboardStrokes
    ), [enableCollaboration, collaboration.whiteboardStrokes, localWhiteboardStrokes]);

    const handleWhiteboardStroke = useCallback((stroke: WhiteboardStroke) => {
        if (enableCollaboration && pageId) {
            collaboration.sendWhiteboardStroke(stroke);
        } else {
            setLocalWhiteboardStrokes(prev => [...prev, stroke]);
        }
    }, [collaboration, enableCollaboration, pageId]);

    const handleWhiteboardClear = useCallback(() => {
        if (enableCollaboration && pageId) {
            collaboration.sendWhiteboardClear();
        } else {
            setLocalWhiteboardStrokes([]);
        }
    }, [collaboration, enableCollaboration, pageId]);

    const handleSummarize = useCallback(async () => {
        if (!editor) return;
        const text = editor.getText().trim();

        if (!text) {
            toast({
                title: 'Nothing to summarize',
                description: 'Add some content to the page before requesting a summary.',
            });
            return;
        }

        try {
            setIsSummarizing(true);
            const { result } = await aiAssistMutationFn({ action: 'summarize', text });
            setSummaryContent(result.trim());
            setSummaryTimestamp(new Date());
        } catch (error: any) {
            console.error('[Editor] Summarize error', error);
            toast({
                title: 'Unable to summarize',
                description: error?.response?.data?.message || error?.message || 'Unexpected error while generating the summary.',
                variant: 'destructive',
            });
        } finally {
            setIsSummarizing(false);
        }
    }, [editor]);

    // Update editor content when content prop changes
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [editor, content]);

    // Update AI Autocomplete extension when toggle changes
    useEffect(() => {
        if (editor) {
            console.log('Updating AI Autocomplete enabled:', aiAutocompleteEnabled);
            // Use the custom command to update the extension
            (editor.commands as any).setAIAutocomplete(aiAutocompleteEnabled);
        }
    }, [editor, aiAutocompleteEnabled]);

    // Listen for collaboration updates and flash conflict indicator
    useEffect(() => {
        if (!editor || !enableCollaboration) {
            console.log('[Editor] Collaboration listener not attached:', { hasEditor: !!editor, enableCollaboration });
            return;
        }

        console.log('[Editor] Attaching collaboration listener, currentUserId:', collaboration.currentUserId, 'currentSocketId:', collaboration.currentSocketId);

        const handleCollaborationUpdate = (event: CustomEvent) => {
            const { content: newContent, userId, socketId } = event.detail as { content: string; userId: string; socketId?: string };

            console.log('[Editor] Collaboration update event received:', { 
                fromUserId: userId, 
                currentUserId: collaboration.currentUserId,
                fromSocketId: socketId,
                currentSocketId: collaboration.currentSocketId,
                contentLength: newContent?.length,
                willApply: socketId ? socketId !== collaboration.currentSocketId : userId !== collaboration.currentUserId
            });

            // Don't apply updates emitted from this socket
            if (socketId && socketId === collaboration.currentSocketId) {
                console.log('[Editor] Ignoring update from same socket');
                return;
            }

            // Fallback: don't apply updates from ourselves if socket id missing
            if (!socketId && userId === collaboration.currentUserId) {
                console.log('[Editor] Ignoring update from self (fallback)');
                return;
            }

            // Apply the update to the editor
            if (newContent && newContent !== editor.getHTML()) {
                console.log('[Editor] Applying remote update to editor');
                
                // Set flag to prevent sending this update back
                isApplyingRemoteUpdate.current = true;
                
                // If local selection exists, flash subtle conflict indicator
                const sel = editor.state.selection;
                const hadSelection = sel.from !== sel.to;
                
                // Preserve cursor position if possible
                const currentPos = editor.state.selection.from;
                editor.commands.setContent(newContent, false);
                
                // Try to restore cursor position
                if (currentPos <= editor.state.doc.content.size) {
                    editor.commands.setTextSelection(currentPos);
                }
                
                if (hadSelection) {
                    setConflictFlash(true);
                    setTimeout(() => setConflictFlash(false), 600);
                }
                
                // Reset flag after a brief delay
                setTimeout(() => {
                    isApplyingRemoteUpdate.current = false;
                    console.log('[Editor] Remote update applied, ready to send local changes');
                }, 100);
            } else {
                console.log('[Editor] Skipping apply - content unchanged or empty');
            }
        };

        window.addEventListener('collaboration-update', handleCollaborationUpdate as EventListener);

        return () => {
            window.removeEventListener('collaboration-update', handleCollaborationUpdate as EventListener);
        };
    }, [editor, enableCollaboration, collaboration.currentUserId, collaboration.currentSocketId]);

    // Auto-save functionality
    useEffect(() => {
        if (!autoSave || !editor || !onSave) return;

        const timeoutId = setTimeout(() => {
            if (editor.getHTML() !== content) {
                setIsSaving(true);
                onSave(editor.getHTML());
                setLastSaved(new Date());
                setTimeout(() => setIsSaving(false), 1000);
            }
        }, autoSaveDelay);

        return () => clearTimeout(timeoutId);
    }, [editor?.getHTML(), autoSave, autoSaveDelay, onSave, content]);

    const handleSave = useCallback(() => {
        if (!editor || !onSave) return;

        setIsSaving(true);
        onSave(editor.getHTML());
        setLastSaved(new Date());
        setTimeout(() => setIsSaving(false), 1000);
    }, [editor, onSave]);

    const formattedSummaryTime = summaryTimestamp ? summaryTimestamp.toLocaleTimeString() : null;
    const voiceDictationTitle = isVoiceSupported
        ? (isListening ? 'Stop voice dictation' : 'Start voice dictation')
        : 'Voice dictation is not supported in this browser.';
    const voiceDictationDisabled = !isVoiceSupported && !isListening;

    if (!editor) {
        return <div className="animate-pulse bg-muted h-48 rounded-lg" />;
    }

    return (
        <div className={`border rounded-lg bg-background ${conflictFlash ? 'ring-2 ring-amber-400' : ''}`}>
            {/* Presence Indicator */}
            {enableCollaboration && (
                <div className="p-2 border-b bg-muted/50">
                    <PresenceIndicator
                        connectedUsers={collaboration.connectedUsers}
                        isConnected={collaboration.isConnected}
                    />
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center border-b bg-muted/30 max-w-full">
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <EditorToolbar editor={editor} />
                </div>
                
                {/* Utility Controls */}
                <div className="flex items-center justify-center sm:justify-end gap-2 border-t sm:border-t-0 sm:border-l p-2 sm:px-3 flex-shrink-0">
                    <AIAutocompleteIndicator
                        enabled={aiAutocompleteEnabled}
                        onToggle={() => setAiAutocompleteEnabled(!aiAutocompleteEnabled)}
                    />
                    <Button
                        variant={isListening ? 'default' : 'ghost'}
                        size="sm"
                        onClick={toggleDictation}
                        disabled={voiceDictationDisabled}
                        title={voiceDictationTitle}
                        className="flex items-center gap-1"
                    >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        <span className="text-xs font-medium hidden sm:inline">{isListening ? 'Stop' : 'Dictate'}</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSummarize}
                        disabled={isSummarizing}
                        className="flex items-center gap-1"
                    >
                        {isSummarizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                        <span className="text-xs font-medium hidden sm:inline">{isSummarizing ? 'Summarizing…' : 'Summarize'}</span>
                    </Button>
                </div>
            </div>

            <div className="px-3 sm:px-4 pt-1 text-[11px] sm:text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>Dictation works best in Chrome/Edge over HTTPS or localhost.</span>
                {dictationError && (
                    <span className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {dictationError}
                    </span>
                )}
            </div>

            {/* Editor Content */}
            <div className="relative">
                <EditorContent
                    editor={editor}
                    className="min-h-[200px] p-4 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                />

                {/* Comment Overlay */}
                {pageId && workspaceId && editable && (
                    <CommentOverlay
                        editor={editor}
                        comments={comments.comments}
                        onAddComment={comments.createComment}
                        onReply={(commentId, content) =>
                            comments.createComment(0, 0, content, commentId)
                        }
                        onEdit={comments.updateComment}
                        onDelete={comments.deleteComment}
                        onResolve={comments.resolveComment}
                        workspaceId={workspaceId}
                        pageId={pageId}
                    />
                )}

                {/* Live Cursors */}
                {enableCollaboration && (
                    <LiveCursors
                        cursors={collaboration.cursors}
                        connectedUsers={collaboration.connectedUsers}
                    />
                )}

                {/* Auto-save indicator */}
                {autoSave && (
                    <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                        {isSaving ? (
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                Saving...
                            </span>
                        ) : lastSaved ? (
                            <span>Saved {lastSaved.toLocaleTimeString()}</span>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Manual save button */}
            {onSave && !autoSave && (
                <div className="p-2 border-t bg-muted/50">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        size="sm"
                        className="w-full"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            )}

            {summaryContent && (
                <Card className="m-4 mt-6 border-primary/30 bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                            <Wand2 className="h-4 w-4 text-primary" />
                            AI Summary
                        </CardTitle>
                        {formattedSummaryTime && (
                            <span className="text-xs text-muted-foreground">Generated at {formattedSummaryTime}</span>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                        {summaryContent.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </CardContent>
                </Card>
            )}

            <WhiteboardModal
                open={isWhiteboardOpen}
                onClose={() => setIsWhiteboardOpen(false)}
                strokes={displayedWhiteboardStrokes}
                onStroke={handleWhiteboardStroke}
                onClear={handleWhiteboardClear}
            />
        </div>
    );
};

export default RichTextEditor;
