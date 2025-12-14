'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { closeQuizModal, nextQuiz, setLoading, setQuizResult, setError } from '@/store/features/quiz/quizSlice';
import { QuizOption } from './types';
import { submitQuizAnswer } from './api';
import { X, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

export default function QuizModal() {
  const dispatch = useAppDispatch();
  const { currentQuiz, allQuizzes, currentIndex, result, showModal, isLoading, mode } = useAppSelector((state) => state.quiz);
  
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Reset local state when currentQuiz changes (for "all quizzes" mode)
  useEffect(() => {
    setSelectedOption(null);
    setHasSubmitted(false);
  }, [currentQuiz?.id]);

  if (!showModal || !currentQuiz) return null;

  const isAllMode = mode === 'all';
  const hasNextQuiz = isAllMode && currentIndex < allQuizzes.length - 1;
  const quizProgress = isAllMode ? `${currentIndex + 1} / ${allQuizzes.length}` : null;

  const handleOptionSelect = (option: QuizOption) => {
    if (!hasSubmitted) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption || !currentQuiz) return;

    dispatch(setLoading(true));
    setHasSubmitted(true);

    try {
      const result = await submitQuizAnswer({
        quizId: currentQuiz.id,
        selectedOption,
      });
      dispatch(setQuizResult(result));
    } catch (error: any) {
      dispatch(setError(error.response?.data?.message || 'Failed to submit answer'));
      setHasSubmitted(false); // Allow retry on error
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleNext = () => {
    dispatch(nextQuiz());
    // Local state will reset via useEffect when currentQuiz changes
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
      return selectedOption === option
        ? 'border-blue-500 bg-blue-500/10'
        : 'border-gray-600 hover:border-gray-500';
    }

    // After submission - show correct/incorrect
    if (result) {
      if (option === result.correctOption) {
        return 'border-green-500 bg-green-500/10';
      }
      if (option === selectedOption && !result.isCorrect) {
        return 'border-red-500 bg-red-500/10';
      }
    }
    return 'border-gray-600 opacity-50';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Quiz Time 🎯</h2>
            {quizProgress && (
              <span className="px-2 py-1 text-sm bg-blue-600 text-white rounded-full">
                {quizProgress}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Question */}
        <div className="p-6">
          <p className="text-lg text-white mb-6">{currentQuiz.questionText}</p>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {options.map((option) => (
              <button
                key={option.label}
                onClick={() => handleOptionSelect(option.label)}
                disabled={hasSubmitted}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${getOptionStyle(
                  option.label
                )} ${hasSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="font-bold text-white mr-2">{option.label}.</span>
                <span className="text-gray-200">{option.text}</span>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          {!hasSubmitted && (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption || isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              {isLoading ? 'Submitting...' : 'Submit Answer'}
            </button>
          )}

          {/* Result Feedback */}
          {result && hasSubmitted && (
            <div className="mt-6">
              <div
                className={`flex items-center gap-3 p-4 rounded-lg ${
                  result.isCorrect ? 'bg-green-500/10 border border-green-500' : 'bg-red-500/10 border border-red-500'
                }`}
              >
                {result.isCorrect ? (
                  <>
                    <CheckCircle className="text-green-500" size={24} />
                    <div>
                      <p className="font-bold text-green-400">Correct! 🎉</p>
                      {result.expGained && (
                        <p className="text-sm text-gray-300">+{result.expGained} EXP</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="text-red-500" size={24} />
                    <div>
                      <p className="font-bold text-red-400">Incorrect</p>
                      <p className="text-sm text-gray-300">
                        Correct answer: <strong>{result.correctOption}</strong>
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                  <p className="text-sm font-semibold text-gray-300 mb-1">Explanation:</p>
                  <p className="text-gray-200">{result.explanation}</p>
                </div>
              )}

              {/* Continue/Next Button */}
              {hasNextQuiz ? (
                <button
                  onClick={handleNext}
                  className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  Next Quiz <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleClose}
                  className="w-full mt-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition"
                >
                  {isAllMode ? 'Finish 🎉' : 'Continue'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
