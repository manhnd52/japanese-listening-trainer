export enum AudioStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SUSPENDED = 'SUSPENDED'
}

export enum QuizType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  VOICE_MATCH = 'VOICE_MATCH'
}

export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index
  explanation: string;
  type: QuizType;
}

export interface AudioTrack {
  id: string | null | undefined;
  title: string;
  url: string; // Mock URL or base64
  duration: number; // in seconds
  folderId: string;
  status: AudioStatus;
  isFavorite: boolean;
  playCount: number;
  lastPlayed?: Date;
  script: string;
  overview?: string; // AI generated context description
  quizzes: Quiz[];
}

export interface Folder {
  id: string;
  name: string;
  isPublic: boolean;
  count: number;
}

export interface UserStats {
  streak: number;
  totalListened: number;
  totalTime: number; // minutes
  level: number;
  exp: number;
  quizAccuracy: number; // percentage
  // New metrics for achievements
  totalCorrectQuizzes: number;
  completedFolders: number;
  consecutiveCorrect: number; 
}

export interface Achievement {
  id: string;
  icon: string; // Emoji or Lucide icon name
  title: string;
  description: string;
  condition: (stats: UserStats) => boolean;
}

export interface DictionaryResult {
  word: string;
  definition: string;
  type: string;
  example: string;
}

export interface Mistake {
  audioId: string;
  quizId: string;
  timestamp: number;
}

export type ThemeMode = 'dark' | 'light';