// Quiz types aligned with backend Prisma schema

export enum QuizOption {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D'
}

export interface Quiz {
  id: number;
  userId: number;
  audioId: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: QuizOption;
  explanation?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuizAttemptResult {
  isCorrect: boolean;
  correctOption: QuizOption;
  explanation?: string | null;
  expGained?: number;
}

export interface QuizAttemptInput {
  quizId: number;
  selectedOption: QuizOption;
}

export interface QuizState {
  currentQuiz: Quiz | null;
  result: QuizAttemptResult | null;
  isLoading: boolean;
  error: string | null;
  showModal: boolean;
}
