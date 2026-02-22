import { navigate } from '../router';
import { game } from '../state';
import { saveGame } from '../storage';
import { mountBoard } from '../chessboard';
import { escHtml, sanitizeImageUrl } from '../utils';

// ── Module-level state ───────────────────────────────────────
let timerInterval: ReturnType<typeof setInterval> | null = null;
let timeLeft = 0;
let selectedPlayers = new Set<number>(); // indices into game.players
let answerShown = false;
let locked = false;

// ── Entry point ──────────────────────────────────────────────
export function render(container: HTMLElement): void {
  if (!game?.cur) { navigate('game-board'); return; }

  selectedPlayers = new Set();
  answerShown = false;
  locked = false;

  const { catIdx, qIdx } = game.cur;
  const cat = game.pack.categories[catIdx];
  const q = cat.questions[qIdx];
  const safeImage = q.image ? sanitizeImageUrl(q.image) : '';

  container.innerHTML = `
    <div class="flex flex-col items-center min-h-screen px-4 pt-6 pb-12">

      <!-- Category · Value -->
      <div class="text-center mb-3">
        <span class="text-gray-400 text-sm">${escHtml(cat.name)}</span>
        <span class="text-gray-400 text-sm"> · </span>
        <span class="text-yellow-400 font-black" style="font-size:2.5rem;vertical-align:middle">
          ${escHtml(q.value)}
        </span>
      </div>

      <!-- Chess board -->
      ${q.fen ? `<div class="cg-container mb-4" id="cg-wrap"></div>` : ''}

      <!-- URL image -->
      ${safeImage ? `
        <div class="mb-4">
          <img src="${safeImage}" alt=""
               class="rounded-xl" style="max-width:min(100%,480px);max-height:320px">
        </div>` : ''}

      <!-- Question text -->
      <div class="font-bold text-center mb-5"
           style="font-size:1.5rem;max-width:580px;line-height:1.3">
        ${escHtml(q.question)}
      </div>

      <!-- Answer (hidden until revealed) -->
      <div id="answer-block"
           class="hidden text-center mb-5 px-6 py-4 rounded-xl w-full"
           style="max-width:580px;background:#1f2937">
        <div class="text-gray-400 text-sm mb-1">Правильный ответ:</div>
        <div class="font-semibold text-green-400" style="font-size:1.15rem">
          ${escHtml(q.answer)}
        </div>
      </div>

      <!-- Selection hint -->
      <div id="hint" class="text-gray-500 text-xs mb-2">
        Нажми на игрока — ему начислятся очки
      </div>

      <!-- Lock indicator -->
      <div id="lock-badge" class="hidden mb-2 px-3 py-1 rounded-full text-xs font-bold"
           style="background:#374151;color:#9ca3af">
        🔒 Заблокировано
      </div>

      <!-- Single row: players + timer + action buttons -->
      <div class="flex gap-3 justify-center items-center flex-nowrap overflow-x-auto pb-1 w-full">

        <!-- Player buttons (injected by buildPlayerButtons) -->
        <div id="player-btns" class="flex gap-3 shrink-0"></div>

        <!-- Timer (inline, hidden by default) -->
        <div id="q-timer"
             class="hidden text-yellow-400 font-black text-2xl bg-gray-800 px-5 py-3 rounded-xl min-w-[84px] text-center shrink-0">
        </div>

        <button id="btn-show-answer"
          class="text-xl px-4 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 border-0 cursor-pointer text-white shrink-0"
          title="Показать ответ">👁</button>

        <button id="btn-confirm"
          class="hidden text-xl px-4 py-3 rounded-xl bg-green-700 hover:bg-green-600 border-0 cursor-pointer font-bold text-white shrink-0"
          title="Засчитать">✅</button>

        <button id="btn-skip"
          class="hidden text-xl px-4 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 border-0 cursor-pointer text-white shrink-0"
          title="Пропустить">⏩</button>

        <button id="btn-back"
          class="text-xl px-4 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 border-0 cursor-pointer text-white shrink-0"
          title="Назад к полю">⬅</button>
      </div>
    </div>
  `;

  // Mount Chessground after element is in DOM
  if (q.fen) {
    mountBoard(container.querySelector<HTMLElement>('#cg-wrap')!, q.fen);
  }

  buildPlayerButtons(container);
  attachActions(container, q.value);
  startTimer(game.timerSecs, container);

  // L / Д key lock
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'l' || e.key === 'L' || e.key === 'д' || e.key === 'Д') toggleLock(container);
  };
  document.addEventListener('keydown', onKey);
  // Clean up listener when navigating away
  (container as any).__cleanupKey = () => document.removeEventListener('keydown', onKey);
}

// ── Player toggle buttons ────────────────────────────────────
function buildPlayerButtons(container: HTMLElement): void {
  const wrap = container.querySelector<HTMLElement>('#player-btns')!;
  game!.players.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.className = 'player-btn';
    btn.dataset.idx = String(i);
    btn.textContent = p.name;
    btn.addEventListener('click', () => togglePlayer(i, container));
    wrap.appendChild(btn);
  });
}

function togglePlayer(idx: number, container: HTMLElement): void {
  if (locked) return;
  if (selectedPlayers.has(idx)) {
    selectedPlayers.delete(idx);
  } else {
    selectedPlayers.add(idx);
  }
  updatePlayerButtons(container);
  updateHint(container);
  updateConfirmBtn(container);
}

function updatePlayerButtons(container: HTMLElement): void {
  container.querySelectorAll<HTMLButtonElement>('#player-btns button').forEach(btn => {
    const idx = Number(btn.dataset.idx);
    if (selectedPlayers.has(idx)) {
      btn.style.background = '#059669';
      btn.style.borderColor = '#34d399';
      btn.style.boxShadow = '0 0 0 3px rgba(52,211,153,0.35)';
    } else {
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.boxShadow = '';
    }
  });
}

function updateHint(container: HTMLElement): void {
  const hint = container.querySelector<HTMLElement>('#hint')!;
  if (selectedPlayers.size === 0) {
    hint.textContent = 'Нажми на игрока — ему начислятся очки';
  } else {
    const names = [...selectedPlayers].map(i => game!.players[i].name).join(', ');
    hint.textContent = `Очки получат: ${names}`;
    hint.style.color = '#34d399';
  }
}

function updateConfirmBtn(container: HTMLElement): void {
  const btn = container.querySelector<HTMLButtonElement>('#btn-confirm')!;
  btn.classList.toggle('hidden', selectedPlayers.size === 0);
}

// ── Action buttons ───────────────────────────────────────────
function attachActions(container: HTMLElement, value: number): void {
  container.querySelector('#btn-show-answer')!.addEventListener('click', () => {
    if (locked) return;
    revealAnswer(container);
  });

  container.querySelector('#btn-confirm')!.addEventListener('click', () => {
    if (locked || selectedPlayers.size === 0) return;
    stopTimer();
    selectedPlayers.forEach(i => { game!.players[i].score += value; });
    markAnswered();
    cleanup(container);
    navigate('game-board');
  });

  container.querySelector('#btn-skip')!.addEventListener('click', () => {
    if (locked) return;
    stopTimer();
    markAnswered();
    cleanup(container);
    navigate('game-board');
  });

  // Back = PEEK: go back WITHOUT marking as answered
  container.querySelector('#btn-back')!.addEventListener('click', () => {
    if (locked) return;
    stopTimer();
    cleanup(container);
    navigate('game-board');
  });
}

function revealAnswer(container: HTMLElement): void {
  answerShown = true;
  container.querySelector('#answer-block')!.classList.remove('hidden');
  container.querySelector('#btn-show-answer')!.classList.add('hidden');
  container.querySelector('#btn-skip')!.classList.remove('hidden');
  stopTimer();
}

// ── Timer ────────────────────────────────────────────────────
function startTimer(secs: number, container: HTMLElement): void {
  stopTimer();
  if (secs <= 0) return;
  timeLeft = secs;
  const el = container.querySelector<HTMLElement>('#q-timer')!;
  el.classList.remove('hidden');
  el.style.color = '#ffd600';
  el.textContent = formatTime(timeLeft);

  timerInterval = setInterval(() => {
    timeLeft--;
    el.textContent = timeLeft > 0 ? formatTime(timeLeft) : '⏰';
    if (timeLeft <= 5 && timeLeft > 0) el.style.color = '#f87171';
    if (timeLeft <= 0) {
      stopTimer();
      // Auto-reveal answer and show skip
      if (!answerShown) revealAnswer(container);
    }
  }, 1000);
}

function stopTimer(): void {
  if (timerInterval !== null) { clearInterval(timerInterval); timerInterval = null; }
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : String(s);
}

// ── Lock ─────────────────────────────────────────────────────
function toggleLock(container: HTMLElement): void {
  locked = !locked;
  const badge = container.querySelector<HTMLElement>('#lock-badge')!;
  badge.classList.toggle('hidden', !locked);
  // Dim interactive buttons when locked
  ['#btn-show-answer', '#btn-confirm', '#btn-skip', '#btn-back', '#player-btns'].forEach(sel => {
    const el = container.querySelector<HTMLElement>(sel);
    if (el) el.style.opacity = locked ? '0.4' : '1';
  });
}

// ── Helpers ──────────────────────────────────────────────────
function markAnswered(): void {
  if (!game?.cur) return;
  const key = `${game.cur.catIdx}-${game.cur.qIdx}`;
  game.answered.add(key);
  game.cur = null;
  saveGame(game);

  // Check if all questions are answered → results
  const total = game.pack.categories.reduce((s, c) => s + c.questions.length, 0);
  if (game.answered.size >= total) navigate('results');
}

function cleanup(container: HTMLElement): void {
  stopTimer();
  // Remove keydown listener
  const fn = (container as any).__cleanupKey;
  if (fn) { fn(); delete (container as any).__cleanupKey; }
}
