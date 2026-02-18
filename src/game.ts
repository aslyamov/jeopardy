import { GameState, Player } from './types';
import { loadPacks, loadSaves, upsertSave, deleteSave } from './storage';
import { navigateTo } from './app';
import { escapeHtml, showModal } from './utils';

let game: GameState | null = null;
let timerInterval: number | null = null;
let selectedPlayers: Set<number> = new Set();
let setupInitialized = false;
let currentSlotId: string = '';
let currentSaveName: string = '';

// ===================== ЭТАП 3: НАСТРОЙКА ИГРЫ =====================

export function initSetup(): void {
  renderPackSelect();

  // Сбрасываем поля игроков при каждом заходе
  const container = document.getElementById('players-inputs')!;
  container.innerHTML = '';
  addPlayerInput();
  addPlayerInput();

  // Привязываем обработчики только один раз
  if (!setupInitialized) {
    setupInitialized = true;
    document.getElementById('btn-add-player')?.addEventListener('click', addPlayerInput);
    document.getElementById('btn-start-game')?.addEventListener('click', startGame);
  }
}

function renderPackSelect(): void {
  const select = document.getElementById('pack-select') as HTMLSelectElement;
  if (!select) return;

  const packs = loadPacks();
  select.innerHTML = packs.length === 0
    ? '<option value="">Нет наборов — создайте в редакторе</option>'
    : packs.map((p, i) => `<option value="${i}">${escapeHtml(p.title || 'Без названия')} (${p.categories.length} кат.)</option>`).join('');
}

function addPlayerInput(): void {
  const container = document.getElementById('players-inputs')!;
  const idx = container.children.length + 1;
  const div = document.createElement('div');
  div.className = 'flex gap-2 items-center';
  div.innerHTML = `
    <input type="text" class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
      placeholder="Игрок ${idx}" value="Игрок ${idx}" />
    <button class="text-red-400 hover:text-red-300 text-sm transition-colors remove-player">✕</button>
  `;
  div.querySelector('.remove-player')!.addEventListener('click', () => {
    if (container.children.length > 1) div.remove();
  });
  container.appendChild(div);
}

function startGame(): void {
  const packs = loadPacks();
  const select = document.getElementById('pack-select') as HTMLSelectElement;
  const packIdx = parseInt(select.value);

  if (isNaN(packIdx) || !packs[packIdx]) {
    showModal('Выберите набор вопросов');
    return;
  }

  const pack = packs[packIdx];
  const container = document.getElementById('players-inputs')!;
  const playerInputs = container.querySelectorAll<HTMLInputElement>('input[type="text"]');
  const players: Player[] = Array.from(playerInputs)
    .map((input) => ({ name: input.value.trim() || 'Игрок', score: 0 }));

  if (players.length === 0) {
    showModal('Добавьте хотя бы одного игрока');
    return;
  }

  const timerInput = document.getElementById('timer-input') as HTMLInputElement;
  const timer = parseInt(timerInput.value) || 0;

  const answered = pack.categories.map((cat) => cat.questions.map(() => false));

  // Новый слот для этой игры
  currentSlotId = Date.now().toString();
  currentSaveName = `${pack.title} · ${players.map((p) => p.name).join(', ')}`;

  game = { pack, players, timer, answered, currentQuestion: null };
  autoSave();
  renderBoard();
  navigateTo('board');
}

export function resumeGame(slotId: string): void {
  const slot = loadSaves().find((s) => s.id === slotId);
  if (!slot) return;
  game = slot.state;
  currentSlotId = slot.id;
  currentSaveName = slot.name;
  renderBoard();
  navigateTo('board');
}

function autoSave(): void {
  if (!game || !currentSlotId) return;
  upsertSave({
    id: currentSlotId,
    name: currentSaveName,
    savedAt: Date.now(),
    state: game,
  });
}

// ===================== ЭТАП 4: ИГРОВОЕ ПОЛЕ =====================

function renderBoard(): void {
  if (!game) return;

  const boardEl = document.getElementById('game-board')!;
  const { pack, answered } = game;

  const maxQuestions = Math.max(...pack.categories.map((c) => c.questions.length));

  let html = `<div class="grid gap-1.5" style="grid-template-columns: minmax(110px, 180px) repeat(${maxQuestions}, minmax(0, 1fr))">`;

  pack.categories.forEach((cat, ci) => {
    html += `<div class="bg-board flex items-center justify-center py-3 px-3 rounded-l-lg font-bold text-sm text-gold text-center leading-tight">${escapeHtml(cat.name)}</div>`;

    for (let qi = 0; qi < maxQuestions; qi++) {
      const q = cat.questions[qi];
      if (!q) {
        html += `<div class="bg-gray-900/30 rounded p-1"></div>`;
        continue;
      }
      const isAnswered = answered[ci]?.[qi];
      if (isAnswered) {
        html += `<div class="bg-gray-800/30 rounded py-3 text-center"></div>`;
      } else {
        html += `
          <button data-cell="${ci}-${qi}"
            class="bg-cell hover:bg-blue-700 rounded py-3 px-3 text-center font-black text-xl text-gold transition-colors cursor-pointer">
            ${q.value}
          </button>`;
      }
    }
  });

  html += '</div>';
  boardEl.innerHTML = html;

  boardEl.querySelectorAll<HTMLButtonElement>('[data-cell]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [ci, qi] = btn.dataset.cell!.split('-').map(Number);
      openQuestion(ci, qi);
    });
  });

  renderScoreboard();
  checkGameEnd();
}

function renderScoreboard(): void {
  if (!game) return;
  const el = document.getElementById('scoreboard')!;
  el.innerHTML = `
    <div class="flex flex-wrap gap-3 justify-center">
      ${game.players.map((p) => `
        <div class="bg-gray-800 rounded-xl px-5 py-2.5 text-center min-w-[110px]">
          <div class="text-sm text-gray-400 truncate">${escapeHtml(p.name)}</div>
          <div class="text-2xl font-black ${p.score >= 0 ? 'text-gold' : 'text-red-400'}">${p.score}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ===================== ЭТАП 5: ЭКРАН ВОПРОСА =====================

function openQuestion(catIdx: number, qIdx: number): void {
  if (!game) return;

  game.currentQuestion = { catIdx, qIdx };
  selectedPlayers = new Set();
  const question = game.pack.categories[catIdx].questions[qIdx];
  const imageSrc = question.image ? escapeHtml(question.image) : '';

  const screen = document.getElementById('screen-question')!;
  screen.innerHTML = `
    <div class="w-full mx-auto flex flex-col items-center gap-6">
      <!-- Категория и сумма -->
      <div class="text-center">
        <span class="text-gray-400 text-sm">${escapeHtml(game.pack.categories[catIdx].name)}</span>
        <span class="text-gold font-black text-3xl ml-3">${question.value}</span>
      </div>

      <!-- Картинка -->
      ${imageSrc ? `<img src="${imageSrc}" class="max-h-[70vh] w-auto rounded-xl object-contain" alt="Вопрос" />` : ''}

      <!-- Вопрос -->
      <div class="text-2xl md:text-4xl font-bold text-center leading-snug px-4">
        ${escapeHtml(question.question)}
      </div>

      <!-- Таймер -->
      <div id="timer-display" class="text-6xl font-black text-gray-600 ${game.timer === 0 ? 'hidden' : ''}">
        ${game.timer}
      </div>

      <!-- Ответ (скрыт) -->
      <div id="answer-block" class="hidden text-center space-y-2">
        <div class="text-gray-400 text-sm">Правильный ответ:</div>
        <div class="text-3xl font-bold text-emerald-400">${escapeHtml(question.answer)}</div>
      </div>

      <!-- Кнопки игроков: выбор кому начислить -->
      <div id="player-buttons" class="flex flex-wrap gap-3 justify-center">
        ${game.players.map((p, i) => `
          <button data-toggle-player="${i}"
            class="px-5 py-3 rounded-xl font-bold transition-all text-sm md:text-base border-2 border-gray-600 bg-gray-700 hover:bg-gray-600 text-white">
            ${escapeHtml(p.name)}
          </button>
        `).join('')}
      </div>
      <p id="selection-hint" class="text-gray-500 text-xs">Нажми на игрока — ему начислятся очки</p>

      <!-- Действия -->
      <div class="flex flex-wrap gap-3 justify-center mt-2">
        <button id="btn-show-answer" class="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl transition-colors">
          Показать ответ
        </button>
        <button id="btn-confirm-next" class="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold transition-colors hidden">
          Далее →
        </button>
        <button id="btn-skip-question" class="bg-yellow-600 hover:bg-yellow-500 px-6 py-3 rounded-xl font-bold transition-colors hidden">
          Никто не ответил
        </button>
        <button id="btn-back-board" class="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl transition-colors">
          Назад к полю
        </button>
      </div>
    </div>
  `;

  navigateTo('question');
  startTimer();

  screen.querySelectorAll<HTMLButtonElement>('[data-toggle-player]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pi = parseInt(btn.dataset.togglePlayer!);
      togglePlayerSelection(pi, btn);
    });
  });

  document.getElementById('btn-show-answer')!.addEventListener('click', () => {
    showAnswer();
    document.getElementById('btn-skip-question')?.classList.remove('hidden');
  });

  document.getElementById('btn-confirm-next')!.addEventListener('click', () => {
    confirmAndClose(question.value);
  });

  document.getElementById('btn-skip-question')!.addEventListener('click', () => {
    stopTimer();
    markAnswered();
    game!.currentQuestion = null;
    goBackToBoard();
  });

  document.getElementById('btn-back-board')!.addEventListener('click', () => {
    stopTimer();
    game!.currentQuestion = null;
    renderBoard();
    navigateTo('board');
  });
}

function togglePlayerSelection(playerIdx: number, btn: HTMLButtonElement): void {
  if (selectedPlayers.has(playerIdx)) {
    selectedPlayers.delete(playerIdx);
    btn.className = 'px-5 py-3 rounded-xl font-bold transition-all text-sm md:text-base border-2 border-gray-600 bg-gray-700 hover:bg-gray-600 text-white';
  } else {
    selectedPlayers.add(playerIdx);
    btn.className = 'px-5 py-3 rounded-xl font-bold transition-all text-sm md:text-base border-2 border-emerald-400 bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/50';
  }

  const nextBtn = document.getElementById('btn-confirm-next');
  const skipBtn = document.getElementById('btn-skip-question');
  const hint = document.getElementById('selection-hint');
  if (selectedPlayers.size > 0) {
    nextBtn?.classList.remove('hidden');
    skipBtn?.classList.add('hidden');
    if (hint) hint.textContent = `Очки получат: ${Array.from(selectedPlayers).map(i => game!.players[i].name).join(', ')}`;
  } else {
    nextBtn?.classList.add('hidden');
    const answerVisible = !document.getElementById('answer-block')?.classList.contains('hidden');
    if (answerVisible) skipBtn?.classList.remove('hidden');
    if (hint) hint.textContent = 'Нажми на игрока — ему начислятся очки';
  }
}

function confirmAndClose(value: number): void {
  if (!game) return;
  stopTimer();
  selectedPlayers.forEach((pi) => { game!.players[pi].score += value; });
  markAnswered();
  autoSave();
  game.currentQuestion = null;
  goBackToBoard();
}

function goBackToBoard(): void {
  if (!game) return;
  const allAnswered = game.answered.every((cat) => cat.every((a) => a));
  if (allAnswered) {
    showResults();
  } else {
    renderBoard();
    navigateTo('board');
  }
}

function markAnswered(): void {
  if (!game || !game.currentQuestion) return;
  const { catIdx, qIdx } = game.currentQuestion;
  game.answered[catIdx][qIdx] = true;
  autoSave();
}

function showAnswer(): void {
  stopTimer();
  document.getElementById('answer-block')?.classList.remove('hidden');
}

function startTimer(): void {
  if (!game || game.timer === 0) return;

  let remaining = game.timer;
  const display = document.getElementById('timer-display')!;
  display.textContent = String(remaining);
  display.classList.remove('text-gray-600');
  display.classList.add('text-white');

  timerInterval = window.setInterval(() => {
    remaining--;
    display.textContent = String(remaining);

    if (remaining <= 5) {
      display.classList.remove('text-white');
      display.classList.add('text-red-400');
    }

    if (remaining <= 0) {
      stopTimer();
      display.textContent = '⏰';
      showAnswer();
      document.getElementById('btn-skip-question')?.classList.remove('hidden');
    }
  }, 1000);
}

function stopTimer(): void {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// ===================== ЭТАП 7: ИТОГИ =====================

function checkGameEnd(): void {
  if (!game) return;
  const allAnswered = game.answered.every((cat) => cat.every((a) => a));
  const endBtn = document.getElementById('btn-end-game');
  if (endBtn) endBtn.classList.toggle('hidden', allAnswered);
  if (allAnswered) showResults();
}

export function initBoard(): void {
  document.getElementById('btn-end-game')?.addEventListener('click', () => {
    showModal('Завершить игру и показать итоги?', () => {
      showResults();
    });
  });
}

function showResults(): void {
  if (!game) return;
  stopTimer();

  const sorted = [...game.players].sort((a, b) => b.score - a.score);
  const maxScore = sorted[0]?.score ?? 0;

  document.getElementById('results-content')!.innerHTML = `
    <div class="w-full space-y-3">
      ${sorted.map((p, i) => {
        const isWinner = p.score === maxScore && i === 0;
        return `
        <div class="flex items-center gap-4 ${isWinner ? 'bg-gold/10 border border-gold/30' : 'bg-gray-800'} rounded-xl p-4">
          <div class="text-3xl font-black ${isWinner ? 'text-gold' : 'text-gray-500'} w-10 text-center">${i + 1}</div>
          <div class="flex-1">
            <div class="font-bold text-lg ${isWinner ? 'text-gold' : ''}">${isWinner ? '👑 ' : ''}${escapeHtml(p.name)}</div>
          </div>
          <div class="text-2xl font-black ${p.score >= 0 ? 'text-emerald-400' : 'text-red-400'}">${p.score}</div>
        </div>`;
      }).join('')}
    </div>
  `;

  // Удаляем завершённую игру из сохранений
  if (currentSlotId) deleteSave(currentSlotId);
  currentSlotId = '';

  navigateTo('results');
}
