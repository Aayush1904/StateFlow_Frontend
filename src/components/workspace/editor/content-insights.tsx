import React, { useMemo } from 'react';

function countWords(text: string) {
    const m = text.trim().match(/\b\w+\b/g);
    return m ? m.length : 0;
}

function countSentences(text: string) {
    const m = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return m.length || 1;
}

function countSyllables(word: string) {
    const w = word.toLowerCase();
    const m = w.match(/[aeiouy]{1,2}/g);
    return m ? m.length : 1;
}

function fleschReadingEase(text: string) {
    const words = text.trim().match(/\b\w+\b/g) || [];
    const wordCount = words.length || 1;
    const sentenceCount = countSentences(text);
    const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);
    const ASL = wordCount / sentenceCount; // average sentence length
    const ASW = syllableCount / wordCount; // average syllables per word
    // Flesch reading ease
    const score = 206.835 - 1.015 * ASL - 84.6 * ASW;
    return Math.max(0, Math.min(100, Math.round(score)));
}

const POSITIVE = ['great', 'good', 'excellent', 'love', 'nice', 'happy', 'success', 'improve'];
const NEGATIVE = ['bad', 'poor', 'hate', 'terrible', 'sad', 'fail', 'issue', 'bug'];

function simpleSentiment(text: string) {
    const tokens = (text.toLowerCase().match(/\b\w+\b/g) || []);
    let score = 0;
    tokens.forEach(t => {
        if (POSITIVE.includes(t)) score += 1;
        if (NEGATIVE.includes(t)) score -= 1;
    });
    return score; // >0 positive, <0 negative
}

export const ContentInsights: React.FC<{ html: string }> = ({ html }) => {
    const plain = useMemo(() => {
        // Strip tags
        const div = document.createElement('div');
        div.innerHTML = html || '';
        return div.textContent || div.innerText || '';
    }, [html]);

    const words = useMemo(() => countWords(plain), [plain]);
    const readingEase = useMemo(() => fleschReadingEase(plain), [plain]);
    const sentiment = useMemo(() => simpleSentiment(plain), [plain]);

    return (
        <aside className="w-full max-w-full md:max-w-xs border rounded-md p-3 text-sm space-y-2">
            <div className="font-semibold">Content Insights</div>
            <div className="flex items-center justify-between">
                <span>Word count</span>
                <span className="font-medium">{words}</span>
            </div>
            <div className="flex items-center justify-between">
                <span>Reading ease</span>
                <span className="font-medium">{readingEase}</span>
            </div>
            <div className="flex items-center justify-between">
                <span>Sentiment</span>
                <span className={`font-medium ${sentiment > 0 ? 'text-green-600' : sentiment < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {sentiment > 0 ? 'Positive' : sentiment < 0 ? 'Negative' : 'Neutral'}
                </span>
            </div>
        </aside>
    );
};

export default ContentInsights;




