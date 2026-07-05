import { useState, useRef, useEffect, useCallback } from 'react';

export interface RecordingResult {
  audioUrl: string | null;
  audioBlob: Blob | null;
  transcript: string;
  durationSec: number;
}

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : undefined;

/**
 * Records microphone audio (for replay and pronunciation analysis) while
 * transcribing it with the Web Speech API. One recording at a time.
 */
export const useAudioRecorder = (onFinish: (result: RecordingResult) => void) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);
  const finalTranscriptRef = useRef('');
  const startTimeRef = useRef(0);
  const tickIntervalRef = useRef<number | null>(null);
  const maxTimeoutRef = useRef<number | null>(null);
  const recordingRef = useRef(false);

  const cleanup = useCallback(() => {
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
    tickIntervalRef.current = null;
    maxTimeoutRef.current = null;
    recordingRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
      recognitionRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stop = useCallback(() => {
    if (!recordingRef.current) return;
    recordingRef.current = false;
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop(); // onstop fires onFinish
    }
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* already stopped */ }
    }
    setIsRecording(false);
  }, []);

  const start = useCallback(async (maxDurationSec?: number) => {
    if (recordingRef.current) return;
    setError(null);
    setLiveTranscript('');
    finalTranscriptRef.current = '';
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Microphone access was denied. You can still type your answers.');
      return;
    }

    streamRef.current = stream;
    recordingRef.current = true;
    startTimeRef.current = Date.now();

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);
      const blob = chunksRef.current.length > 0 ? new Blob(chunksRef.current, { type: recorder.mimeType }) : null;
      cleanup();
      onFinishRef.current({
        audioUrl: blob ? URL.createObjectURL(blob) : null,
        audioBlob: blob,
        transcript: finalTranscriptRef.current.trim(),
        durationSec,
      });
    };
    recorder.start();

    // Speech recognition alongside the recording (best effort — some browsers lack it)
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscriptRef.current += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setLiveTranscript((finalTranscriptRef.current + interim).trim());
      };
      // Recognition stops itself after silence; restart while we're still recording.
      recognition.onend = () => {
        if (recordingRef.current && recognitionRef.current === recognition) {
          try { recognition.start(); } catch { /* tab lost focus etc. */ }
        }
      };
      recognitionRef.current = recognition;
      try { recognition.start(); } catch { /* ignore */ }
    }

    setElapsedSec(0);
    setIsRecording(true);
    tickIntervalRef.current = window.setInterval(() => {
      setElapsedSec(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 500);

    if (maxDurationSec) {
      maxTimeoutRef.current = window.setTimeout(stop, maxDurationSec * 1000);
    }
  }, [cleanup, stop]);

  // Abort everything if the component unmounts mid-recording
  useEffect(() => () => {
    recordingRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    cleanup();
  }, [cleanup]);

  return {
    isRecording,
    elapsedSec,
    liveTranscript,
    error,
    start,
    stop,
    isTranscriptionSupported: !!SpeechRecognitionAPI,
  };
};
