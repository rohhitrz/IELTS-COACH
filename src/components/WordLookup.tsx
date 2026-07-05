import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface Definition {
  phonetic?: string;
  meanings: { partOfSpeech: string; definition: string; example?: string }[];
}

interface PopupState {
  word: string;
  x: number;
  y: number;
  status: 'prompt' | 'loading' | 'loaded' | 'error';
  definition?: Definition;
}

/**
 * Wraps passage text and lets the student select a word to look up its
 * dictionary definition (via the free dictionaryapi.dev service).
 */
const WordLookup: React.FC<{ children: ReactNode }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [popup, setPopup] = useState<PopupState | null>(null);

  useEffect(() => {
    const dismiss = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPopup(null);
      }
    };
    document.addEventListener('mousedown', dismiss);
    return () => document.removeEventListener('mousedown', dismiss);
  }, []);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    // Single words only — that's what a dictionary can answer.
    if (!/^[a-zA-Z][a-zA-Z'-]*$/.test(text) || text.length < 2 || text.length > 30) return;
    if (!containerRef.current?.contains(selection.anchorNode)) return;

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    // Keep the 288px-wide popup inside the container
    const rawX = rect.left - containerRect.left + rect.width / 2;
    setPopup({
      word: text.toLowerCase(),
      x: Math.min(Math.max(rawX, 150), Math.max(containerRect.width - 150, 150)),
      y: rect.bottom - containerRect.top,
      status: 'prompt',
    });
  };

  const lookUp = async (word: string) => {
    setPopup((p) => (p ? { ...p, status: 'loading' } : p));
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!res.ok) throw new Error('not found');
      const data = await res.json();
      const entry = data[0];
      const definition: Definition = {
        phonetic: entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text,
        meanings: (entry.meanings || []).slice(0, 2).map((m: any) => ({
          partOfSpeech: m.partOfSpeech,
          definition: m.definitions?.[0]?.definition || '',
          example: m.definitions?.[0]?.example,
        })),
      };
      setPopup((p) => (p ? { ...p, status: 'loaded', definition } : p));
    } catch {
      setPopup((p) => (p ? { ...p, status: 'error' } : p));
    }
  };

  return (
    <div ref={containerRef} className="relative" onMouseUp={handleMouseUp}>
      {children}
      {popup && (
        <div
          className="absolute z-30 w-72 max-w-[90%] -translate-x-1/2 mt-1 rounded-lg shadow-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-left"
          style={{ left: popup.x, top: popup.y }}
          role="dialog"
          aria-label={`Definition of ${popup.word}`}
        >
          {popup.status === 'prompt' && (
            <button
              onClick={() => lookUp(popup.word)}
              className="w-full px-4 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Define “{popup.word}”
            </button>
          )}
          {popup.status === 'loading' && (
            <p className="px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400">Looking up “{popup.word}”…</p>
          )}
          {popup.status === 'error' && (
            <p className="px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400">
              No definition found for “{popup.word}”.
            </p>
          )}
          {popup.status === 'loaded' && popup.definition && (
            <div className="p-4 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-100">{popup.word}</span>
                {popup.definition.phonetic && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">{popup.definition.phonetic}</span>
                )}
              </div>
              {popup.definition.meanings.map((m, i) => (
                <div key={i} className="text-sm">
                  <span className="italic text-slate-500 dark:text-slate-400">{m.partOfSpeech}. </span>
                  <span className="text-slate-700 dark:text-slate-300">{m.definition}</span>
                  {m.example && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">“{m.example}”</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WordLookup;
