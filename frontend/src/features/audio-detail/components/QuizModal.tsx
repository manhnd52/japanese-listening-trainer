import React from 'react';
import { Quiz } from '@/types/types';
import { X, HelpCircle, CheckCircle, XCircle, Sparkles, ArrowRight } from 'lucide-react';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizzes: Quiz[] | undefined;
  activeQuizIndex: number;
  selectedQuizOption: number | null;
  quizAnswerStatus: 'correct' | 'wrong' | null;
  currentQuiz: Quiz | null;
  onQuizOptionClick: (quiz: Quiz, optionIdx: number) => void;
  onNextQuiz: () => void;
  onEditQuiz: () => void;
}

/**
 * QuizModal Component
 * 
 * Full-screen modal for displaying and answering quiz questions
 * Shows progress, options, and explanations
 */
export default function QuizModal({
  isOpen,
  onClose,
  quizzes,
  activeQuizIndex,
  selectedQuizOption,
  quizAnswerStatus,
  currentQuiz,
  onQuizOptionClick,
  onNextQuiz,
  onEditQuiz,
}: QuizModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-900/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl border border-brand-100 flex flex-col overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-6 border-b border-brand-100 flex justify-between items-center bg-brand-50">
          <h3 className="text-xl font-extrabold text-brand-900 flex items-center gap-2">
            <span className="bg-jlt-peach text-orange-800 p-1.5 rounded-lg">
              <HelpCircle size={20} />
            </span>
            Quiz Time
          </h3>
          <button
            onClick={onClose}
            className="text-brand-400 hover:text-brand-700 p-1 rounded-full hover:bg-brand-200/50 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
          {!currentQuiz ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-300">
                <HelpCircle size={40} />
              </div>
              <h3 className="text-brand-900 font-bold text-lg mb-2">No Quizzes Available</h3>
              <p className="text-brand-500 mb-6">This track doesn&apos;t have any quizzes yet.</p>
              <button onClick={onEditQuiz} className="text-brand-600 font-bold underline hover:text-brand-800">
                Create a Quiz
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-between items-center text-xs font-bold text-brand-400 uppercase tracking-widest">
                <span>
                  Question {activeQuizIndex + 1} of {quizzes?.length || 0}
                </span>
                <span>{Math.round((activeQuizIndex / (quizzes?.length || 1)) * 100)}% Completed</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 transition-all duration-500 ease-out"
                  style={{ width: `${(activeQuizIndex / (quizzes?.length || 1)) * 100}%` }}
                ></div>
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-brand-900 leading-snug">{currentQuiz.question}</h3>
              </div>

              <div className="space-y-3">
                {currentQuiz.options.map((opt, idx) => (
                  <button
                    key={idx}
                    disabled={quizAnswerStatus !== null}
                    onClick={() => onQuizOptionClick(currentQuiz, idx)}
                    className={`w-full text-left p-5 rounded-2xl border-2 font-bold transition-all flex items-center justify-between group ${
                      selectedQuizOption === idx
                        ? quizAnswerStatus === 'correct'
                          ? 'bg-green-50 border-green-500 text-green-800'
                          : 'bg-rose-50 border-rose-500 text-rose-800'
                        : 'bg-white border-brand-100 text-brand-700 hover:border-brand-300 hover:bg-brand-50'
                    }`}
                  >
                    <span className="text-lg">{opt}</span>
                    {selectedQuizOption === idx && (
                      quizAnswerStatus === 'correct' ? (
                        <CheckCircle size={24} className="text-green-600" />
                      ) : (
                        <XCircle size={24} className="text-rose-500" />
                      )
                    )}
                    {selectedQuizOption !== idx && (
                      <div className="w-6 h-6 rounded-full border-2 border-brand-200 group-hover:border-brand-400" />
                    )}
                  </button>
                ))}
              </div>

              {quizAnswerStatus && (
                <div className="animate-slide-up p-6 bg-brand-50 rounded-2xl border border-brand-200 shadow-sm">
                  <h4 className="font-bold text-brand-900 flex items-center gap-2 mb-2">
                    <Sparkles size={18} className="text-purple-500" /> Explanation
                  </h4>
                  <p className="text-brand-700 leading-relaxed mb-6">{currentQuiz.explanation}</p>

                  <div className="flex justify-end">
                    <button
                      onClick={onNextQuiz}
                      className="bg-brand-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-brand-800 flex items-center gap-2"
                    >
                      {activeQuizIndex < (quizzes?.length || 1) - 1 ? 'Next Question' : 'Finish Quiz'}{' '}
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
