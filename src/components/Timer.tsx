import React, { useState, useEffect, useRef } from 'react';
import { ClockIcon } from './IconComponents';

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
  const totalMinutes = Math.floor(duration / 60);
  
  const isLowTime = timeLeft <= 300; // 5 minutes
  const isCriticalTime = timeLeft <= 60; // 1 minute
  const progressPercentage = ((duration - timeLeft) / duration) * 100;

  const getTimerColor = () => {
    if (isCriticalTime) return 'red';
    if (isLowTime) return 'yellow';
    return 'blue';
  };

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      progress: 'bg-blue-500'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-300',
      progress: 'bg-yellow-500'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      progress: 'bg-red-500'
    }
  };

  const colors = colorClasses[getTimerColor()];

  return (
    <div className={`sticky top-[81px] md:top-[89px] z-10 mx-4 sm:mx-6 mb-4 p-4 rounded-xl border transition-all duration-300 ${colors.bg} ${colors.border} ${isCriticalTime ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <ClockIcon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div>
            <div className={`font-mono font-bold text-xl ${colors.text}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {isPaused ? 'Paused' : 'Time Remaining'}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-sm font-medium ${colors.text}`}>
            {totalMinutes} min test
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {Math.round(progressPercentage)}% elapsed
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-3">
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-1000 ease-linear ${colors.progress}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Warning Messages */}
      {isLowTime && !isCriticalTime && (
        <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 text-center">
          ⚠️ Less than 5 minutes remaining
        </div>
      )}
      
      {isCriticalTime && (
        <div className="mt-2 text-xs text-red-600 dark:text-red-400 text-center font-medium">
          🚨 Critical: Less than 1 minute remaining!
        </div>
      )}
    </div>
  );
};

export default Timer;