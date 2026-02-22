// CSS imports — esbuild will bundle these into dist/bundle.css
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import './pieces.css';
import './styles.css';

import { initRouter, navigate } from './router';
import { ScreenName } from './types';

import { render as renderHome }      from './screens/home';
import { render as renderSetup }     from './screens/setup';
import { render as renderGameBoard } from './screens/game-board';
import { render as renderQuestion }  from './screens/question';
import { render as renderResults }   from './screens/results';
import { render as renderEditor }    from './screens/editor';

const app = document.getElementById('app');
if (!app) throw new Error('#app element not found');

const renderers: Record<ScreenName, (el: HTMLElement) => void> = {
  'home':       renderHome,
  'setup':      renderSetup,
  'game-board': renderGameBoard,
  'question':   renderQuestion,
  'results':    renderResults,
  'editor':     renderEditor,
};

initRouter(app, renderers);
navigate('home');
