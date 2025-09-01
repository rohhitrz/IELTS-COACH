import React from 'react';
import { SparklesIcon } from './IconComponents';

interface LoadingSpinnerProps {
  text: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text, size = 'md' }) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12'
  };

  const spinnerSizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]} bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl shadow-sm border border-blue-200 dark:border-slate-600`}>
      <div className="relative">
        {/* Main spinner */}
        <svg className={`animate-spin ${spinnerSizes[size]} text-blue-500`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        
        {/* Decorative sparkles */}
        <SparklesIcon className="absolute -top-1 -right-1 w-4 h-4 text-blue-400 animate-pulse" />
        <SparklesIcon className="absolute -bottom-1 -left-1 w-3 h-3 text-indigo-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      
      <div className="mt-4 text-center space-y-2">
        <p className={`text-slate-700 dark:text-slate-200 font-medium ${textSizes[size]}`}>
          {text}
        </p>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
      
      {/* Progress shimmer effect */}
      <div className="mt-4 w-full max-w-xs">
        <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shimmer"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;