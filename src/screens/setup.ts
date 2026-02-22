import { navigate } from '../router';
import {
  packs, setupPlayers, setupTimerSecs, selectedPackIdx,
  setSelectedPackIdx, setSetupPlayers, setSetupTimerSecs, setGame, addPack,
  refreshPacks,
} from '../state';
import { showAlert } from '../modal';
import { saveGame } from '../storage';
import { GameState, Pack } from '../types';
import { escHtml } from '../utils';

let localPlayers: string[] = [];

export function render(container: HTMLElement): void {
  refreshPacks();
  localPlayers = [...setupPlayers];
  buildShell(container);
  rebuildPlayersList(container);
  attachEvents(container);
}

function buildShell(container: HTMLElement): void {
  container.innerHTML = `
    <div class="min-h-screen flex flex-col justify-center py-6 px-8" style="max-width:480px;margin:0 auto">
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-bold">Настройка игры</h2>
        <button id="btn-back"
          class="text-blue-400 hover:text-blue-300 bg-transparent border-0 cursor-pointer text-base">
          ← Назад
        </button>
      </div>

      <div class="mb-6">
        <label class="block text-gray-400 text-sm mb-2">Набор вопросов</label>
        <div class="flex gap-2">
          <select id="pack-select"
            class="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white cursor-pointer">
            ${packs.map((p, i) => `
              <option value="${i}" ${i === selectedPackIdx ? 'selected' : ''}>
                ${escHtml(p.title)} (${p.categories.length} кат.)
              </option>
            `).join('')}
          </select>
          <button id="btn-import"
            class="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg border-0 text-white
                   cursor-pointer text-sm whitespace-nowrap">
            Импорт
          </button>
          <input type="file" id="file-input" accept=".json" class="hidden">
        </div>
      </div>

      <div class="mb-6">
        <label class="block text-gray-400 text-sm mb-2">Игроки</label>
        <div id="players-list" class="flex flex-col gap-2 mb-2"></div>
        <button id="btn-add-player"
          class="text-blue-400 hover:text-blue-300 bg-transparent border-0 cursor-pointer text-sm">
          + Добавить игрока
        </button>
      </div>

      <div class="mb-8">
        <label class="block text-gray-400 text-sm mb-2">
          Таймер на вопрос (сек), 0 = без таймера
        </label>
        <input type="number" id="timer-input" value="${setupTimerSecs}" min="0" max="600" step="5"
          class="w-24 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white">
      </div>

      <button id="btn-start"
        class="w-full py-4 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-lg
               border-0 text-white cursor-pointer transition-colors">
        Начать игру
      </button>
    </div>
  `;
}

function rebuildPlayersList(container: HTMLElement): void {
  const list = container.querySelector<HTMLElement>('#players-list')!;
  list.innerHTML = localPlayers.map((name, i) => `
    <div class="flex gap-2 items-center">
      <input type="text" value="${escHtml(name)}" data-idx="${i}"
        class="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white">
      <button class="btn-remove text-red-400 bg-transparent border-0 cursor-pointer
                     text-xl px-2 hover:text-red-300" data-idx="${i}">✕</button>
    </div>
  `).join('');

  list.querySelectorAll<HTMLInputElement>('input').forEach(inp => {
    inp.oninput = () => { localPlayers[Number(inp.dataset.idx)] = inp.value; };
  });

  list.querySelectorAll<HTMLButtonElement>('.btn-remove').forEach(btn => {
    btn.onclick = () => {
      if (localPlayers.length <= 1) return;
      syncPlayersFromInputs(container);
      localPlayers.splice(Number(btn.dataset.idx), 1);
      rebuildPlayersList(container);
    };
  });
}

function syncPlayersFromInputs(container: HTMLElement): void {
  container.querySelectorAll<HTMLInputElement>('#players-list input').forEach((inp, i) => {
    localPlayers[i] = inp.value.trim() || `Игрок ${i + 1}`;
  });
}

function attachEvents(container: HTMLElement): void {
  container.querySelector('#btn-back')!.addEventListener('click', () => navigate('home'));

  container.querySelector('#btn-import')!.addEventListener('click', () => {
    container.querySelector<HTMLInputElement>('#file-input')!.click();
  });

  container.querySelector<HTMLInputElement>('#file-input')!.addEventListener('change', e => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const pack = JSON.parse(reader.result as string) as Pack;
        if (!pack.title || !Array.isArray(pack.categories))
          throw new Error('Нет полей "title" или "categories"');
        addPack(pack);
        setSelectedPackIdx(packs.length - 1);
        showAlert(`Набор «${pack.title}» загружен!`, () => render(container));
      } catch (err) {
        showAlert('Ошибка JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    (e.target as HTMLInputElement).value = '';
  });

  container.querySelector('#btn-add-player')!.addEventListener('click', () => {
    syncPlayersFromInputs(container);
    localPlayers.push(`Игрок ${localPlayers.length + 1}`);
    rebuildPlayersList(container);
  });

  container.querySelector('#btn-start')!.addEventListener('click', () => {
    syncPlayersFromInputs(container);
    const packIdx = Number(container.querySelector<HTMLSelectElement>('#pack-select')!.value);
    const timerSecs = Number(container.querySelector<HTMLInputElement>('#timer-input')!.value) || 0;

    setSelectedPackIdx(packIdx);
    setSetupPlayers([...localPlayers]);
    setSetupTimerSecs(timerSecs);

    const pack = packs[packIdx];
    const players = localPlayers.map(p => ({ name: p.trim() || 'Игрок', score: 0 }));

    const newGame: GameState = {
      id: Date.now().toString(),
      pack,
      players,
      timerSecs,
      answered: new Set(),
      cur: null,
    };
    setGame(newGame);
    saveGame(newGame);
    navigate('game-board');
  });
}
