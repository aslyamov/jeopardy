// --- Набор вопросов ---

export interface Question {
  value: number;
  question: string;
  answer: string;
  image?: string; // base64 или URL
}

export interface Category {
  name: string;
  questions: Question[];
}

export interface QuestionPack {
  title: string;
  categories: Category[];
}

// --- Игра ---

export interface Player {
  name: string;
  score: number;
}

export interface GameState {
  pack: QuestionPack;
  players: Player[];
  timer: number; // 0 = без таймера, иначе секунды
  answered: boolean[][]; // [categoryIndex][questionIndex]
  currentQuestion: { catIdx: number; qIdx: number } | null;
}

// --- Роутинг ---

export type Screen =
  | 'home'
  | 'setup'
  | 'board'
  | 'question'
  | 'results'
  | 'editor';
