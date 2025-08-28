
import React, { useState } from 'react';
import { ExamSection, ExamContent, EvaluationResult } from './types';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ReadingSection from './components/ReadingSection';
import WritingSection from './components/WritingSection';
import SpeakingSection from './components/SpeakingSection';
import ListeningSection from './components/ListeningSection';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ExamSection>(ExamSection.WELCOME);
  const [examContent, setExamContent] = useState<ExamContent | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSectionChange = (section: ExamSection) => {
    setActiveSection(section);
    setExamContent(null);
    setEvaluation(null);
    setError(null);
  };
  
  const renderSection = () => {
    switch (activeSection) {
      case ExamSection.WELCOME:
        return <WelcomeScreen />;
      case ExamSection.LISTENING:
        return <ListeningSection />;
      case ExamSection.READING:
        return <ReadingSection />;
      case ExamSection.WRITING:
        return <WritingSection />;
      case ExamSection.SPEAKING:
        return <SpeakingSection />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="flex h-screen font-sans text-slate-800">
      <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
      <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
        <div className="max-w-4xl mx-auto">
           <h1 className="text-3xl font-bold text-slate-700 mb-2">IELTS Academic AI Coach</h1>
           <p className="text-slate-500 mb-8">Your personal AI tutor to ace the IELTS exam.</p>
           {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default App;
