// Mention list component (currently handled by mention-extension)

interface MentionItem {
    id: string;
    label: string;
    avatar?: string;
}

interface MentionListProps {
    items: MentionItem[];
    command: (item: MentionItem) => void;
}

class MentionList {
    element: HTMLDivElement;
    selectedIndex: number = 0;
    items: MentionItem[];
    command: (item: MentionItem) => void;

    constructor({ items, command }: MentionListProps) {
        this.items = items;
        this.command = command;
        this.element = document.createElement('div');
        this.element.className = 'mention-list';
        this.render();
    }

    render() {
        this.element.innerHTML = `
      <div class="bg-background border rounded-lg shadow-lg p-1 max-h-48 overflow-y-auto">
        ${this.items.map((item, index) => `
          <div 
            class="mention-item flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-muted ${index === this.selectedIndex ? 'bg-muted' : ''
            }"
            data-index="${index}"
          >
            <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
              ${item.label.charAt(0).toUpperCase()}
            </div>
            <span class="text-sm">${item.label}</span>
          </div>
        `).join('')}
      </div>
    `;

        // Add click handlers
        this.element.querySelectorAll('.mention-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectItem(index);
            });
        });
    }

    updateProps({ items }: { items: MentionItem[] }) {
        this.items = items;
        this.selectedIndex = 0;
        this.render();
    }

    onKeyDown({ event }: { event: KeyboardEvent }) {
        if (event.key === 'ArrowUp') {
            this.upHandler();
            return true;
        }

        if (event.key === 'ArrowDown') {
            this.downHandler();
            return true;
        }

        if (event.key === 'Enter') {
            this.enterHandler();
            return true;
        }

        return false;
    }

    upHandler() {
        this.selectedIndex =
            (this.selectedIndex + this.items.length - 1) % this.items.length;
        this.updateSelection();
    }

    downHandler() {
        this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
        this.updateSelection();
    }

    enterHandler() {
        this.selectItem(this.selectedIndex);
    }

    selectItem(index: number) {
        const item = this.items[index];
        if (item) {
            this.command(item);
        }
    }

    updateSelection() {
        this.element.querySelectorAll('.mention-item').forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('bg-muted');
            } else {
                item.classList.remove('bg-muted');
            }
        });
    }

    destroy() {
        this.element.remove();
    }
}

export default MentionList;
