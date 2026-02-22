export interface Player {
  name: string;
  score: number;
}

export interface Question {
  value: number;
  question: string;
  answer: string;
  fen?: string;
  image?: string;
  moves?: string[]; // UCI moves e.g. ['e2e4', 'e7e5']
}

export interface Category {
  name: string;
  questions: Question[];
}

export interface Pack {
  title: string;
  categories: Category[];
}

export interface GameState {
  id: string;            // unique save slot ID
  pack: Pack;
  players: Player[];
  timerSecs: number;
  answered: Set<string>; // "catIdx-qIdx"
  cur: { catIdx: number; qIdx: number } | null;
}

export interface SaveSlot {
  id: string;
  name: string;    // "{packTitle} · {player1}, {player2}"
  savedAt: number; // ms timestamp
  state: GameState;
}

export type ScreenName = 'home' | 'setup' | 'game-board' | 'question' | 'results' | 'editor';
