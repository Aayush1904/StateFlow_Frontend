import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { aiAssistMutationFn } from '@/lib/api';

const AI_MENU_PLUGIN_KEY = new PluginKey('aiFloatingMenu');

interface AIMenuItem {
  title: string;
  icon: string;
  action: 'improve' | 'summarize' | 'rewrite';
  description?: string;
}

const AI_MENU_ITEMS: AIMenuItem[] = [
  {
    title: 'Improve',
    icon: '✨',
    action: 'improve',
    description: 'Improve clarity and grammar',
  },
  {
    title: 'Summarize',
    icon: '📝',
    action: 'summarize',
    description: 'Create a brief summary',
  },
  {
    title: 'Rewrite',
    icon: '🔄',
    action: 'rewrite',
    description: 'Make more concise',
  },
];

function createMenuElement(
  view: EditorView,
  items: AIMenuItem[],
  onClose: () => void
): HTMLElement {
  const menu = document.createElement('div');
  menu.className = 'ai-floating-menu';
  menu.style.cssText = `
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 200px;
    z-index: 9999;
  `;

  items.forEach((item) => {
    const button = document.createElement('button');
    button.className = 'ai-menu-item';
    button.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 4px;
      text-align: left;
      transition: background-color 0.15s;
      width: 100%;
    `;

    button.innerHTML = `
      <span style="font-size: 16px;">${item.icon}</span>
      <div style="flex: 1;">
        <div style="font-size: 14px; font-weight: 500; color: #111827;">${item.title}</div>
        ${item.description ? `<div style="font-size: 12px; color: #6b7280;">${item.description}</div>` : ''}
      </div>
    `;

    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#f3f4f6';
    });

    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'transparent';
    });

    button.addEventListener('click', async () => {
      const { state } = view;
      const { from, to } = state.selection;
      const selectedText = state.doc.textBetween(from, to, ' ');

      if (!selectedText) {
        alert('No text selected');
        onClose();
        return;
      }

      // Show loading state
      button.disabled = true;
      button.style.opacity = '0.6';
      button.style.cursor = 'wait';
      const originalHTML = button.innerHTML;
      button.innerHTML = `
        <span style="font-size: 16px;">⏳</span>
        <div style="flex: 1;">
          <div style="font-size: 14px; font-weight: 500; color: #111827;">Processing...</div>
        </div>
      `;

      try {
        const { result } = await aiAssistMutationFn({
          action: item.action,
          text: selectedText,
        });

        // Replace the selected text with the improved version
        const tr = state.tr.replaceWith(
          from,
          to,
          state.schema.text(result)
        );
        view.dispatch(tr);

        onClose();
      } catch (error: any) {
        alert(`AI request failed: ${error.message || 'Unknown error'}`);
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        button.innerHTML = originalHTML;
      }
    });

    menu.appendChild(button);
  });

  return menu;
}

export const AIFloatingMenu = Extension.create({
  name: 'aiFloatingMenu',

  addProseMirrorPlugins() {
    let popup: TippyInstance | null = null;
    let menuElement: HTMLElement | null = null;

    const hideMenu = () => {
      if (popup) {
        popup.destroy();
        popup = null;
      }
      if (menuElement) {
        menuElement.remove();
        menuElement = null;
      }
    };

    return [
      new Plugin({
        key: AI_MENU_PLUGIN_KEY,
        view() {
          return {
            update: (view, prevState) => {
              const { state } = view;
              const { selection } = state;
              const { from, to } = selection;

              // Check if there's a text selection (not just cursor)
              const hasSelection = from !== to;
              const hasText = hasSelection && state.doc.textBetween(from, to, ' ').trim().length > 0;

              // If no selection or selection changed, hide menu
              if (!hasSelection || !hasText) {
                hideMenu();
                return;
              }

              // If selection is new or changed significantly, show menu
              const prevSelection = prevState.selection;
              const selectionChanged = 
                prevSelection.from !== from || 
                prevSelection.to !== to;

              if (selectionChanged && hasText) {
                // Small delay to avoid flickering
                setTimeout(() => {
                  // Check if selection is still valid
                  const currentSelection = view.state.selection;
                  if (currentSelection.from === from && currentSelection.to === to) {
                    hideMenu();

                    // Create menu element
                    menuElement = createMenuElement(view, AI_MENU_ITEMS, hideMenu);

                    // Get coordinates for the selection
                    const coords = view.coordsAtPos(to);

                    // Create tippy popup
                    popup = tippy(document.body, {
                      getReferenceClientRect: () => ({
                        width: 0,
                        height: 0,
                        top: coords.top,
                        bottom: coords.bottom,
                        left: coords.left,
                        right: coords.right,
                        x: coords.left,
                        y: coords.top,
                        toJSON: () => ({}),
                      }),
                      appendTo: () => document.body,
                      content: menuElement,
                      showOnCreate: true,
                      interactive: true,
                      trigger: 'manual',
                      placement: 'bottom-start',
                      arrow: false,
                      offset: [0, 8],
                      hideOnClick: true,
                      onClickOutside: hideMenu,
                    });
                  }
                }, 100);
              }
            },
            destroy: () => {
              hideMenu();
            },
          };
        },
      }),
    ];
  },
});

