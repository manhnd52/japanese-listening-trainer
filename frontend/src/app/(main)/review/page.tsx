'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Quiz, QuizOption, QuizAttemptResult } from '@/features/quiz/types';
import { getMistakeQuizzes, submitQuizAnswer } from '@/features/quiz/api';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Loader2, ArrowRight, Trophy, Music, Play, Sparkles, HelpCircle } from 'lucide-react';

/**
 * Review Mistakes Page
 * Matches the reference UI design
 * 
 * Flow:
 * 1. Fetch mistake quizzes from backend
 * 2. Show quizzes one by one in card UI
 * 3. Click to answer - if correct, remove from MistakeQuiz
 * 4. Continue until all reviewed
 */
export default function ReviewPage() {
  const router = useRouter();
  
  const [mistakeQuizzes, setMistakeQuizzes] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'wrong' | null>(null);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });

  // Load mistake quizzes on mount
  useEffect(() => {
    loadMistakeQuizzes();
  }, []);

  const loadMistakeQuizzes = async () => {
    setIsLoading(true);
    try {
      const quizzes = await getMistakeQuizzes();
      setMistakeQuizzes(quizzes);
    } catch (error) {
      console.error('Failed to load mistake quizzes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuiz = mistakeQuizzes[currentIndex];
  const hasMore = currentIndex < mistakeQuizzes.length - 1;
  const isComplete = currentIndex >= mistakeQuizzes.length && mistakeQuizzes.length > 0;
  const remaining = mistakeQuizzes.length - currentIndex;

  // Handle option click - instant answer (no submit button)
  const handleOptionClick = async (option: QuizOption) => {
    if (answerStatus !== null || !currentQuiz) return;

    setSelectedOption(option);

    try {
      const submitResult = await submitQuizAnswer({
        quizId: currentQuiz.id,
        selectedOption: option,
      });
      setResult(submitResult);
      
      if (submitResult.isCorrect) {
        setAnswerStatus('correct');
        setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setAnswerStatus('wrong');
        setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
    setSelectedOption(null);
    setAnswerStatus(null);
    setResult(null);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswerStatus(null);
    setResult(null);
    setStats({ correct: 0, wrong: 0 });
    loadMistakeQuizzes();
  };

  const options: { label: QuizOption; text: string }[] = currentQuiz ? [
    { label: QuizOption.A, text: currentQuiz.optionA },
    { label: QuizOption.B, text: currentQuiz.optionB },
    { label: QuizOption.C, text: currentQuiz.optionC },
    { label: QuizOption.D, text: currentQuiz.optionD },
  ] : [];

  const getOptionStyle = (option: QuizOption) => {
    if (answerStatus === null) {
      return 'bg-white border-brand-200 text-brand-700 hover:border-brand-400 hover:bg-brand-50';
    }

    if (result && option === result.correctOption) {
      return 'bg-green-50 border-green-500 text-green-800';
    }
    if (option === selectedOption && answerStatus === 'wrong') {
      return 'bg-red-50 border-red-500 text-red-800';
    }
    return 'bg-white border-brand-200 text-brand-400 opacity-50';
  };

  const getIcon = (option: QuizOption) => {
    if (answerStatus === null) {
      return <div className="w-6 h-6 rounded-full border-2 border-brand-300 group-hover:border-brand-500" />;
    }
    
    if (result && option === result.correctOption) {
      return <CheckCircle size={24} className="text-green-500" />;
    }
    if (option === selectedOption && answerStatus === 'wrong') {
      return <XCircle size={24} className="text-red-500" />;
    }
    return <div className="w-6 h-6 rounded-full border-2 border-brand-300 opacity-50" />;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-jlt-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-brand-500 mx-auto mb-4" size={48} />
          <p className="text-brand-500">Loading your mistakes to review...</p>
        </div>
      </div>
    );
  }

  // No mistakes - all caught up!
  if (mistakeQuizzes.length === 0) {
    return (
      <div className="min-h-screen bg-jlt-cream flex items-center justify-center p-8">
        <div className="text-center max-w-md animate-in fade-in duration-300">
          <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
            <CheckCircle className="text-green-600" size={64} />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-900 mb-3">All Caught Up!</h1>
          <p className="text-brand-500 text-lg mb-8">
            You've reviewed all your mistakes. Great job!
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Completed review session
  if (isComplete) {
    const accuracy = Math.round((stats.correct / (stats.correct + stats.wrong)) * 100) || 0;
    
    return (
      <div className="min-h-screen bg-jlt-cream flex items-center justify-center p-8">
        <div className="text-center max-w-md animate-in fade-in duration-300">
          <div className="w-32 h-32 bg-jlt-peach rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-200">
            <Trophy className="text-orange-600" size={64} />
          </div>
          <h1 className="text-3xl font-extrabold text-brand-900 mb-4">Review Complete!</h1>
          
          <div className="bg-white rounded-2xl p-6 mb-6 border border-brand-200 shadow-sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-brand-900">{stats.correct + stats.wrong}</p>
                <p className="text-sm text-brand-500">Reviewed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{stats.correct}</p>
                <p className="text-sm text-brand-500">Correct</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-500">{stats.wrong}</p>
                <p className="text-sm text-brand-500">Wrong</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-200">
              <p className="text-brand-500">Accuracy</p>
              <p className="text-4xl font-bold text-brand-600">{accuracy}%</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleRestart}
              className="flex-1 px-6 py-3 bg-brand-100 hover:bg-brand-200 text-brand-700 font-bold rounded-xl transition flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> Review Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main review interface (matching reference design)
  return (
    <div className="min-h-screen bg-jlt-cream p-4 md:p-8 pb-40 animate-in fade-in duration-300">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-brand-600 hover:text-brand-800 font-bold transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={2.5} /> Back
          </button>
          <div className="flex items-center gap-2 bg-jlt-peach text-orange-800 px-4 py-2 rounded-full font-bold text-sm border border-orange-200">
            <RotateCcw size={16} />
            <span>{remaining} Remaining</span>
          </div>
        </div>

        {/* Main Review Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-brand-200 overflow-hidden">
          {/* Audio Context Header */}
          <div className="bg-brand-50 p-6 border-b border-brand-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-400 shadow-sm border border-brand-200 shrink-0">
                <Music size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-1">Reviewing from</p>
                <h3 className="text-brand-900 font-bold text-lg">Audio ID: {currentQuiz.audioId}</h3>
              </div>
            </div>
            
            <button 
              className="px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm bg-brand-600 text-white hover:bg-brand-700"
              onClick={() => {/* TODO: Play audio context */}}
            >
              <Play size={18} fill="currentColor"/> Listen to Context
            </button>
          </div>

          {/* Quiz Content */}
          <div className="p-6 md:p-10">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1 bg-brand-100 text-brand-600 px-3 py-1 rounded-full text-xs font-bold mb-4 border border-brand-200">
                <HelpCircle size={12} />
                Review Question
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-brand-900 leading-snug">
                {currentQuiz.questionText}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {options.map((option) => (
                <button
                  key={option.label}
                  disabled={answerStatus !== null}
                  onClick={() => handleOptionClick(option.label)}
                  className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 font-medium transition-all flex items-center justify-between group ${getOptionStyle(option.label)} ${answerStatus !== null ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{option.label}.</span>
                    <span className="text-base md:text-lg">{option.text}</span>
                  </div>
                  {getIcon(option.label)}
                </button>
              ))}
            </div>

            {/* Explanation & Next/Remove Button */}
            {answerStatus && result && (
              <div className="animate-in slide-in-from-bottom duration-300 mt-8 p-6 bg-brand-50 rounded-2xl border border-brand-200 shadow-sm">
                <h4 className="font-bold text-brand-900 flex items-center gap-2 mb-2">
                  <Sparkles size={18} className="text-brand-500"/>
                  {answerStatus === 'correct' ? 'Correct!' : 'Explanation'}
                </h4>
                <p className="text-brand-700 leading-relaxed mb-6">
                  {result.explanation || 'No explanation available.'}
                </p>
                
                <div className="flex justify-end">
                  <button 
                    onClick={handleNext}
                    className={`px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95 ${
                      answerStatus === 'correct' 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-brand-900 hover:bg-brand-800 text-white'
                    }`}
                  >
                    {answerStatus === 'correct' ? 'Remove & Next' : 'Try Later'} <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mt-6 bg-white rounded-2xl p-4 flex justify-around text-center border border-brand-200 shadow-sm">
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.correct}</p>
            <p className="text-sm text-brand-500">Correct</p>
          </div>
          <div className="border-l border-brand-200" />
          <div>
            <p className="text-2xl font-bold text-red-500">{stats.wrong}</p>
            <p className="text-sm text-brand-500">Wrong</p>
          </div>
          <div className="border-l border-brand-200" />
          <div>
            <p className="text-2xl font-bold text-brand-600">{remaining}</p>
            <p className="text-sm text-brand-500">Remaining</p>
          </div>
        </div>
      </div>
    </div>
  );
}
