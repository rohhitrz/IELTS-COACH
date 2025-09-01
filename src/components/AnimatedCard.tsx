import React, { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  delay = 0 
}) => {
  return (
    <div 
      className={`
        bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700
        transform transition-all duration-300 ease-out
        ${hover ? 'hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-600' : ''}
        animate-fadeInUp
        ${className}
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;