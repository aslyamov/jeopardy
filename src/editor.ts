import { QuestionPack, Category, Question } from './types';
import { loadPacks, savePacks } from './storage';
import { navigateTo } from './app';

let currentPack: QuestionPack | null = null;
let currentPackIndex: number = -1; // -1 = новый набор

// --- Список наборов ---

export function initEditor(): void {
  renderPackList();

  document.getElementById('btn-create-pack')?.addEventListener('click', () => {
    currentPack = { title: '', categories: [] };
    currentPackIndex = -1;
    renderPackEditor();
  });

  document.getElementById('btn-import-pack')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const pack = JSON.parse(reader.result as string) as QuestionPack;
          if (!pack.title || !pack.categories) throw new Error();
          const packs = loadPacks();
          packs.push(pack);
          savePacks(packs);
          renderPackList();
        } catch {
          alert('Некорректный JSON файл');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}

function renderPackList(): void {
  const container = document.getElementById('pack-list')!;
  const packs = loadPacks();

  if (packs.length === 0) {
    container.innerHTML = `
      <p class="text-gray-500 text-center py-8">Нет сохранённых наборов. Создайте новый или импортируйте JSON.</p>
    `;
    return;
  }

  container.innerHTML = packs
    .map(
      (pack, i) => `
    <div class="bg-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
      <div class="min-w-0">
        <h3 class="font-bold text-lg truncate">${escapeHtml(pack.title || 'Без названия')}</h3>
        <p class="text-gray-400 text-sm">${pack.categories.length} кат. / ${pack.categories.reduce((s, c) => s + c.questions.length, 0)} вопр.</p>
      </div>
      <div class="flex gap-2 shrink-0">
        <button data-edit-pack="${i}" class="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-sm transition-colors">Ред.</button>
        <button data-export-pack="${i}" class="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg text-sm transition-colors">JSON</button>
        <button data-delete-pack="${i}" class="bg-red-600 hover:bg-red-500 px-3 py-2 rounded-lg text-sm transition-colors">Уд.</button>
      </div>
    </div>
  `
    )
    .join('');

  // Обработчики кнопок
  container.querySelectorAll<HTMLButtonElement>('[data-edit-pack]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.editPack!);
      currentPackIndex = idx;
      currentPack = JSON.parse(JSON.stringify(packs[idx])); // deep copy
      renderPackEditor();
    });
  });

  container.querySelectorAll<HTMLButtonElement>('[data-export-pack]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.exportPack!);
      exportPack(packs[idx]);
    });
  });

  container.querySelectorAll<HTMLButtonElement>('[data-delete-pack]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.deletePack!);
      if (confirm(`Удалить набор "${packs[idx].title}"?`)) {
        packs.splice(idx, 1);
        savePacks(packs);
        renderPackList();
      }
    });
  });
}

// --- Редактор набора ---

function renderPackEditor(): void {
  if (!currentPack) return;

  const editorArea = document.getElementById('editor-area')!;
  const packListArea = document.getElementById('editor-list-area')!;

  packListArea.classList.add('hidden');
  editorArea.classList.remove('hidden');

  editorArea.innerHTML = `
    <div class="space-y-6">
      <!-- Название набора -->
      <div>
        <label class="block text-sm text-gray-400 mb-1">Название набора</label>
        <input id="pack-title" type="text" value="${escapeHtml(currentPack.title)}"
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
          placeholder="Например: Общие знания" />
      </div>

      <!-- Категории -->
      <div id="categories-container" class="space-y-4"></div>

      <!-- Кнопки -->
      <div class="flex gap-3">
        <button id="btn-add-category" class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors">
          + Категория
        </button>
      </div>

      <div class="flex gap-3 pt-4 border-t border-gray-800">
        <button id="btn-save-pack" class="bg-emerald-600 hover:bg-emerald-500 font-bold px-6 py-3 rounded-xl transition-colors">
          Сохранить
        </button>
        <button id="btn-cancel-edit" class="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl transition-colors">
          Отмена
        </button>
      </div>
    </div>
  `;

  renderCategories();

  document.getElementById('pack-title')!.addEventListener('input', (e) => {
    currentPack!.title = (e.target as HTMLInputElement).value;
  });

  document.getElementById('btn-add-category')!.addEventListener('click', () => {
    currentPack!.categories.push({ name: '', questions: [] });
    renderCategories();
  });

  document.getElementById('btn-save-pack')!.addEventListener('click', savePack);
  document.getElementById('btn-cancel-edit')!.addEventListener('click', closeEditor);
}

function renderCategories(): void {
  if (!currentPack) return;
  const container = document.getElementById('categories-container')!;

  container.innerHTML = currentPack.categories
    .map(
      (cat, ci) => `
    <div class="bg-gray-800/50 rounded-xl p-4 space-y-3 border border-gray-700/50">
      <div class="flex items-center gap-3">
        <input data-cat-name="${ci}" type="text" value="${escapeHtml(cat.name)}"
          class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none font-bold"
          placeholder="Название категории" />
        <button data-remove-cat="${ci}" class="text-red-400 hover:text-red-300 text-sm transition-colors">Удалить</button>
      </div>

      <div data-questions="${ci}" class="space-y-2">
        ${cat.questions
          .map(
            (q, qi) => `
          <div class="bg-gray-900/50 rounded-lg p-3 space-y-2">
            <div class="flex gap-2">
              <input data-q-value="${ci}-${qi}" type="number" value="${q.value}" step="100" min="0"
                class="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-gold text-center font-bold focus:border-blue-500 focus:outline-none"
                placeholder="Сумма" />
              <input data-q-question="${ci}-${qi}" type="text" value="${escapeHtml(q.question)}"
                class="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white focus:border-blue-500 focus:outline-none"
                placeholder="Вопрос" />
              <button data-remove-q="${ci}-${qi}" class="text-red-400 hover:text-red-300 text-xs transition-colors">✕</button>
            </div>
            <div class="flex gap-2">
              <input data-q-answer="${ci}-${qi}" type="text" value="${escapeHtml(q.answer)}"
                class="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-emerald-400 focus:border-blue-500 focus:outline-none"
                placeholder="Ответ" />
            </div>
            <div class="flex gap-2 items-center">
              <input data-q-image-url="${ci}-${qi}" type="text" value="${escapeHtml(q.image || '')}"
                class="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-blue-400 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="URL картинки (https://...)" />
              ${q.image ? `<button data-clear-image="${ci}-${qi}" class="text-red-400 hover:text-red-300 text-xs transition-colors shrink-0">✕</button>` : ''}
            </div>
          </div>
        `
          )
          .join('')}
      </div>

      <button data-add-q="${ci}" class="text-sm text-blue-400 hover:text-blue-300 transition-colors">
        + Вопрос
      </button>
    </div>
  `
    )
    .join('');

  // --- Привязка событий ---

  // Название категории
  container.querySelectorAll<HTMLInputElement>('[data-cat-name]').forEach((input) => {
    input.addEventListener('input', () => {
      const ci = parseInt(input.dataset.catName!);
      currentPack!.categories[ci].name = input.value;
    });
  });

  // Удалить категорию
  container.querySelectorAll<HTMLButtonElement>('[data-remove-cat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ci = parseInt(btn.dataset.removeCat!);
      currentPack!.categories.splice(ci, 1);
      renderCategories();
    });
  });

  // Поля вопросов
  container.querySelectorAll<HTMLInputElement>('[data-q-value]').forEach((input) => {
    input.addEventListener('input', () => {
      const [ci, qi] = input.dataset.qValue!.split('-').map(Number);
      currentPack!.categories[ci].questions[qi].value = parseInt(input.value) || 0;
    });
  });

  container.querySelectorAll<HTMLInputElement>('[data-q-question]').forEach((input) => {
    input.addEventListener('input', () => {
      const [ci, qi] = input.dataset.qQuestion!.split('-').map(Number);
      currentPack!.categories[ci].questions[qi].question = input.value;
    });
  });

  container.querySelectorAll<HTMLInputElement>('[data-q-answer]').forEach((input) => {
    input.addEventListener('input', () => {
      const [ci, qi] = input.dataset.qAnswer!.split('-').map(Number);
      currentPack!.categories[ci].questions[qi].answer = input.value;
    });
  });

  // URL картинки
  container.querySelectorAll<HTMLInputElement>('[data-q-image-url]').forEach((input) => {
    input.addEventListener('input', () => {
      const [ci, qi] = input.dataset.qImageUrl!.split('-').map(Number);
      currentPack!.categories[ci].questions[qi].image = input.value.trim() || undefined;
    });
  });

  // Очистить картинку
  container.querySelectorAll<HTMLButtonElement>('[data-clear-image]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [ci, qi] = btn.dataset.clearImage!.split('-').map(Number);
      currentPack!.categories[ci].questions[qi].image = undefined;
      renderCategories();
    });
  });

  // Удалить вопрос
  container.querySelectorAll<HTMLButtonElement>('[data-remove-q]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [ci, qi] = btn.dataset.removeQ!.split('-').map(Number);
      currentPack!.categories[ci].questions.splice(qi, 1);
      renderCategories();
    });
  });

  // Добавить вопрос
  container.querySelectorAll<HTMLButtonElement>('[data-add-q]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ci = parseInt(btn.dataset.addQ!);
      const questions = currentPack!.categories[ci].questions;
      const lastValue = questions.length > 0 ? questions[questions.length - 1].value : 0;
      questions.push({ value: lastValue + 100, question: '', answer: '' });
      renderCategories();
    });
  });
}

function savePack(): void {
  if (!currentPack) return;

  if (!currentPack.title.trim()) {
    alert('Введите название набора');
    return;
  }

  const packs = loadPacks();
  if (currentPackIndex >= 0) {
    packs[currentPackIndex] = currentPack;
  } else {
    packs.push(currentPack);
  }
  savePacks(packs);
  closeEditor();
}

function closeEditor(): void {
  currentPack = null;
  currentPackIndex = -1;

  const editorArea = document.getElementById('editor-area')!;
  const packListArea = document.getElementById('editor-list-area')!;

  editorArea.classList.add('hidden');
  editorArea.innerHTML = '';
  packListArea.classList.remove('hidden');

  renderPackList();
}

function exportPack(pack: QuestionPack): void {
  const json = JSON.stringify(pack, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${pack.title || 'pack'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
