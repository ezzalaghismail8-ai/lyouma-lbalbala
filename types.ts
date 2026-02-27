
export type AppLanguage = 'en' | 'ar' | 'fr';
export type ThemeMode = 'light' | 'dark';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  joinedAt: number;
}

export interface MediaFile {
  name: string;
  type: string;
  size: number;
  url: string;
  base64?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Subtitle {
  start: number;
  end: number;
  text: string;
}

export interface TranslationExercise {
  id: string;
  originalTranscription: string;
  sourceText: string;
  userTranslation: string;
  sourceLanguage: string;
  targetLanguage: string;
  aiTranslation?: string;
  subtitles?: Subtitle[];
  feedback?: {
    score: number;
    suggestions: string[];
    incorrectWords: string[];
    aiReference: string;
  };
}

export interface Project {
  id: string;
  name: string;
  mediaType: string;
  targetLanguage: string;
  score: number;
  timestamp: number;
  userTranslation: string;
  thumbnail?: string;
  exerciseData: TranslationExercise;
  mediaUrl?: string; 
  isDemo?: boolean;
  downloadUrl?: string;
}

export type AppView = 'home' | 'studio' | 'chat' | 'settings' | 'profile' | 'library';
export type TranscriptionStep = 'idle' | 'select_languages' | 'choice' | 'processing' | 'manual_workspace' | 'auto_workspace' | 'result';
export type ExerciseMode = 'auto' | 'manual';
