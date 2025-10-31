import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { MentionOptions } from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import useGetWorkspaceMembers from '@/hooks/api/use-get-workspace-members';
import useWorkspaceId from '@/hooks/use-workspace-id';
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper';

interface MentionListProps {
    items: any[];
    command: (item: any) => void;
}

interface MentionListRef {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Debug logging
    console.log('MentionList - props.items:', props.items);
    console.log('MentionList - props.items.length:', props.items?.length);

    const selectItem = (index: number) => {
        const item = props.items[index];
        if (item) {
            props.command(item);
        }
    };

    const upHandler = () => {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
            if (event.key === 'ArrowUp') {
                upHandler();
                return true;
            }

            if (event.key === 'ArrowDown') {
                downHandler();
                return true;
            }

            if (event.key === 'Enter') {
                enterHandler();
                return true;
            }

            return false;
        },
    }));

    return (
        <Card className="max-h-60 overflow-y-auto">
            <CardContent className="p-2">
                {props.items.length ? (
                    props.items.map((item, index) => (
                        <div
                            key={item.id}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted ${index === selectedIndex ? 'bg-muted' : ''
                                }`}
                            onClick={() => selectItem(index)}
                        >
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={item.avatar} />
                                <AvatarFallback
                                    className="text-xs"
                                    style={{ backgroundColor: getAvatarColor(item.label) }}
                                >
                                    {getAvatarFallbackText(item.label)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{item.label}</span>
                                <span className="text-xs text-muted-foreground">{item.email}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center p-4">
                        <span className="text-sm text-muted-foreground">
                            {props.items.length === 0 ? 'No members found' : 'Loading members...'}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

MentionList.displayName = 'MentionList';

export const useMentionExtension = (): MentionOptions => {
    const workspaceId = useWorkspaceId();
    const { data: membersData, isLoading, error } = useGetWorkspaceMembers(workspaceId);
    const members = membersData?.members || [];

    // Debug logging
    console.log('Mention Extension - workspaceId:', workspaceId);
    console.log('Mention Extension - membersData:', membersData);
    console.log('Mention Extension - members:', members);
    console.log('Mention Extension - isLoading:', isLoading);
    console.log('Mention Extension - error:', error);

    // Don't return early - always provide a working configuration
    // The items function will handle empty members gracefully

    return {
        renderHTML: () => ['span', { class: 'mention' }, 0],
        deleteTriggerWithBackspace: true,
        suggestions: [],
        HTMLAttributes: {
            class: 'mention',
        },
        renderText({ node }) {
            return `@${node.attrs.label ?? node.attrs.id}`;
        },
        suggestion: {
            char: '@',
            items: ({ query }: { query: string }) => {
                console.log('Mention Extension - items query:', query);
                console.log('Mention Extension - members for filtering:', members);
                console.log('Mention Extension - members length:', members.length);

                // Check if members array is properly populated
                if (!members || members.length === 0) {
                    console.warn('Mention Extension - No members available for filtering');
                    return [];
                }

                // Map members to the expected format
                const mappedMembers = members.map((member: any) => {
                    console.log('Mention Extension - mapping member:', member);
                    return {
                        id: member.userId?._id || member.userId?.id,
                        label: member.userId?.name || 'Unknown',
                        email: member.userId?.email || '',
                        avatar: member.userId?.profilePicture || null,
                    };
                });

                console.log('Mention Extension - mapped members:', mappedMembers);

                if (!query) {
                    const result = mappedMembers.slice(0, 10);
                    console.log('Mention Extension - no query result:', result);
                    return result;
                }

                const filtered = mappedMembers
                    .filter((member: any) => {
                        const name = member.label || '';
                        const email = member.email || '';
                        return (
                            name.toLowerCase().includes(query.toLowerCase()) ||
                            email.toLowerCase().includes(query.toLowerCase())
                        );
                    })
                    .slice(0, 10);

                console.log('Mention Extension - filtered result:', filtered);
                return filtered;
            },
            render: () => {
                let component: ReactRenderer<MentionListRef>;
                let popup: any[];

                return {
                    onStart: (props: any) => {
                        // Destroy existing popup if it exists
                        if (popup && popup[0]) {
                            popup[0].destroy();
                        }
                        if (component) {
                            component.destroy();
                        }

                        component = new ReactRenderer(MentionList, {
                            props,
                            editor: props.editor,
                        });

                        if (!props.clientRect) {
                            return;
                        }

                        popup = tippy('body', {
                            getReferenceClientRect: props.clientRect,
                            appendTo: () => document.body,
                            content: component.element,
                            showOnCreate: true,
                            interactive: true,
                            trigger: 'manual',
                            placement: 'bottom-start',
                            hideOnClick: false,
                        });
                    },

                    onUpdate(props: any) {
                        if (component) {
                            component.updateProps(props);
                        }

                        if (!props.clientRect || !popup || !popup[0]) {
                            return;
                        }

                        popup[0].setProps({
                            getReferenceClientRect: props.clientRect,
                        });
                    },

                    onKeyDown(props: any) {
                        if (props.event.key === 'Escape') {
                            if (popup && popup[0]) {
                                popup[0].hide();
                            }
                            return true;
                        }

                        return component?.ref?.onKeyDown(props) ?? false;
                    },

                    onExit() {
                        if (popup && popup[0]) {
                            popup[0].destroy();
                        }
                        if (component) {
                            component.destroy();
                        }
                        popup = null as any;
                        component = null as any;
                    },
                };
            },
        },
    };
};
