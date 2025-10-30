import { marked } from 'marked';

/**
 * Converts markdown text to HTML
 * @param markdown - The markdown content to convert
 * @returns HTML string
 */
export const markdownToHTML = (markdown: string): string => {
  if (!markdown) return '';
  
  // Configure marked options for better HTML output
  marked.setOptions({
    breaks: true,
    gfm: true,
  });
  
  return marked.parse(markdown) as string;
};

