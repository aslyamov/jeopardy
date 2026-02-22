import { Pack, GameState } from './types';
import { BUILTIN_PACKS } from './data';
import { loadStoredPacks } from './storage';

export const packs: Pack[] = [...BUILTIN_PACKS, ...loadStoredPacks()];
export const BUILTIN_PACK_COUNT = BUILTIN_PACKS.length;

export let selectedPackIdx = 0;
export let setupPlayers: string[] = ['Игрок 1', 'Игрок 2'];
export let setupTimerSecs = 0;
export let game: GameState | null = null;

export function setSelectedPackIdx(i: number): void { selectedPackIdx = i; }
export function setSetupPlayers(p: string[]): void { setupPlayers = p; }
export function setSetupTimerSecs(s: number): void { setupTimerSecs = s; }
export function setGame(g: GameState | null): void { game = g; }
export function addPack(p: Pack): void { packs.push(p); }

/** Sync the in-memory packs array with localStorage (call before setup renders). */
export function refreshPacks(): void {
  packs.splice(0, packs.length, ...BUILTIN_PACKS, ...loadStoredPacks());
}
