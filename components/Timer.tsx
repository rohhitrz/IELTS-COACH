
import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
  duration: number; // Duration in seconds
  onSubmit: () => void;
  isPaused: boolean;
}

const Timer: React.FC<TimerProps> = ({ duration, onSubmit, isPaused }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onSubmit, isPaused]);
  
  useEffect(() => {
      setTimeLeft(duration);
  }, [duration])

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isLowTime = timeLeft <= 300; // 5 minutes

  return (
    <div className={`sticky top-[81px] md:top-[89px] z-10 p-2 rounded-lg mb-4 text-center font-mono font-bold text-lg transition-colors ${
        isLowTime ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
    }`}>
      Time Left: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};

export default Timer;
