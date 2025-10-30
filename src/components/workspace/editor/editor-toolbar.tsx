import React, { useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
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
    AlignLeft,
    AlignCenter,
    AlignRight,
    Table,
    Table2,
    Plus,
    Trash2,
    AtSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
    editor: Editor;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
    const [isInTable, setIsInTable] = useState(false);

    useEffect(() => {
        if (!editor) return;

        const updateTableState = () => {
            setIsInTable(editor.isActive('table'));
        };

        // Update on selection changes
        editor.on('selectionUpdate', updateTableState);
        updateTableState(); // Initial check

        return () => {
            editor.off('selectionUpdate', updateTableState);
        };
    }, [editor]);

    if (!editor) return null;

    const ToolbarButton = ({
        onClick,
        isActive = false,
        disabled = false,
        children,
        title
    }: {
        onClick: () => void;
        isActive?: boolean;
        disabled?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <Button
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                'h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0',
                isActive && 'bg-primary text-primary-foreground'
            )}
        >
            {children}
        </Button>
    );

    const addImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const addColumnBefore = () => {
        editor.chain().focus().addColumnBefore().run();
    };

    const addColumnAfter = () => {
        editor.chain().focus().addColumnAfter().run();
    };

    const deleteColumn = () => {
        editor.chain().focus().deleteColumn().run();
    };

    const addRowBefore = () => {
        editor.chain().focus().addRowBefore().run();
    };

    const addRowAfter = () => {
        editor.chain().focus().addRowAfter().run();
    };

    const deleteRow = () => {
        editor.chain().focus().deleteRow().run();
    };

    const deleteTable = () => {
        editor.chain().focus().deleteTable().run();
    };

    return (
        <div className="flex items-center gap-0.5 sm:gap-1 p-1.5 sm:p-2 overflow-x-auto overflow-y-hidden min-w-0 w-full toolbar-scroll">
            {/* Undo/Redo */}
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo"
            >
                <Undo className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo"
            >
                <Redo className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1" />

            {/* Text Formatting */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
            >
                <Bold className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
            >
                <Italic className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive('code')}
                title="Inline Code"
            >
                <Code className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1" />

            {/* Headings */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
            >
                <Heading1 className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
            >
                <Heading2 className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive('heading', { level: 3 })}
                title="Heading 3"
            >
                <Heading3 className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1" />

            {/* Lists */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Numbered List"
            >
                <ListOrdered className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                isActive={editor.isActive('taskList')}
                title="Task List"
            >
                <CheckSquare className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1" />

            {/* Block Elements */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Quote"
            >
                <Quote className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive('codeBlock')}
                title="Code Block"
            >
                <Code2 className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                title="Horizontal Rule"
            >
                <Minus className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1" />

            {/* Mentions */}
            <ToolbarButton
                onClick={() => editor.chain().focus().insertContent('@').run()}
                title="Mention User (@)"
            >
                <AtSign className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1" />

            {/* Media */}
            <ToolbarButton
                onClick={addLink}
                title="Add Link"
            >
                <LinkIcon className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={addImage}
                title="Add Image"
            >
                <ImageIcon className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1" />

            {/* Tables */}
            <ToolbarButton
                onClick={addTable}
                title="Insert Table"
            >
                <Table className="h-4 w-4" />
            </ToolbarButton>

            {/* Table editing controls - only show when cursor is in a table */}
            {isInTable && (
                <>
                    <Separator orientation="vertical" className="h-5 sm:h-6 mx-0.5 sm:mx-1" />
                    <ToolbarButton
                        onClick={addColumnAfter}
                        title="Add Column After"
                    >
                        <Plus className="h-4 w-4" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={deleteColumn}
                        title="Delete Column"
                    >
                        <Trash2 className="h-4 w-4" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={addRowAfter}
                        title="Add Row After"
                    >
                        <Plus className="h-4 w-4" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={deleteRow}
                        title="Delete Row"
                    >
                        <Trash2 className="h-4 w-4" />
                    </ToolbarButton>

                    <ToolbarButton
                        onClick={deleteTable}
                        title="Delete Table"
                    >
                        <Table2 className="h-4 w-4" />
                    </ToolbarButton>
                </>
            )}
        </div>
    );
};

export default EditorToolbar;
