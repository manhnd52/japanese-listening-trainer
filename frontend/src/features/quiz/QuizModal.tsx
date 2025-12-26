'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { closeQuizModal, nextQuiz, setLoading, setQuizResult, setError } from '@/store/features/quiz/quizSlice';
import { QuizOption } from './types';
//import { submitQuizAnswer } from './api';
import { X, CheckCircle, XCircle, ArrowRight, HelpCircle, Sparkles, Zap } from 'lucide-react';
import { useQuiz } from './useQuiz';

export default function QuizModal() {
  const dispatch = useAppDispatch();
  const { currentQuiz, allQuizzes, currentIndex, result, showModal, isLoading, mode } = useAppSelector((state) => state.quiz);
  
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showExpAnimation, setShowExpAnimation] = useState(false);
  const { submitQuiz } = useQuiz();

  // Reset local state when currentQuiz changes (for "all quizzes" mode)
  useEffect(() => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setShowExpAnimation(false);
    setLoading(false);
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
      const submitResult = await submitQuiz(currentQuiz.id, option);
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
      return 'bg-white border-brand-200 text-brand-700 hover:border-brand-400 hover:bg-brand-50';
    }

    // After submission
    if (result) {
      if (option === result.correctOption) {
        return 'bg-green-50 border-green-500 text-green-800';
      }
      if (option === selectedOption && !result.isCorrect) {
        return 'bg-red-50 border-red-500 text-red-800';
      }
    }
    return 'bg-white border-brand-200 text-brand-400 opacity-50';
  };

  const getIcon = (option: QuizOption) => {
    if (!hasSubmitted || !result) {
      return <div className="w-6 h-6 rounded-full border-2 border-brand-300 group-hover:border-brand-500" />;
    }
    
    if (option === result.correctOption) {
      return <CheckCircle size={24} className="text-green-500" />;
    }
    if (option === selectedOption && !result.isCorrect) {
      return <XCircle size={24} className="text-red-500" />;
    }
    return <div className="w-6 h-6 rounded-full border-2 border-brand-300 opacity-50" />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      {/* EXP Gain Animation */}
      {showExpAnimation && result?.expGained && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl font-bold text-2xl shadow-2xl flex items-center gap-2">
            <Zap size={28} className="animate-pulse" />
            +{result.expGained} EXP
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl border border-brand-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-brand-100 flex justify-between items-center bg-brand-50">
          <h3 className="text-xl font-extrabold text-brand-900 flex items-center gap-2">
            <span className="bg-jlt-peach text-orange-600 p-2 rounded-xl">
              <HelpCircle size={20}/>
            </span>
            Quiz Time
          </h3>
          <button 
            onClick={handleClose} 
            className="text-brand-400 hover:text-brand-700 p-2 rounded-full hover:bg-brand-100 transition-colors"
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
                <div className="flex justify-between items-center text-xs font-bold text-brand-500 uppercase tracking-widest">
                  <span>Question {currentIndex + 1} of {totalQuizzes}</span>
                  <span>{progressPercent}% Completed</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-500 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </>
            )}

            {/* Question */}
            <div className="text-center py-4">
              <h3 className="text-xl md:text-2xl font-bold text-brand-900 leading-snug">
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
              <div className="animate-in slide-in-from-bottom duration-300 mt-6 p-6 bg-brand-50 rounded-2xl border border-brand-200 shadow-sm">
                {/* Result Indicator */}
                <div className={`flex items-center gap-2 mb-3 ${result.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
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
                    <h4 className="font-bold text-brand-900 flex items-center gap-2 mb-2">
                      <Sparkles size={18} className="text-brand-500"/> Explanation
                    </h4>
                    <p className="text-brand-700 leading-relaxed mb-6">
                      {result.explanation}
                    </p>
                  </>
                )}
                
                {/* Next/Finish Button */}
                <div className="flex justify-end">
                  {hasNextQuiz ? (
                    <button 
                      onClick={handleNext} 
                      className="bg-brand-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-800 flex items-center gap-2 transition-all active:scale-95"
                    >
                      Next Question <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button 
                      onClick={handleClose} 
                      className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95"
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
