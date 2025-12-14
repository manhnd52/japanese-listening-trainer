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

export interface AudioTrack {
  id: string;
  title: string;
  overview?: string;
  fileUrl: string;
  duration: number;
  folderId: string;
  folder?: Folder;
  status?: AudioStatus;
  isFavorite?: boolean;
  isSuspend?: boolean;
  script?: string;
  quizzes?: Quiz[];
  // Thêm các trường khác nếu cần
}

export type ThemeMode = 'dark' | 'light';

export interface StatCardData {
  label: string;
  value: string | number;
  subValue?: string;
  unit?: string;
  icon: 'clock' | 'activity' | 'lightning' | 'trophy';
}

export interface BarChartData {
  day: string;
  value: number;
}

export interface HeatmapData {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface DashboardStats {
  period: 'Week' | 'Month' | 'All';
  cards: StatCardData[];    
  activity: BarChartData[]; 
  heatmap: HeatmapData[];  
  quizStats: {              
    correct: number;      
    wrong: number;     
    totalCorrect: number;   
  };
}