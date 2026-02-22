import { navigate } from '../router';
import { game } from '../state';
import { deleteSave } from '../storage';
import { escHtml } from '../utils';

export function render(container: HTMLElement): void {
  // Delete the completed game save
  if (game?.id) deleteSave(game.id);

  const players = (game?.players ?? []).slice().sort((a, b) => b.score - a.score);
  const maxScore = players[0]?.score ?? 0;

  container.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-screen p-8">
      <h2 class="font-black text-yellow-400 mb-8" style="font-size:2.5rem">Итоги игры</h2>

      <div class="flex flex-col gap-3 mb-8 w-full" style="max-width:420px">
        ${players.map((p, i) => {
          const isWinner = p.score === maxScore && p.score > 0;
          const medal = isWinner ? '👑' : (i === 0 ? '' : i === 1 ? '🥈' : i === 2 ? '🥉' : '');
          return `
            <div class="flex items-center gap-4 rounded-xl px-5 py-4"
                 style="background:${isWinner ? '#1e3a22' : '#1f2937'};
                        ${isWinner ? 'border:1px solid #16a34a' : ''}">
              <span style="font-size:1.8rem;min-width:2rem">${medal}</span>
              <span class="flex-1 font-semibold" style="font-size:1.1rem">${escHtml(p.name)}</span>
              <span class="font-black" style="font-size:1.4rem;color:${p.score >= 0 ? '#ffd600' : '#f87171'}">
                ${p.score}
              </span>
            </div>
          `;
        }).join('')}
      </div>

      <div class="flex gap-3 flex-wrap justify-center">
        <button id="btn-restart"
          class="px-7 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl border-0
                 text-white font-bold text-base cursor-pointer transition-colors">
          Сыграть снова
        </button>
        <button id="btn-home"
          class="px-7 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl border-0
                 text-white font-bold text-base cursor-pointer transition-colors">
          На главную
        </button>
      </div>
    </div>
  `;

  container.querySelector('#btn-restart')!.addEventListener('click', () => navigate('setup'));
  container.querySelector('#btn-home')!.addEventListener('click', () => navigate('home'));
}
