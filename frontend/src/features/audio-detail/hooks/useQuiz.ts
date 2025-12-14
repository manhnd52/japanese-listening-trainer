import { useState } from 'react';
import { Quiz } from '@/types/types';

/**
 * Hook to manage quiz modal state and progression
 * Handles quiz navigation, answer selection, and scoring
 */
export function useQuiz(quizzes: Quiz[] | undefined, onMistake: (quizId: string) => void, onCorrect?: () => void) {
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [activeQuizIndex, setActiveQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizAnswerStatus, setQuizAnswerStatus] = useState<'correct' | 'wrong' | null>(null);

  const currentQuiz = quizzes && quizzes.length > 0 ? quizzes[activeQuizIndex] : null;

  const openQuiz = () => {
    setActiveQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizAnswerStatus(null);
    setIsQuizModalOpen(true);
  };

  const closeQuiz = () => {
    setIsQuizModalOpen(false);
    setActiveQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizAnswerStatus(null);
  };

  const handleQuizOptionClick = (quiz: Quiz, optionIdx: number) => {
    if (quizAnswerStatus !== null) return; // Prevent changing after answer
    setSelectedQuizOption(optionIdx);

    if (optionIdx === quiz.correctAnswer) {
      setQuizAnswerStatus('correct');
      if (onCorrect) onCorrect(); // Gain EXP
    } else {
      setQuizAnswerStatus('wrong');
      onMistake(quiz.id); // Track mistake
    }
  };

  const handleNextQuiz = () => {
    setSelectedQuizOption(null);
    setQuizAnswerStatus(null);
    
    if (quizzes && activeQuizIndex < quizzes.length - 1) {
      setActiveQuizIndex(prev => prev + 1);
    } else {
      // Finished all quizzes
      closeQuiz();
    }
  };

  return {
    isQuizModalOpen,
    activeQuizIndex,
    selectedQuizOption,
    quizAnswerStatus,
    currentQuiz,
    openQuiz,
    closeQuiz,
    handleQuizOptionClick,
    handleNextQuiz,
  };
}
