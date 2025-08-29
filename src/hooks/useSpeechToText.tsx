import { useState, useEffect, useRef } from 'react';

// Fix: Add minimal interfaces for Speech Recognition API to fix TypeScript errors.
interface SpeechRecognitionEvent {
    results: {
        [key: number]: {
            [key: number]: {
                transcript: string;
            };
            isFinal: boolean;
        };
    };
    resultIndex: number;
}
interface SpeechRecognitionErrorEvent {
    error: string;
}
interface SpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

// Fix: Cast window to `any` to access non-standard properties `SpeechRecognition` and `webkitSpeechRecognition`.
// Renamed to `SpeechRecognitionAPI` to avoid conflict with the `SpeechRecognition` interface type.
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechToText = (onTranscriptChange: (transcript: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Fix: Use the defined `SpeechRecognition` interface for the ref type.
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        if (!SpeechRecognitionAPI) {
            setError("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                 onTranscriptChange(finalTranscript);
            }
        };
        
        recognition.onerror = (event) => {
            setError(`Speech recognition error: ${event.error}`);
            setIsListening(false);
        };
        
        recognition.onend = () => {
             setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, [onTranscriptChange]);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
                setError(null);
            } catch(e) {
                setError("Could not start speech recognition. Please check microphone permissions.");
                setIsListening(false);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };
    
    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }

    return {
        isListening,
        error,
        startListening,
        stopListening,
        toggleListening,
        isSupported: !!SpeechRecognitionAPI
    };
};