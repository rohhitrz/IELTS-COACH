import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  total, 
  label, 
  showPercentage = true,
  color = 'blue' 
}) => {
  const percentage = Math.min((current / total) * 100, 100);
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;