import { QuestionPack, GameState, SaveSlot } from './types';

const PACKS_KEY = 'jeopardy_packs';
const SAVES_KEY = 'jeopardy_saves';
const OLD_GAME_KEY = 'jeopardy_game'; // для миграции

// --- Наборы вопросов ---

export function savePacks(packs: QuestionPack[]): void {
  localStorage.setItem(PACKS_KEY, JSON.stringify(packs));
}

export function loadPacks(): QuestionPack[] {
  const raw = localStorage.getItem(PACKS_KEY);
  return raw ? JSON.parse(raw) : [];
}

// --- Слоты сохранений ---

export function loadSaves(): SaveSlot[] {
  let saves: SaveSlot[] = [];
  const raw = localStorage.getItem(SAVES_KEY);
  if (raw) {
    try { saves = JSON.parse(raw); } catch {}
  }

  // Миграция со старого формата (одна игра)
  const oldRaw = localStorage.getItem(OLD_GAME_KEY);
  if (oldRaw) {
    try {
      const state: GameState = JSON.parse(oldRaw);
      saves.unshift({
        id: 'legacy_' + Date.now(),
        name: state.pack.title || 'Сохранённая игра',
        savedAt: Date.now(),
        state,
      });
    } catch {}
    localStorage.removeItem(OLD_GAME_KEY);
    localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
  }

  return saves;
}

export function upsertSave(slot: SaveSlot): void {
  const saves = loadSaves();
  const idx = saves.findIndex((s) => s.id === slot.id);
  if (idx >= 0) {
    saves[idx] = slot;
  } else {
    saves.push(slot);
  }
  localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
}

export function deleteSave(id: string): void {
  const saves = loadSaves().filter((s) => s.id !== id);
  localStorage.setItem(SAVES_KEY, JSON.stringify(saves));
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
