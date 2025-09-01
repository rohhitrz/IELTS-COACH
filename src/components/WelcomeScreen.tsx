import React from 'react';
import { SparklesIcon, TrophyIcon, TargetIcon, BookOpenIcon, ClockIcon } from './IconComponents';
import AnimatedCard from './AnimatedCard';

const WelcomeScreen: React.FC = () => {
  const features = [
    {
      icon: TrophyIcon,
      title: 'AI-Powered Evaluation',
      description: 'Get detailed feedback and band scores from our advanced AI examiner'
    },
    {
      icon: TargetIcon,
      title: 'Personalized Practice',
      description: 'Tests adapted to your skill level with targeted improvement suggestions'
    },
    {
      icon: BookOpenIcon,
      title: 'All Four Skills',
      description: 'Practice Listening, Reading, Writing, and Speaking in one platform'
    },
    {
      icon: ClockIcon,
      title: 'Timed Practice',
      description: 'Realistic exam conditions with proper timing for each section'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <AnimatedCard className="text-center p-12 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 border-blue-200 dark:border-slate-600">
        <div className="space-y-6">
          <div className="relative">
            <SparklesIcon className="w-20 h-20 mx-auto text-blue-500 dark:text-blue-400 animate-pulse-slow" />
            <div className="absolute inset-0 w-20 h-20 mx-auto bg-blue-500/20 rounded-full animate-ping" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 animate-fadeInUp">
              Welcome to Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                IELTS AI Coach
              </span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              Master the IELTS Academic exam with AI-powered practice tests, instant feedback, 
              and personalized learning paths. Get ready to achieve your target band score!
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp" style={{ animationDelay: '400ms' }}>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">9.0</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Max Band Score</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-300 dark:bg-slate-600" />
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">AI</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Powered</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-300 dark:bg-slate-600" />
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">4</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Skills Covered</div>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <AnimatedCard 
            key={feature.title} 
            className="p-6 hover:shadow-xl" 
            delay={600 + index * 100}
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Getting Started */}
      <AnimatedCard className="p-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800" delay={1000}>
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Ready to Get Started?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Choose a section from the sidebar to begin your practice journey. Each test is uniquely generated 
            and provides comprehensive feedback to help you improve.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
              Listening
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
              Reading
            </span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
              Writing
            </span>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
              Speaking
            </span>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default WelcomeScreen;