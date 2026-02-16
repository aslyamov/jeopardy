import { QuestionPack, GameState } from './types';

const PACKS_KEY = 'jeopardy_packs';
const GAME_KEY = 'jeopardy_game';

// --- Наборы вопросов ---

export function savePacks(packs: QuestionPack[]): void {
  localStorage.setItem(PACKS_KEY, JSON.stringify(packs));
}

export function loadPacks(): QuestionPack[] {
  const raw = localStorage.getItem(PACKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addPack(pack: QuestionPack): void {
  const packs = loadPacks();
  packs.push(pack);
  savePacks(packs);
}

export function deletePack(index: number): void {
  const packs = loadPacks();
  packs.splice(index, 1);
  savePacks(packs);
}

// --- Сохранение игры ---

export function saveGame(state: GameState): void {
  localStorage.setItem(GAME_KEY, JSON.stringify(state));
}

export function loadGame(): GameState | null {
  const raw = localStorage.getItem(GAME_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearGame(): void {
  localStorage.removeItem(GAME_KEY);
}

// --- Встроенные наборы из packs/ ---

export async function loadBuiltinPacks(): Promise<void> {
  try {
    const res = await fetch('packs/index.json');
    if (!res.ok) return;

    const fileNames: string[] = await res.json();
    const existingPacks = loadPacks();
    const existingTitles = new Set(existingPacks.map((p) => p.title));

    let added = false;
    for (const fileName of fileNames) {
      const packRes = await fetch(`packs/${fileName}`);
      if (!packRes.ok) continue;

      const pack: QuestionPack = await packRes.json();
      if (!pack.title || existingTitles.has(pack.title)) continue;

      existingPacks.push(pack);
      existingTitles.add(pack.title);
      added = true;
    }

    if (added) {
      savePacks(existingPacks);
    }
  } catch {
    // Не удалось загрузить — ничего страшного, работаем без встроенных
  }
}
