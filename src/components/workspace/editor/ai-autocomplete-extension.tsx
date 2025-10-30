import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { aiAssistMutationFn } from '@/lib/api';

const AI_AUTOCOMPLETE_PLUGIN_KEY = new PluginKey('aiAutocomplete');

interface AutocompleteState {
  suggestion: string;
  position: number;
  isLoading: boolean;
}

let debounceTimer: NodeJS.Timeout | null = null;
let currentSuggestion: string = '';
let suggestionPosition: number = -1;
let isGenerating: boolean = false;

// Function to get AI suggestion based on context
async function getAISuggestion(context: string): Promise<string> {
  if (context.trim().length < 10) {
    return ''; // Don't suggest if there's too little context
  }

  try {
    const { AI_API } = await import('@/lib/axios-client');
    
    // Get last 200 characters for context
    const textContext = context.slice(-200);
    
    const response = await AI_API.post('/ai/assist', {
      action: 'complete',
      text: textContext,
    });
    
    return response.data.result || '';
  } catch (error) {
    console.error('AI autocomplete error:', error);
    return '';
  }
}

export const AIAutocomplete = Extension.create({
  name: 'aiAutocomplete',

  addOptions() {
    return {
      debounceMs: 3000, // Wait 3 seconds after user stops typing (to avoid rate limits)
      minChars: 20, // Minimum 20 characters before suggesting (to avoid unnecessary calls)
      enabled: false, // Start disabled by default
    };
  },

  addStorage() {
    return {
      enabled: this.options.enabled,
    };
  },

  addCommands() {
    return {
      toggleAIAutocomplete: () => ({ commands }: any) => {
        this.storage.enabled = !this.storage.enabled;
        console.log('AI Autocomplete toggled to:', this.storage.enabled);
        return true;
      },
      setAIAutocomplete: (enabled: boolean) => ({ commands }: any) => {
        this.storage.enabled = enabled;
        console.log('AI Autocomplete set to:', this.storage.enabled);
        return true;
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Tab to accept suggestion
      Tab: ({ editor }) => {
        if (currentSuggestion && suggestionPosition >= 0) {
          const { state, view } = editor;
          const tr = state.tr.insertText(currentSuggestion, suggestionPosition);
          view.dispatch(tr);
          
          // Clear suggestion
          currentSuggestion = '';
          suggestionPosition = -1;
          
          return true;
        }
        return false;
      },
      // Escape to dismiss suggestion
      Escape: () => {
        if (currentSuggestion) {
          currentSuggestion = '';
          suggestionPosition = -1;
          return true;
        }
        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: AI_AUTOCOMPLETE_PLUGIN_KEY,
        
        state: {
          init() {
            return DecorationSet.empty;
          },
          
          apply(tr, oldState) {
            // If suggestion exists and document changed, show decoration
            if (currentSuggestion && suggestionPosition >= 0) {
              const decoration = Decoration.widget(
                suggestionPosition,
                () => {
                  const span = document.createElement('span');
                  span.className = 'ai-suggestion';
                  span.style.cssText = `
                    color: #9ca3af;
                    font-style: italic;
                    pointer-events: none;
                    user-select: none;
                  `;
                  span.textContent = currentSuggestion;
                  
                  // Add hint text
                  const hint = document.createElement('span');
                  hint.style.cssText = `
                    color: #d1d5db;
                    font-size: 11px;
                    margin-left: 4px;
                    background: #f3f4f6;
                    padding: 2px 6px;
                    border-radius: 3px;
                  `;
                  hint.textContent = 'Tab to accept';
                  span.appendChild(hint);
                  
                  return span;
                },
                { side: 1 }
              );
              
              return DecorationSet.create(tr.doc, [decoration]);
            }
            
            return DecorationSet.empty;
          },
        },
        
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
        
        view() {
          return {
            update: async (view) => {
              const isEnabled = extension.storage.enabled;
              console.log('AI Autocomplete - enabled:', isEnabled);
              
              if (!isEnabled) {
                // Clear any existing suggestion when disabled
                if (currentSuggestion) {
                  currentSuggestion = '';
                  suggestionPosition = -1;
                  view.dispatch(view.state.tr);
                }
                return;
              }
              
              const { state } = view;
              const { selection } = state;
              const { from, to } = selection;
              
              // Only suggest if cursor (no selection)
              if (from !== to) {
                currentSuggestion = '';
                suggestionPosition = -1;
                return;
              }
              
              // Clear existing timer
              if (debounceTimer) {
                clearTimeout(debounceTimer);
              }
              
              // Debounce AI calls
              debounceTimer = setTimeout(async () => {
                if (isGenerating) return; // Don't start new generation if one is in progress
                
                const currentPos = from;
                const textBefore = state.doc.textBetween(0, currentPos, '\n');
                
                // Check if we have enough context
                if (textBefore.trim().length < extension.options.minChars) {
                  console.log('AI Autocomplete - Not enough chars:', textBefore.trim().length);
                  currentSuggestion = '';
                  suggestionPosition = -1;
                  return;
                }
                
                // Check if last character is a space or punctuation (good time to suggest)
                const lastChar = textBefore.slice(-1);
                const shouldSuggest = [' ', '.', ',', '!', '?', '\n'].includes(lastChar);
                
                console.log('AI Autocomplete - Last char:', JSON.stringify(lastChar), 'shouldSuggest:', shouldSuggest);
                
                if (!shouldSuggest) {
                  return;
                }
                
                isGenerating = true;
                console.log('AI Autocomplete - Requesting suggestion...');
                
                try {
                  const suggestion = await getAISuggestion(textBefore);
                  console.log('AI Autocomplete - Got suggestion:', suggestion);
                  
                  // Only show if cursor hasn't moved
                  if (view.state.selection.from === currentPos && suggestion) {
                    currentSuggestion = ' ' + suggestion.trim();
                    suggestionPosition = currentPos;
                    
                    console.log('AI Autocomplete - Showing suggestion at position:', suggestionPosition);
                    
                    // Force update to show decoration
                    view.dispatch(view.state.tr);
                  }
                } catch (error) {
                  console.error('AI Autocomplete - Failed to get suggestion:', error);
                } finally {
                  isGenerating = false;
                }
              }, extension.options.debounceMs);
            },
          };
        },
      }),
    ];
  },
});

// Helper component to show AI autocomplete status
export function AIAutocompleteIndicator({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap"
      title={enabled ? 'AI suggestions enabled (press Tab to accept)' : 'AI suggestions disabled'}
    >
      <span className="text-sm sm:text-base">{enabled ? '✨' : '💤'}</span>
      <span className="text-gray-700 font-medium hidden sm:inline">
        AI Suggestions {enabled ? 'ON' : 'OFF'}
      </span>
      <span className="text-gray-700 font-medium sm:hidden">
        AI {enabled ? 'ON' : 'OFF'}
      </span>
    </button>
  );
}

