'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { closeQuizModal, nextQuiz, setLoading, setQuizResult, setError } from '@/store/features/quiz/quizSlice';
import { QuizOption } from './types';
import { submitQuizAnswer } from './api';
import { X, CheckCircle, XCircle, ArrowRight, HelpCircle, Sparkles, Zap } from 'lucide-react';

export default function QuizModal() {
  const dispatch = useAppDispatch();
  const { currentQuiz, allQuizzes, currentIndex, result, showModal, isLoading, mode } = useAppSelector((state) => state.quiz);
  
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showExpAnimation, setShowExpAnimation] = useState(false);

  // Reset local state when currentQuiz changes (for "all quizzes" mode)
  useEffect(() => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setShowExpAnimation(false);
  }, [currentQuiz?.id]);

  // Show EXP animation when correct
  useEffect(() => {
    if (result?.isCorrect && result.expGained) {
      setShowExpAnimation(true);
      const timer = setTimeout(() => setShowExpAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  if (!showModal || !currentQuiz) return null;

  const isAllMode = mode === 'all';
  const hasNextQuiz = isAllMode && currentIndex < allQuizzes.length - 1;
  const totalQuizzes = isAllMode ? allQuizzes.length : 1;
  const progressPercent = isAllMode ? Math.round((currentIndex / totalQuizzes) * 100) : 0;

  const handleOptionSelect = async (option: QuizOption) => {
    if (hasSubmitted) return;
    
    setSelectedOption(option);
    setHasSubmitted(true);
    dispatch(setLoading(true));

    try {
      const submitResult = await submitQuizAnswer({
        quizId: currentQuiz.id,
        selectedOption: option,
      });
      dispatch(setQuizResult(submitResult));
    } catch (error: any) {
      dispatch(setError(error.response?.data?.message || 'Failed to submit answer'));
      setHasSubmitted(false);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleNext = () => {
    dispatch(nextQuiz());
  };

  const handleClose = () => {
    dispatch(closeQuizModal());
    setSelectedOption(null);
    setHasSubmitted(false);
  };

  const options: { label: QuizOption; text: string }[] = [
    { label: QuizOption.A, text: currentQuiz.optionA },
    { label: QuizOption.B, text: currentQuiz.optionB },
    { label: QuizOption.C, text: currentQuiz.optionC },
    { label: QuizOption.D, text: currentQuiz.optionD },
  ];

  const getOptionStyle = (option: QuizOption) => {
    if (!hasSubmitted) {
      return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-purple-300 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20';
    }

    // After submission
    if (result) {
      if (option === result.correctOption) {
        return 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300';
      }
      if (option === selectedOption && !result.isCorrect) {
        return 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300';
      }
    }
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 opacity-50';
  };

  const getIcon = (option: QuizOption) => {
    if (!hasSubmitted || !result) {
      return <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-purple-400" />;
    }
    
    if (option === result.correctOption) {
      return <CheckCircle size={24} className="text-green-500" />;
    }
    if (option === selectedOption && !result.isCorrect) {
      return <XCircle size={24} className="text-red-500" />;
    }
    return <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 opacity-50" />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 dark:bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      {/* EXP Gain Animation */}
      {showExpAnimation && result?.expGained && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl font-bold text-2xl shadow-2xl flex items-center gap-2">
            <Zap size={28} className="animate-pulse" />
            +{result.expGained} EXP
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-xl">
              <HelpCircle size={20}/>
            </span>
            Quiz Time
          </h3>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Progress Info */}
            {isAllMode && (
              <>
                <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  <span>Question {currentIndex + 1} of {totalQuizzes}</span>
                  <span>{progressPercent}% Completed</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </>
            )}

            {/* Question */}
            <div className="text-center py-4">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                {currentQuiz.questionText}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {options.map((option) => (
                <button
                  key={option.label}
                  disabled={hasSubmitted}
                  onClick={() => handleOptionSelect(option.label)}
                  className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 font-medium transition-all flex items-center justify-between group ${getOptionStyle(option.label)} ${hasSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{option.label}.</span>
                    <span className="text-base md:text-lg">{option.text}</span>
                  </div>
                  {getIcon(option.label)}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full" />
              </div>
            )}

            {/* Explanation & Next Button (shown after answer) */}
            {result && hasSubmitted && !isLoading && (
              <div className="animate-in slide-in-from-bottom duration-300 mt-6 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                {/* Result Indicator */}
                <div className={`flex items-center gap-2 mb-3 ${result.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                  {result.isCorrect ? (
                    <>
                      <CheckCircle size={20} />
                      <span className="font-bold">Correct! 🎉</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={20} />
                      <span className="font-bold">Incorrect</span>
                    </>
                  )}
                </div>

                {/* Explanation */}
                {result.explanation && (
                  <>
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                      <Sparkles size={18} className="text-purple-500"/> Explanation
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                      {result.explanation}
                    </p>
                  </>
                )}
                
                {/* Next/Finish Button */}
                <div className="flex justify-end">
                  {hasNextQuiz ? (
                    <button 
                      onClick={handleNext} 
                      className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 dark:hover:bg-gray-100 flex items-center gap-2 transition-all active:scale-95"
                    >
                      Next Question <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button 
                      onClick={handleClose} 
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95"
                    >
                      {isAllMode ? 'Finish Quiz 🎉' : 'Continue'} <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
