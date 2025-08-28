
import React from 'react';
import { SparklesIcon } from './IconComponents';

const WelcomeScreen: React.FC = () => {
  return (
    <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-slate-200">
      <SparklesIcon className="w-16 h-16 mx-auto text-blue-500 mb-4" />
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome to Your IELTS AI Coach</h2>
      <p className="text-slate-500 max-w-2xl mx-auto">
        Ready to boost your IELTS score? Select a section from the sidebar to start a new practice test. 
        Our AI will generate a unique test for you and provide detailed feedback on your performance.
      </p>
    </div>
  );
};

export default WelcomeScreen;
