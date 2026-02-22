import { Chessground } from 'chessground';
import { Chess } from 'chess.js';

/** Render a chess position into `container` using Chessground. */
export function mountBoard(container: HTMLElement, fen: string): void {
  Chessground(container, {
    fen,
    coordinates: true,
    animation: { enabled: false },
    movable:    { free: false, color: undefined },   // фигуры не двигаются
    draggable:  { enabled: false },
    selectable: { enabled: false },
    drawable: {
      enabled: true,      // правая кнопка: стрелки и кружки
      visible: true,
      eraseOnClick: false,
    },
  });
}

/** Return true if the FEN string is syntactically valid. */
export function isValidFen(fen: string): boolean {
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
}
