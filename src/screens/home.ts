import { navigate } from '../router';
import { setGame } from '../state';
import { loadSaves, deleteSave } from '../storage';
import { escHtml } from '../utils';
import { showConfirm } from '../modal';

export function render(container: HTMLElement): void {
  const saves = loadSaves().sort((a, b) => b.savedAt - a.savedAt);

  container.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <h1 class="font-black text-yellow-400 text-center tracking-wider"
          style="font-size:clamp(3rem,12vw,6rem);line-height:1">
        СВОЯ ИГРА
      </h1>
      <p class="text-gray-500 text-lg" style="margin-bottom:16px">
        Создавай вопросы. Играй с друзьями.
      </p>

      <div class="flex flex-col gap-3 w-full max-w-xs">
        <button id="btn-new"
          class="py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg
                 transition-colors cursor-pointer border-0 text-white">
          Новая игра
        </button>

        ${saves.length > 0 ? `
          <button id="btn-continue"
            class="py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-lg
                   transition-colors cursor-pointer border-0 text-white">
            Продолжить
          </button>
        ` : ''}

        <button id="btn-editor"
          class="py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-lg
                 transition-colors cursor-pointer border-0 text-white">
          Редактор вопросов
        </button>
      </div>
    </div>
  `;

  container.querySelector<HTMLButtonElement>('#btn-new')!.onclick = () => navigate('setup');
  container.querySelector<HTMLButtonElement>('#btn-editor')!.onclick = () => navigate('editor');

  container.querySelector<HTMLButtonElement>('#btn-continue')?.addEventListener('click', () => {
    showSavePicker(container, saves);
  });
}

// ── Save picker modal ─────────────────────────────────────────
function showSavePicker(
  container: HTMLElement,
  saves: ReturnType<typeof loadSaves>,
): void {
  document.getElementById('save-picker-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'save-picker-modal';
  modal.className =
    'fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4';

  modal.innerHTML = `
    <div class="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full shadow-2xl space-y-4"
         style="max-width:420px">
      <h3 class="text-xl font-bold text-center">Выберите игру</h3>
      <div class="space-y-2" style="max-height:18rem;overflow-y:auto">
        ${saves.map(s => `
          <div class="bg-gray-800 rounded-xl p-4 flex items-center gap-3">
            <div class="min-w-0 flex-1">
              <div class="font-bold text-sm truncate">${escHtml(s.name)}</div>
              <div class="text-xs text-gray-400">${formatDate(s.savedAt)}</div>
            </div>
            <div class="flex gap-2 shrink-0">
              <button data-resume="${escHtml(s.id)}"
                class="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-sm
                       font-bold transition-colors border-0 cursor-pointer text-white">▶</button>
              <button data-del="${escHtml(s.id)}"
                class="bg-red-700/80 hover:bg-red-600 px-3 py-1.5 rounded-lg text-sm
                       transition-colors border-0 cursor-pointer text-white">✕</button>
            </div>
          </div>
        `).join('')}
      </div>
      <button id="picker-close"
        class="w-full py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm
               transition-colors border-0 cursor-pointer text-white">
        Закрыть
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  // Resume
  modal.querySelectorAll<HTMLButtonElement>('[data-resume]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.resume!;
      const slot = loadSaves().find(s => s.id === id);
      if (!slot) return;
      closePicker();
      setGame(slot.state);
      navigate('game-board');
    });
  });

  // Delete
  modal.querySelectorAll<HTMLButtonElement>('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.del!;
      showConfirm('Удалить это сохранение?', () => {
        deleteSave(id);
        closePicker();
        render(container);
      }, { confirmLabel: 'Удалить' });
    });
  });

  document.getElementById('picker-close')?.addEventListener('click', closePicker);
  modal.addEventListener('click', e => { if (e.target === modal) closePicker(); });
}

function closePicker(): void {
  document.getElementById('save-picker-modal')?.remove();
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
