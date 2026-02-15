import { Screen } from './types';
import { loadGame, loadBuiltinPacks } from './storage';
import { initEditor } from './editor';
import { initSetup, resumeGame, initBoard } from './game';

// --- Роутинг ---

let currentScreen: Screen = 'home';

const screens: Screen[] = ['home', 'setup', 'board', 'question', 'results', 'editor'];

export function navigateTo(screen: Screen): void {
  currentScreen = screen;

  screens.forEach((id) => {
    const el = document.getElementById(`screen-${id}`);
    if (el) {
      el.classList.toggle('hidden', id !== screen);
    }
  });

  // Обновляем hash для возможности навигации назад
  window.location.hash = screen;
}

// --- Инициализация ---

async function init(): Promise<void> {
  // Загружаем встроенные наборы из packs/
  await loadBuiltinPacks();

  // Показать/скрыть кнопку "Продолжить" в зависимости от наличия сохранения
  const continueBtn = document.getElementById('btn-continue');
  if (continueBtn) {
    const savedGame = loadGame();
    continueBtn.classList.toggle('hidden', !savedGame);
  }

  // При загрузке — только безопасные экраны (home, setup, editor)
  // board/question/results без состояния будут пустыми
  const safeScreens: Screen[] = ['home', 'setup', 'editor'];
  const hash = window.location.hash.replace('#', '') as Screen;
  if (hash && safeScreens.includes(hash)) {
    navigateTo(hash);
  } else {
    navigateTo('home');
  }

  // Слушаем изменение hash (кнопка "назад" в браузере)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') as Screen;
    if (hash && screens.includes(hash)) {
      navigateTo(hash);
    }
  });

  // --- Кнопки главного экрана ---

  document.getElementById('btn-new-game')?.addEventListener('click', () => {
    initSetup();
    navigateTo('setup');
  });

  document.getElementById('btn-continue')?.addEventListener('click', () => {
    resumeGame();
  });

  document.getElementById('btn-editor')?.addEventListener('click', () => {
    navigateTo('editor');
  });

  // Инициализация модулей
  initEditor();
  initBoard();

  // Все кнопки "Назад на главную"
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = (btn as HTMLElement).dataset.nav as Screen;
      navigateTo(target);
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
