import { navigate } from '../router';
import { game } from '../state';
import { escHtml } from '../utils';
import { showConfirm } from '../modal';

export function render(container: HTMLElement): void {
  if (!game) { navigate('home'); return; }

  container.innerHTML = `
    <div class="min-h-screen flex flex-col justify-center py-4 px-4 w-full"
         style="max-width:1280px;margin:0 auto">

      <div class="flex items-center justify-between mb-3">
        <h1 class="text-xl font-bold">Своя Игра</h1>
        <div class="flex gap-2 items-center">
          <button id="btn-finish"
            class="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 rounded-lg border-0
                   text-white text-xs cursor-pointer transition-colors">
            Завершить
          </button>
          <button id="btn-home"
            class="text-gray-400 hover:text-white bg-transparent border-0 cursor-pointer text-xs">
            ← Главная
          </button>
        </div>
      </div>

      <div id="board-grid" class="gboard w-full"></div>

      <div id="scores-bar" class="mt-3 flex justify-center flex-wrap gap-3"></div>
    </div>
  `;

  buildGrid(container);
  renderScores(container);

  container.querySelector('#btn-finish')!.addEventListener('click', () => navigate('results'));
  container.querySelector('#btn-home')!.addEventListener('click', () => {
    showConfirm('Вернуться на главную?<br><span class="text-gray-400 text-sm">Прогресс сохранён.</span>', () => navigate('home'), {
      confirmLabel: 'На главную',
      confirmClass: 'bg-blue-600 hover:bg-blue-500',
    });
  });
}

function buildGrid(container: HTMLElement): void {
  const g = game!;
  const cats = g.pack.categories;

  const allVals = [...new Set(cats.flatMap(c => c.questions.map(q => q.value)))].sort((a, b) => a - b);

  const grid = container.querySelector<HTMLElement>('#board-grid')!;
  grid.style.gridTemplateColumns = `minmax(160px,260px) ${allVals.map(() => 'minmax(0,1fr)').join(' ')}`;

  cats.forEach((cat, catIdx) => {
    const catCell = document.createElement('div');
    catCell.className = 'cat-cell';
    catCell.textContent = cat.name;
    grid.appendChild(catCell);

    allVals.forEach(val => {
      const qIdx = cat.questions.findIndex(q => q.value === val);
      const cell = document.createElement('div');

      if (qIdx === -1) {
        cell.className = 'val-cell done';
      } else {
        const key = `${catIdx}-${qIdx}`;
        const done = g.answered.has(key);
        cell.className = 'val-cell' + (done ? ' done' : '');
        if (!done) {
          cell.textContent = String(val);
          cell.addEventListener('click', () => {
            g.cur = { catIdx, qIdx };
            navigate('question');
          });
        }
      }
      grid.appendChild(cell);
    });
  });
}

export function renderScores(container: HTMLElement): void {
  const bar = container.querySelector<HTMLElement>('#scores-bar')!;
  bar.innerHTML = game!.players.map(p => `
    <div class="score-card">
      <div class="sc-name">${escHtml(p.name)}</div>
      <div class="sc-val">${p.score}</div>
    </div>
  `).join('');
}
