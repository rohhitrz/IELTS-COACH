import React, { useState } from 'react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { ListeningIcon, RefreshIcon } from './IconComponents';

interface AudioPlayerProps {
  text: string;
}

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
);

const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>
);

/** Plays the listening test audio via text-to-speech, with exam-style once-through playback. */
const AudioPlayer: React.FC<AudioPlayerProps> = ({ text }) => {
  const { isSupported, status, progress, play, pause, resume } = useSpeechSynthesis();
  const [playCount, setPlayCount] = useState(0);

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-300">
        Your browser does not support speech playback. Please use a recent version of Chrome, Edge, or Safari for the listening test.
      </div>
    );
  }

  const handleMainButton = () => {
    if (status === 'playing') {
      pause();
    } else if (status === 'paused') {
      resume();
    } else {
      setPlayCount((c) => c + 1);
      play(text);
    }
  };

  const statusLabel =
    status === 'playing' ? 'Playing…' :
    status === 'paused' ? 'Paused' :
    status === 'ended' ? 'Recording finished' :
    'Ready to play';

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleMainButton}
          aria-label={status === 'playing' ? 'Pause audio' : 'Play audio'}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors flex-shrink-0"
        >
          {status === 'playing' ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="font-medium text-blue-800 dark:text-blue-200 flex items-center">
              <ListeningIcon className="w-4 h-4 mr-1.5" />
              {statusLabel}
            </span>
            {playCount > 0 && (
              <span className="text-blue-600 dark:text-blue-300 text-xs">
                Plays: {playCount}
              </span>
            )}
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-2 rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>

        {(status === 'ended' || status === 'paused') && (
          <button
            onClick={() => { setPlayCount((c) => c + 1); play(text); }}
            aria-label="Restart audio"
            className="p-2 rounded-full text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors flex-shrink-0"
            title="Restart from the beginning"
          >
            <RefreshIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      <p className="text-xs text-blue-600/80 dark:text-blue-300/80">
        In the real IELTS exam, you hear the recording <strong>once only</strong>. Try to answer everything on your first listen.
      </p>
    </div>
  );
};

export default AudioPlayer;
