import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import tippy, { Instance as TippyInstance } from 'tippy.js';

interface SlashCommandItem {
    title: string;
    description: string;
    command: (props: any) => void;
}

export const SlashCommand = Extension.create({
    name: 'slashCommand',

    addOptions() {
        console.log('SlashCommand extension options created');
        return {
            suggestion: {
                char: '/',
                command: ({ editor, range, props }: any) => {
                    // The suggestion API should handle replacing the trigger character
                    // But we need to ensure the slash is deleted before executing the command
                    // TipTap's suggestion handles this automatically, but we'll ensure it works
                    const { from, to } = range;

                    // Delete the slash and execute command
                    editor.chain()
                        .focus()
                        .deleteRange({ from, to })
                        .run();

                    // Execute the command
                    props.command();
                },
                items: ({ query, editor }: { query: string; editor: any }) => {
                    console.log('Items function called with editor:', editor);
                    
                    const items: SlashCommandItem[] = [
                        {
                            title: 'Heading 1',
                            description: 'Big section heading',
                            command: () => {
                                console.log('Executing Heading 1 command');
                                editor.chain()
                                    .focus()
                                    .setHeading({ level: 1 })
                                    .insertContent('Heading 1')
                                    .run();
                            },
                        },
                        {
                            title: 'Heading 2',
                            description: 'Medium section heading',
                            command: () => {
                                console.log('Executing Heading 2 command');
                                editor.chain()
                                    .focus()
                                    .setHeading({ level: 2 })
                                    .insertContent('Heading 2')
                                    .run();
                            },
                        },
                        {
                            title: 'Heading 3',
                            description: 'Small section heading',
                            command: () => {
                                console.log('Executing Heading 3 command');
                                editor.chain()
                                    .focus()
                                    .setHeading({ level: 3 })
                                    .insertContent('Heading 3')
                                    .run();
                            },
                        },
                        {
                            title: 'Draw Board',
                            description: 'Open a collaborative whiteboard',
                            command: () => {
                                console.log('Executing Draw Board command');
                                window.dispatchEvent(new CustomEvent('editor-open-whiteboard'));
                            },
                        },
                        {
                            title: 'Table',
                            description: 'Insert a table',
                            command: () => {
                                console.log('Executing Table command');
                                // Insert table with proper formatting
                                editor.chain()
                                    .focus()
                                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                                    .run();
                            },
                        },
                        {
                            title: 'Todo List',
                            description: 'Create a todo list',
                            command: () => {
                                console.log('Executing Todo List command');
                                editor.chain()
                                    .focus()
                                    .toggleTaskList()
                                    .insertContent('Task 1')
                                    .run();
                            },
                        },
                        {
                            title: 'Bullet List',
                            description: 'Create a bullet list',
                            command: () => {
                                console.log('Executing Bullet List command');
                                editor.chain()
                                    .focus()
                                    .toggleBulletList()
                                    .insertContent('List item 1')
                                    .run();
                            },
                        },
                        {
                            title: 'Numbered List',
                            description: 'Create a numbered list',
                            command: () => {
                                console.log('Executing Numbered List command');
                                editor.chain()
                                    .focus()
                                    .toggleOrderedList()
                                    .insertContent('Item 1')
                                    .run();
                            },
                        },
                        {
                            title: 'Quote',
                            description: 'Insert a quote',
                            command: () => {
                                console.log('Executing Quote command');
                                editor.chain()
                                    .focus()
                                    .toggleBlockquote()
                                    .insertContent('Quote text')
                                    .run();
                            },
                        },
                        {
                            title: 'Code Block',
                            description: 'Insert a code block',
                            command: () => {
                                console.log('Executing Code Block command');
                                editor.chain()
                                    .focus()
                                    .toggleCodeBlock()
                                    .insertContent('// Your code here')
                                    .run();
                            },
                        },
                        {
                            title: 'Divider',
                            description: 'Insert a horizontal divider',
                            command: () => {
                                console.log('Executing Divider command');
                                editor.chain()
                                    .focus()
                                    .setHorizontalRule()
                                    .run();
                            },
                        },
                    ];

                    const filteredItems = items.filter(item =>
                        item.title.toLowerCase().includes(query.toLowerCase()) ||
                        item.description.toLowerCase().includes(query.toLowerCase())
                    );

                    console.log('Filtered items:', filteredItems);
                    return filteredItems;
                },
                render: () => {
                    let component: any;
                    let popup: TippyInstance[];
                    let selectedIndex = 0;

                    return {
                        onStart: (props: any) => {
                            console.log('Slash command started', props);

                            // Create a simple HTML element for the suggestion menu
                            const element = document.createElement('div');
                            element.className = 'slash-command-list bg-white border border-gray-200 rounded-lg shadow-lg p-1 max-h-80 overflow-y-auto w-64';

                            // Render items
                            const renderItems = (items: SlashCommandItem[]) => {
                                element.innerHTML = '';
                                selectedIndex = 0;

                                items.forEach((item, index) => {
                                    const button = document.createElement('button');
                                    button.className = `slash-command-item w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors text-left ${index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''
                                        }`;
                                    button.innerHTML = `
                                        <div class="slash-command-icon text-gray-600 text-lg font-bold">${item.title.charAt(0)}</div>
                                        <div class="slash-command-content flex-1">
                                            <div class="slash-command-title font-medium text-gray-900">${item.title}</div>
                                            <div class="slash-command-description text-sm text-gray-500">${item.description}</div>
                                        </div>
                                    `;

                                    button.addEventListener('click', (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('Slash command clicked', item);
                                        console.log('Button element:', button);
                                        console.log('Item command:', item.command);

                                        try {
                                            item.command();
                                            console.log('Command executed successfully');
                                        } catch (error) {
                                            console.error('Error executing command:', error);
                                        }

                                        if (popup && popup[0]) {
                                            popup[0].hide();
                                        }
                                    });

                                    // Also add mousedown event as backup
                                    button.addEventListener('mousedown', (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('Slash command mousedown', item);

                                        try {
                                            item.command();
                                            console.log('Command executed successfully via mousedown');
                                        } catch (error) {
                                            console.error('Error executing command via mousedown:', error);
                                        }

                                        if (popup && popup[0]) {
                                            popup[0].hide();
                                        }
                                    });

                                    element.appendChild(button);
                                });

                                // Update selection highlighting
                                updateSelection();
                            };

                            const updateSelection = () => {
                                const buttons = element.querySelectorAll('.slash-command-item');
                                buttons.forEach((button, index) => {
                                    if (index === selectedIndex) {
                                        button.classList.add('bg-blue-50', 'border-blue-200');
                                        button.classList.remove('hover:bg-gray-50');
                                    } else {
                                        button.classList.remove('bg-blue-50', 'border-blue-200');
                                        button.classList.add('hover:bg-gray-50');
                                    }
                                });
                            };

                            const selectItem = () => {
                                const items = props.items;
                                console.log('selectItem called, items:', items, 'selectedIndex:', selectedIndex);

                                if (items && items[selectedIndex]) {
                                    console.log('Selecting item', items[selectedIndex]);

                                    try {
                                        items[selectedIndex].command();
                                        console.log('Command executed successfully via selectItem');
                                    } catch (error) {
                                        console.error('Error executing command via selectItem:', error);
                                    }

                                    if (popup && popup[0]) {
                                        popup[0].hide();
                                    }
                                } else {
                                    console.error('No item found at index', selectedIndex, 'items:', items);
                                }
                            };

                            renderItems(props.items);

                            if (!props.clientRect) {
                                console.log('No clientRect provided');
                                return;
                            }

                            popup = tippy('body', {
                                getReferenceClientRect: props.clientRect,
                                appendTo: () => document.body,
                                content: element,
                                showOnCreate: true,
                                interactive: true,
                                trigger: 'manual',
                                placement: 'bottom-start',
                            });

                            component = {
                                element,
                                renderItems,
                                updateSelection,
                                selectItem,
                                setSelectedIndex: (index: number) => {
                                    selectedIndex = index;
                                    updateSelection();
                                }
                            };
                        },

                        onUpdate(props: any) {
                            if (component) {
                                component.renderItems(props.items);
                            }

                            if (!props.clientRect) {
                                return;
                            }

                            popup[0].setProps({
                                getReferenceClientRect: props.clientRect,
                            });
                        },

                        onKeyDown(props: any) {
                            console.log('Key pressed:', props.event.key);

                            if (props.event.key === 'Escape') {
                                popup[0].hide();
                                return true;
                            }

                            if (props.event.key === 'ArrowUp') {
                                if (component && props.items) {
                                    selectedIndex = (selectedIndex + props.items.length - 1) % props.items.length;
                                    component.setSelectedIndex(selectedIndex);
                                }
                                return true;
                            }

                            if (props.event.key === 'ArrowDown') {
                                if (component && props.items) {
                                    selectedIndex = (selectedIndex + 1) % props.items.length;
                                    component.setSelectedIndex(selectedIndex);
                                }
                                return true;
                            }

                            if (props.event.key === 'Enter') {
                                if (component) {
                                    component.selectItem();
                                }
                                return true;
                            }

                            return false;
                        },

                        onExit() {
                            popup[0].destroy();
                            component.element.remove();
                        },
                    };
                },
            },
        };
    },

    addProseMirrorPlugins() {
        console.log('SlashCommand extension plugins created');
        return [
            Suggestion({
                editor: this.editor,
                ...this.options.suggestion,
            }),
        ];
    },
});