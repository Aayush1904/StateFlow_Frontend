import { Mark } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface CommentOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        comment: {
            setComment: (commentId: string) => ReturnType;
            unsetComment: () => ReturnType;
        };
    }
}

export const Comment = Mark.create<CommentOptions>({
    name: 'comment',

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-comment-id]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'span',
            { ...this.options.HTMLAttributes, ...HTMLAttributes, 'data-comment-id': HTMLAttributes['data-comment-id'] },
            0,
        ];
    },

    addAttributes() {
        return {
            'data-comment-id': {
                default: null,
                parseHTML: (element) => element.getAttribute('data-comment-id'),
                renderHTML: (attributes) => {
                    if (!attributes['data-comment-id']) {
                        return {};
                    }
                    return {
                        'data-comment-id': attributes['data-comment-id'],
                    };
                },
            },
        };
    },

    addCommands() {
        return {
            setComment:
                (commentId: string) =>
                    ({ commands }) => {
                        return commands.setMark(this.name, { 'data-comment-id': commentId });
                    },
            unsetComment:
                () =>
                    ({ commands }) => {
                        return commands.unsetMark(this.name);
                    },
        };
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('comment'),
                props: {
                    decorations: (state) => {
                        const decorations: Decoration[] = [];
                        const { doc } = state;

                        // Add decorations for comment marks
                        doc.descendants((node, pos) => {
                            if (node.marks) {
                                node.marks.forEach((mark) => {
                                    if (mark.type.name === this.name && mark.attrs['data-comment-id']) {
                                        decorations.push(
                                            Decoration.inline(pos, pos + node.nodeSize, {
                                                class: 'comment-mark',
                                                'data-comment-id': mark.attrs['data-comment-id'],
                                            })
                                        );
                                    }
                                });
                            }
                        });

                        return DecorationSet.create(doc, decorations);
                    },
                },
            }),
        ];
    },
});

