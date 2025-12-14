'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Quiz, QuizOption, QuizAttemptResult } from '@/features/quiz/types';
import { getMistakeQuizzes, submitQuizAnswer } from '@/features/quiz/api';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Loader2, ChevronRight, Trophy } from 'lucide-react';

/**
 * Review Mistakes Page
 * Allows users to retry quizzes they got wrong
 * 
 * Flow:
 * 1. Fetch mistake quizzes from backend
 * 2. Show quizzes one by one
 * 3. Submit answer - if correct, remove from MistakeQuiz
 * 4. Continue until all reviewed
 */
export default function ReviewPage() {
  const router = useRouter();
  
  const [mistakeQuizzes, setMistakeQuizzes] = useState<Quiz[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<QuizOption | null>(null);
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

  const handleOptionSelect = (option: QuizOption) => {
    if (!result) {
      setSelectedOption(option);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption || !currentQuiz) return;

    setIsSubmitting(true);
    try {
      const submitResult = await submitQuizAnswer({
        quizId: currentQuiz.id,
        selectedOption,
      });
      setResult(submitResult);
      
      // Update stats
      if (submitResult.isCorrect) {
        setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
        // If correct, backend already removed from MistakeQuiz
      } else {
        setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
    setSelectedOption(null);
    setResult(null);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setResult(null);
    setStats({ correct: 0, wrong: 0 });
    loadMistakeQuizzes();
  };

  const getOptionStyle = (option: QuizOption) => {
    if (!result) {
      return selectedOption === option
        ? 'border-blue-500 bg-blue-500/10'
        : 'border-gray-600 hover:border-gray-500';
    }

    if (option === result.correctOption) {
      return 'border-green-500 bg-green-500/10';
    }
    if (option === selectedOption && !result.isCorrect) {
      return 'border-red-500 bg-red-500/10';
    }
    return 'border-gray-600 opacity-50';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-500 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Loading your mistakes to review...</p>
        </div>
      </div>
    );
  }

  // No mistakes - all caught up!
  if (mistakeQuizzes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-500" size={64} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">All Caught Up! 🎉</h1>
          <p className="text-gray-400 mb-8">
            You don't have any mistakes to review. Keep practicing to maintain your streak!
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Completed review session
  if (isComplete) {
    const accuracy = Math.round((stats.correct / (stats.correct + stats.wrong)) * 100);
    
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="text-yellow-500" size={64} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Review Complete!</h1>
          
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-white">{stats.correct + stats.wrong}</p>
                <p className="text-sm text-gray-400">Reviewed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-400">{stats.correct}</p>
                <p className="text-sm text-gray-400">Correct</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-red-400">{stats.wrong}</p>
                <p className="text-sm text-gray-400">Wrong</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-400">Accuracy</p>
              <p className="text-4xl font-bold text-purple-400">{accuracy}%</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={handleRestart}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> Review Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main review interface
  const options: { label: QuizOption; text: string }[] = [
    { label: QuizOption.A, text: currentQuiz.optionA },
    { label: QuizOption.B, text: currentQuiz.optionB },
    { label: QuizOption.C, text: currentQuiz.optionC },
    { label: QuizOption.D, text: currentQuiz.optionD },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={20} /> Back
          </button>
          <div className="flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full font-semibold">
            <RotateCcw size={16} />
            <span>{mistakeQuizzes.length - currentIndex} Remaining</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress</span>
            <span>{currentIndex + 1} / {mistakeQuizzes.length}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / mistakeQuizzes.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Quiz Card */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-2 text-purple-400 text-sm mb-4">
            <span className="px-2 py-1 bg-purple-500/20 rounded">Audio #{currentQuiz.audioId}</span>
            <span className="px-2 py-1 bg-gray-700 rounded">Quiz #{currentQuiz.id}</span>
          </div>

          {/* Question */}
          <h2 className="text-xl text-white font-semibold mb-6">{currentQuiz.questionText}</h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {options.map((option) => (
              <button
                key={option.label}
                onClick={() => handleOptionSelect(option.label)}
                disabled={!!result}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${getOptionStyle(
                  option.label
                )} ${result ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="font-bold text-white mr-2">{option.label}.</span>
                <span className="text-gray-200">{option.text}</span>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          {!result && (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption || isSubmitting}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          )}

          {/* Result Feedback */}
          {result && (
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
                      <p className="text-sm text-gray-300">This quiz has been removed from your review list.</p>
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
                      <p className="text-sm text-gray-400 mt-1">This quiz will stay in your review list.</p>
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

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                {hasMore ? (
                  <>Next Quiz <ChevronRight size={20} /></>
                ) : (
                  'Finish Review'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4 flex justify-around text-center">
          <div>
            <p className="text-2xl font-bold text-green-400">{stats.correct}</p>
            <p className="text-sm text-gray-400">Correct</p>
          </div>
          <div className="border-l border-gray-700" />
          <div>
            <p className="text-2xl font-bold text-red-400">{stats.wrong}</p>
            <p className="text-sm text-gray-400">Wrong</p>
          </div>
          <div className="border-l border-gray-700" />
          <div>
            <p className="text-2xl font-bold text-purple-400">{mistakeQuizzes.length - currentIndex}</p>
            <p className="text-sm text-gray-400">Remaining</p>
          </div>
        </div>
      </div>
    </div>
  );
}
