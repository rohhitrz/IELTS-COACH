import { useState, useRef, useEffect, useCallback } from 'react';

export type TtsStatus = 'idle' | 'playing' | 'paused' | 'ended';

/**
 * Text-to-speech playback for listening tests.
 * The text is split into sentence-sized chunks queued as separate utterances —
 * this works around Chrome's bug where long utterances stall after ~15 seconds,
 * and gives us progress reporting via chunk boundaries.
 */
export const useSpeechSynthesis = () => {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [status, setStatus] = useState<TtsStatus>('idle');
  const [progress, setProgress] = useState(0); // 0..1
  // Hold utterance refs — if they're garbage-collected, Chrome never fires their events.
  const utterancesRef = useRef<SpeechSynthesisUtterance[]>([]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    utterancesRef.current = [];
    window.speechSynthesis.cancel();
    setStatus('idle');
    setProgress(0);
  }, [isSupported]);

  useEffect(() => stop, [stop]); // cancel any speech on unmount

  const play = useCallback(
    (text: string) => {
      if (!isSupported) return;
      window.speechSynthesis.cancel();

      // Split into sentences, then merge into chunks of ~200 chars.
      const sentences = text.split(/(?<=[.?!:])\s+|\n+/).filter((s) => s.trim());
      const chunks: string[] = [];
      let current = '';
      for (const sentence of sentences) {
        if (current && current.length + sentence.length > 200) {
          chunks.push(current);
          current = sentence;
        } else {
          current = current ? `${current} ${sentence}` : sentence;
        }
      }
      if (current) chunks.push(current);
      if (chunks.length === 0) return;

      const voice =
        window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('en-GB')) ||
        window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('en')) ||
        null;

      const utterances = chunks.map((chunk, i) => {
        const u = new SpeechSynthesisUtterance(chunk);
        if (voice) u.voice = voice;
        u.rate = 0.95;
        u.onend = () => {
          // Ignore events from a cancelled queue
          if (utterancesRef.current[i] !== u) return;
          setProgress((i + 1) / chunks.length);
          if (i === chunks.length - 1) setStatus('ended');
        };
        u.onerror = () => {
          if (utterancesRef.current[i] !== u) return;
          setStatus('idle');
        };
        return u;
      });

      utterancesRef.current = utterances;
      setProgress(0);
      setStatus('playing');
      utterances.forEach((u) => window.speechSynthesis.speak(u));
    },
    [isSupported]
  );

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setStatus('paused');
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setStatus('playing');
  }, [isSupported]);

  return { isSupported, status, progress, play, pause, resume, stop };
};
