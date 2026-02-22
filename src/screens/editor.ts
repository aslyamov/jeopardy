import { navigate } from '../router';
import { setSelectedPackIdx, BUILTIN_PACK_COUNT } from '../state';
import {
  loadStoredPacks, upsertStoredPack, deleteStoredPack,
} from '../storage';
import { Pack, Category, Question } from '../types';
import { isValidFen } from '../chessboard';
import { escHtml } from '../utils';
import { showAlert, showConfirm } from '../modal';

// ── State ────────────────────────────────────────────────────
let editPack: Pack     = emptyPack();
let editIdx:  number   = -1;   // -1 = new pack

function emptyPack(): Pack {
  return {
    title: '',
    categories: [{ name: '', questions: [{ value: 100, question: '', answer: '' }] }],
  };
}

// ── Entry point ──────────────────────────────────────────────
export function render(container: HTMLElement): void {
  renderPackList(container);
}

// ══════════════════════════════════════════════════════════════
//  VIEW 1: Pack list
// ══════════════════════════════════════════════════════════════
function renderPackList(container: HTMLElement): void {
  const stored = loadStoredPacks();

  container.innerHTML = `
    <div class="min-h-screen p-6" style="max-width:820px;margin:0 auto">

      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Редактор вопросов</h2>
        <button id="btn-back"
          class="text-blue-400 hover:text-blue-300 bg-transparent border-0 cursor-pointer">
          ← Назад
        </button>
      </div>

      <div class="flex gap-3 mb-6 flex-wrap">
        <button id="btn-new-pack"
          class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl border-0 text-white
                 font-bold text-sm cursor-pointer transition-colors">
          + Новый набор
        </button>
        <button id="btn-import-list"
          class="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl border-0 text-white
                 text-sm cursor-pointer transition-colors">
          Импорт JSON
        </button>
        <input type="file" id="file-input-list" accept=".json" class="hidden" />
      </div>

      <div id="pack-list" class="space-y-2">
        ${stored.length === 0
          ? `<p class="text-gray-500 text-center py-8">
               Нет сохранённых наборов. Создайте новый или импортируйте JSON.
             </p>`
          : stored.map((p, i) => `
              <div class="bg-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
                <div class="min-w-0">
                  <div class="font-bold text-base truncate">${escHtml(p.title || 'Без названия')}</div>
                  <div class="text-gray-400 text-sm">
                    ${p.categories.length} кат. /
                    ${p.categories.reduce((s, c) => s + c.questions.length, 0)} вопр.
                  </div>
                </div>
                <div class="flex gap-2 shrink-0">
                  <button data-edit="${i}"
                    class="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-sm
                           border-0 cursor-pointer text-white transition-colors">Ред.</button>
                  <button data-export="${i}"
                    class="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg text-sm
                           border-0 cursor-pointer text-white transition-colors">JSON</button>
                  <button data-del="${i}"
                    class="bg-red-700/80 hover:bg-red-600 px-3 py-2 rounded-lg text-sm
                           border-0 cursor-pointer text-white transition-colors">Уд.</button>
                </div>
              </div>
            `).join('')
        }
      </div>
    </div>
  `;

  container.querySelector('#btn-back')!.addEventListener('click', () => navigate('home'));

  container.querySelector('#btn-new-pack')!.addEventListener('click', () => {
    editPack = emptyPack();
    editIdx  = -1;
    renderPackEditor(container);
  });

  container.querySelector('#btn-import-list')!.addEventListener('click', () => {
    container.querySelector<HTMLInputElement>('#file-input-list')!.click();
  });

  container.querySelector<HTMLInputElement>('#file-input-list')!.addEventListener('change', e => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const pack = JSON.parse(reader.result as string) as Pack;
        if (!pack.title || !Array.isArray(pack.categories))
          throw new Error('Нет полей title/categories');
        editPack = pack;
        editIdx  = -1;
        renderPackEditor(container);
      } catch (err) {
        showAlert(`Ошибка JSON: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
    (e.target as HTMLInputElement).value = '';
  });

  container.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = +btn.dataset.edit!;
      editPack = JSON.parse(JSON.stringify(loadStoredPacks()[i]));
      editIdx  = i;
      renderPackEditor(container);
    });
  });

  container.querySelectorAll<HTMLButtonElement>('[data-export]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pack = loadStoredPacks()[+btn.dataset.export!];
      downloadJson(pack);
    });
  });

  container.querySelectorAll<HTMLButtonElement>('[data-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      showConfirm('Удалить набор?', () => {
        deleteStoredPack(+btn.dataset.del!);
        renderPackList(container);
      }, { confirmLabel: 'Удалить' });
    });
  });
}

// ══════════════════════════════════════════════════════════════
//  VIEW 2: Pack editor
// ══════════════════════════════════════════════════════════════
function renderPackEditor(container: HTMLElement): void {
  container.innerHTML = `
    <div class="min-h-screen p-6" style="max-width:820px;margin:0 auto">

      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">
          ${editIdx >= 0 ? 'Редактирование набора' : 'Новый набор'}
        </h2>
        <button id="btn-to-list"
          class="text-blue-400 hover:text-blue-300 bg-transparent border-0 cursor-pointer">
          ← К списку
        </button>
      </div>

      <!-- Pack title -->
      <div class="mb-4">
        <label class="block text-sm text-gray-400 mb-1">Название набора</label>
        <input id="pack-title" type="text" value="${escHtml(editPack.title)}"
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white
                 focus:border-blue-500 focus:outline-none"
          placeholder="Например: Шахматные задачи" />
      </div>

      <!-- Categories -->
      <div id="categories-container" class="space-y-4 mb-4"></div>

      <!-- Add category -->
      <button id="btn-add-cat"
        class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg border-0 text-white
               text-sm cursor-pointer mb-6 transition-colors">
        + Категория
      </button>

      <!-- Bottom actions -->
      <div class="flex gap-3 pt-4 border-t border-gray-800 flex-wrap">
        <button id="btn-save"
          class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl border-0 text-white
                 font-bold cursor-pointer transition-colors">
          Сохранить
        </button>
        <button id="btn-play"
          class="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl border-0 text-white
                 font-bold cursor-pointer transition-colors">
          ▶ Играть
        </button>
        <button id="btn-export-pack"
          class="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl border-0 text-white
                 font-bold cursor-pointer transition-colors">
          Скачать JSON
        </button>
        <button id="btn-cancel"
          class="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl border-0 text-white
                 cursor-pointer transition-colors">
          Отмена
        </button>
      </div>

      <div id="status" class="mt-3 text-sm"></div>
    </div>
  `;

  renderCategories(container);

  container.querySelector<HTMLInputElement>('#pack-title')!.addEventListener('input', e => {
    editPack.title = (e.target as HTMLInputElement).value;
  });

  container.querySelector('#btn-to-list')!.addEventListener('click', () =>
    renderPackList(container));

  container.querySelector('#btn-add-cat')!.addEventListener('click', () => {
    editPack.categories.push({ name: '', questions: [{ value: 100, question: '', answer: '' }] });
    renderCategories(container);
  });

  container.querySelector('#btn-save')!.addEventListener('click', () => {
    const err = validatePack(editPack);
    if (err) { showStatus(container, `✗ ${err}`, false); return; }
    upsertStoredPack(editPack, editIdx >= 0 ? editIdx : undefined);
    if (editIdx < 0) {
      editIdx = loadStoredPacks().length - 1;
    }
    showStatus(container, '✓ Сохранено', true);
  });

  container.querySelector('#btn-play')!.addEventListener('click', () => {
    const err = validatePack(editPack);
    if (err) { showStatus(container, `✗ ${err}`, false); return; }
    // Save first, then navigate — setup will call refreshPacks() on render
    upsertStoredPack(editPack, editIdx >= 0 ? editIdx : undefined);
    const stored = loadStoredPacks();
    const storedIdx = editIdx >= 0 ? editIdx : stored.length - 1;
    setSelectedPackIdx(BUILTIN_PACK_COUNT + storedIdx);
    navigate('setup');
  });

  container.querySelector('#btn-export-pack')!.addEventListener('click', () => {
    const err = validatePack(editPack);
    if (err) { showStatus(container, `✗ ${err}`, false); return; }
    downloadJson(editPack);
  });

  container.querySelector('#btn-cancel')!.addEventListener('click', () =>
    renderPackList(container));
}

// ── Categories render ─────────────────────────────────────────
function renderCategories(container: HTMLElement): void {
  const cont = container.querySelector<HTMLElement>('#categories-container')!;
  cont.innerHTML = editPack.categories.map((cat, ci) => buildCategoryHtml(cat, ci)).join('');
  attachCategoryEvents(container);
}

function buildCategoryHtml(cat: Category, ci: number): string {
  return `
    <div class="rounded-xl p-4 space-y-3"
         style="background:rgba(31,41,55,0.5);border:1px solid rgba(55,65,81,0.5)">

      <div class="flex items-center gap-3">
        <input data-cat-name="${ci}" type="text" value="${escHtml(cat.name)}"
          class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-bold
                 focus:border-blue-500 focus:outline-none"
          placeholder="Название категории" />
        <button data-remove-cat="${ci}"
          class="text-red-400 hover:text-red-300 bg-transparent border-0 cursor-pointer
                 text-sm transition-colors whitespace-nowrap">Удалить</button>
      </div>

      <div data-questions="${ci}" class="space-y-2">
        ${cat.questions.map((q, qi) => buildQuestionHtml(cat, q, ci, qi)).join('')}
      </div>

      <button data-add-q="${ci}"
        class="text-sm text-blue-400 hover:text-blue-300 bg-transparent border-0
               cursor-pointer transition-colors">+ Вопрос</button>
    </div>
  `;
}

function buildQuestionHtml(cat: Category, q: Question, ci: number, qi: number): string {
  return `
    <div class="rounded-lg p-3 space-y-2" style="background:rgba(17,24,39,0.6)">
      <div class="flex gap-2 items-center">
        <div class="flex flex-col gap-0.5 shrink-0">
          <button data-move-up="${ci}-${qi}" ${qi === 0 ? 'disabled' : ''}
            class="text-gray-400 hover:text-white text-xs leading-none px-1
                   disabled:opacity-20 cursor-pointer bg-transparent border-0 transition-colors">▲</button>
          <button data-move-down="${ci}-${qi}" ${qi === cat.questions.length - 1 ? 'disabled' : ''}
            class="text-gray-400 hover:text-white text-xs leading-none px-1
                   disabled:opacity-20 cursor-pointer bg-transparent border-0 transition-colors">▼</button>
        </div>
        <input data-q-value="${ci}-${qi}" type="number" value="${q.value}" step="100" min="0"
          class="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-yellow-400
                 text-center font-bold focus:border-blue-500 focus:outline-none" />
        <input data-q-question="${ci}-${qi}" type="text" value="${escHtml(q.question)}"
          class="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white
                 focus:border-blue-500 focus:outline-none"
          placeholder="Вопрос" />
        <button data-duplicate-q="${ci}-${qi}"
          class="text-blue-400 hover:text-blue-300 bg-transparent border-0 cursor-pointer
                 text-xs shrink-0 transition-colors" title="Дублировать">⧉</button>
        <button data-remove-q="${ci}-${qi}"
          class="text-red-400 hover:text-red-300 bg-transparent border-0 cursor-pointer
                 text-xs shrink-0 transition-colors">✕</button>
      </div>
      <input data-q-answer="${ci}-${qi}" type="text" value="${escHtml(q.answer)}"
        class="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-emerald-400
               focus:border-blue-500 focus:outline-none"
        placeholder="Ответ" />
      <input data-q-image="${ci}-${qi}" type="text" value="${escHtml(q.image ?? '')}"
        class="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-blue-400 text-sm
               focus:border-blue-500 focus:outline-none"
        placeholder="URL картинки (https://...)" />
      <input data-q-fen="${ci}-${qi}" type="text" value="${escHtml(q.fen ?? '')}"
        class="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-purple-400
               text-sm font-mono focus:border-blue-500 focus:outline-none"
        placeholder="FEN позиции (необязательно)" />
    </div>
  `;
}

// ── Event binding ─────────────────────────────────────────────
function attachCategoryEvents(container: HTMLElement): void {
  const cont = container.querySelector<HTMLElement>('#categories-container')!;

  cont.querySelectorAll<HTMLInputElement>('[data-cat-name]').forEach(inp => {
    inp.addEventListener('input', () => {
      editPack.categories[+inp.dataset.catName!].name = inp.value;
    });
  });

  cont.querySelectorAll<HTMLButtonElement>('[data-remove-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      showConfirm('Удалить категорию?', () => {
        editPack.categories.splice(+btn.dataset.removeCat!, 1);
        renderCategories(container);
      }, { confirmLabel: 'Удалить' });
    });
  });

  cont.querySelectorAll<HTMLInputElement>('[data-q-value]').forEach(inp => {
    inp.addEventListener('input', () => {
      const [ci, qi] = inp.dataset.qValue!.split('-').map(Number);
      editPack.categories[ci].questions[qi].value = Number(inp.value) || 0;
    });
  });

  cont.querySelectorAll<HTMLInputElement>('[data-q-question]').forEach(inp => {
    inp.addEventListener('input', () => {
      const [ci, qi] = inp.dataset.qQuestion!.split('-').map(Number);
      editPack.categories[ci].questions[qi].question = inp.value;
    });
  });

  cont.querySelectorAll<HTMLInputElement>('[data-q-answer]').forEach(inp => {
    inp.addEventListener('input', () => {
      const [ci, qi] = inp.dataset.qAnswer!.split('-').map(Number);
      editPack.categories[ci].questions[qi].answer = inp.value;
    });
  });

  cont.querySelectorAll<HTMLInputElement>('[data-q-image]').forEach(inp => {
    inp.addEventListener('input', () => {
      const [ci, qi] = inp.dataset.qImage!.split('-').map(Number);
      editPack.categories[ci].questions[qi].image = inp.value.trim() || undefined;
    });
  });

  cont.querySelectorAll<HTMLInputElement>('[data-q-fen]').forEach(inp => {
    inp.addEventListener('input', () => {
      const [ci, qi] = inp.dataset.qFen!.split('-').map(Number);
      editPack.categories[ci].questions[qi].fen = inp.value.trim() || undefined;
    });
  });

  cont.querySelectorAll<HTMLButtonElement>('[data-move-up]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [ci, qi] = btn.dataset.moveUp!.split('-').map(Number);
      if (qi === 0) return;
      const qs = editPack.categories[ci].questions;
      [qs[qi - 1], qs[qi]] = [qs[qi], qs[qi - 1]];
      renderCategories(container);
    });
  });

  cont.querySelectorAll<HTMLButtonElement>('[data-move-down]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [ci, qi] = btn.dataset.moveDown!.split('-').map(Number);
      const qs = editPack.categories[ci].questions;
      if (qi >= qs.length - 1) return;
      [qs[qi], qs[qi + 1]] = [qs[qi + 1], qs[qi]];
      renderCategories(container);
    });
  });

  cont.querySelectorAll<HTMLButtonElement>('[data-duplicate-q]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [ci, qi] = btn.dataset.duplicateQ!.split('-').map(Number);
      const qs = editPack.categories[ci].questions;
      qs.splice(qi + 1, 0, JSON.parse(JSON.stringify(qs[qi])));
      renderCategories(container);
    });
  });

  cont.querySelectorAll<HTMLButtonElement>('[data-remove-q]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [ci, qi] = btn.dataset.removeQ!.split('-').map(Number);
      const qs = editPack.categories[ci].questions;
      const doDelete = () => { qs.splice(qi, 1); renderCategories(container); };
      if (qs.length <= 1) {
        showConfirm('Последний вопрос. Удалить?', doDelete, { confirmLabel: 'Удалить' });
      } else {
        doDelete();
      }
    });
  });

  cont.querySelectorAll<HTMLButtonElement>('[data-add-q]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ci = +btn.dataset.addQ!;
      const qs = editPack.categories[ci].questions;
      const lastVal = qs.at(-1)?.value ?? 0;
      qs.push({ value: lastVal + 100, question: '', answer: '' });
      renderCategories(container);
    });
  });
}

// ── Validation ────────────────────────────────────────────────
function validatePack(pack: Pack): string | null {
  if (!pack.title.trim())      return 'Введите название набора';
  if (!pack.categories.length) return 'Добавьте хотя бы одну категорию';
  for (const [ci, cat] of pack.categories.entries()) {
    if (!cat.name.trim())      return `Категория ${ci + 1}: введите название`;
    if (!cat.questions.length) return `"${cat.name}": добавьте хотя бы один вопрос`;
    for (const [qi, q] of cat.questions.entries()) {
      if (!q.question.trim())  return `"${cat.name}"[${qi + 1}]: нет текста вопроса`;
      if (!q.answer.trim())    return `"${cat.name}"[${qi + 1}]: нет ответа`;
      if (q.fen && !isValidFen(q.fen))
                               return `"${cat.name}"[${qi + 1}]: невалидный FEN`;
    }
  }
  return null;
}

function showStatus(container: HTMLElement, msg: string, ok: boolean): void {
  const el = container.querySelector<HTMLElement>('#status')!;
  el.textContent = msg;
  el.style.color = ok ? '#4ade80' : '#f87171';
}

function downloadJson(pack: Pack): void {
  const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${pack.title || 'pack'}.json`;
  a.click();
}
