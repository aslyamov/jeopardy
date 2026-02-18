import { Screen } from './types';
import { loadSaves, deleteSave, loadBuiltinPacks } from './storage';
import { initEditor } from './editor';
import { initSetup, resumeGame, initBoard } from './game';
import { escapeHtml, showModal } from './utils';

// --- Роутинг ---

const screens: Screen[] = ['home', 'setup', 'board', 'question', 'results', 'editor'];

export function navigateTo(screen: Screen): void {
  screens.forEach((id) => {
    const el = document.getElementById(`screen-${id}`);
    if (el) el.classList.toggle('hidden', id !== screen);
  });

  window.location.hash = screen;

  // Обновляем кнопку "Продолжить" при каждом возврате на главную
  if (screen === 'home') updateContinueButton();
}

function updateContinueButton(): void {
  const btn = document.getElementById('btn-continue');
  if (!btn) return;
  btn.classList.toggle('hidden', loadSaves().length === 0);
}

// --- Пикер сохранений ---

function showSavePicker(): void {
  const saves = loadSaves().sort((a, b) => b.savedAt - a.savedAt);

  if (saves.length === 0) {
    updateContinueButton();
    return;
  }

  document.getElementById('save-picker-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'save-picker-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4';
  modal.innerHTML = `
    <div class="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
      <h3 class="text-xl font-bold text-center">Выберите игру</h3>
      <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
        ${saves.map((save) => `
          <div class="bg-gray-800 rounded-xl p-4 flex items-center gap-3">
            <div class="min-w-0 flex-1">
              <div class="font-bold text-sm truncate">${escapeHtml(save.name)}</div>
              <div class="text-xs text-gray-400">${new Date(save.savedAt).toLocaleString('ru')}</div>
            </div>
            <div class="flex gap-2 shrink-0">
              <button data-resume="${save.id}"
                class="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                ▶
              </button>
              <button data-delete-save="${save.id}"
                class="bg-red-600/80 hover:bg-red-500 px-3 py-1.5 rounded-lg text-sm transition-colors">
                ✕
              </button>
            </div>
          </div>
        `).join('')}
      </div>
      <button id="save-picker-close"
        class="w-full bg-gray-700 hover:bg-gray-600 py-2.5 rounded-xl text-sm transition-colors">
        Закрыть
      </button>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelectorAll<HTMLButtonElement>('[data-resume]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeSavePicker();
      resumeGame(btn.dataset.resume!);
    });
  });

  modal.querySelectorAll<HTMLButtonElement>('[data-delete-save]').forEach((btn) => {
    btn.addEventListener('click', () => {
      deleteSave(btn.dataset.deleteSave!);
      closeSavePicker();
      const remaining = loadSaves();
      if (remaining.length > 0) {
        showSavePicker();
      } else {
        updateContinueButton();
        showModal('Все сохранения удалены');
      }
    });
  });

  document.getElementById('save-picker-close')?.addEventListener('click', closeSavePicker);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeSavePicker(); });
}

function closeSavePicker(): void {
  document.getElementById('save-picker-modal')?.remove();
}

// --- Инициализация ---

async function init(): Promise<void> {
  await loadBuiltinPacks();

  updateContinueButton();

  // При загрузке — только безопасные экраны (home, setup, editor)
  const safeScreens: Screen[] = ['home', 'setup', 'editor'];
  const hash = window.location.hash.replace('#', '') as Screen;
  if (hash && safeScreens.includes(hash)) {
    navigateTo(hash);
  } else {
    navigateTo('home');
  }

  window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace('#', '') as Screen;
    if (h && screens.includes(h)) navigateTo(h);
  });

  // --- Кнопки главного экрана ---
  document.getElementById('btn-new-game')?.addEventListener('click', () => {
    initSetup();
    navigateTo('setup');
  });

  document.getElementById('btn-continue')?.addEventListener('click', showSavePicker);

  document.getElementById('btn-editor')?.addEventListener('click', () => {
    navigateTo('editor');
  });

  initEditor();
  initBoard();

  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = (btn as HTMLElement).dataset.nav as Screen;
      navigateTo(target);
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
