import { GameState, SaveSlot, Pack } from './types';

const SAVES_KEY  = 'jeopardy_saves';
const PACKS_KEY  = 'jeopardy_packs';

// ── Pack storage ──────────────────────────────────────────────

export function loadStoredPacks(): Pack[] {
  try {
    const raw = localStorage.getItem(PACKS_KEY);
    return raw ? (JSON.parse(raw) as Pack[]) : [];
  } catch { return []; }
}

export function saveStoredPacks(packs: Pack[]): void {
  localStorage.setItem(PACKS_KEY, JSON.stringify(packs));
}

export function upsertStoredPack(pack: Pack, idx?: number): void {
  const all = loadStoredPacks();
  if (idx !== undefined && idx >= 0) all[idx] = pack; else all.push(pack);
  saveStoredPacks(all);
}

export function deleteStoredPack(idx: number): void {
  const all = loadStoredPacks();
  all.splice(idx, 1);
  saveStoredPacks(all);
}

// ── Serialization (Set → array and back) ─────────────────────
interface RawState {
  id: string;
  pack: GameState['pack'];
  players: GameState['players'];
  timerSecs: number;
  answered: string[];
}

interface RawSlot {
  id: string;
  name: string;
  savedAt: number;
  state: RawState;
}

function toRaw(g: GameState): RawState {
  return {
    id: g.id,
    pack: g.pack,
    players: g.players,
    timerSecs: g.timerSecs,
    answered: [...g.answered],
  };
}

function fromRaw(r: RawState): GameState {
  return {
    id: r.id,
    pack: r.pack,
    players: r.players,
    timerSecs: r.timerSecs,
    answered: new Set(r.answered),
    cur: null,
  };
}

function serializeSlot(slot: SaveSlot): RawSlot {
  return { id: slot.id, name: slot.name, savedAt: slot.savedAt, state: toRaw(slot.state) };
}

// ── Public API ────────────────────────────────────────────────

export function loadSaves(): SaveSlot[] {
  try {
    const raw = localStorage.getItem(SAVES_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as RawSlot[]).map(s => ({ ...s, state: fromRaw(s.state) }));
  } catch {
    return [];
  }
}

export function upsertSave(slot: SaveSlot): void {
  const saves = loadSaves();
  const idx = saves.findIndex(s => s.id === slot.id);
  const raws = saves.map(serializeSlot);
  if (idx >= 0) raws[idx] = serializeSlot(slot); else raws.push(serializeSlot(slot));
  localStorage.setItem(SAVES_KEY, JSON.stringify(raws));
}

export function deleteSave(id: string): void {
  const raws = loadSaves().filter(s => s.id !== id).map(serializeSlot);
  localStorage.setItem(SAVES_KEY, JSON.stringify(raws));
}

/** Convenience wrapper — save/update the current game. */
export function saveGame(game: GameState): void {
  const playerNames = game.players.map(p => p.name).join(', ');
  upsertSave({
    id: game.id,
    name: `${game.pack.title} · ${playerNames}`,
    savedAt: Date.now(),
    state: game,
  });
}
