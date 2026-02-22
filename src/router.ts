import { ScreenName } from './types';

type Renderer = (el: HTMLElement) => void;

let _root: HTMLElement;
const _renderers: Partial<Record<ScreenName, Renderer>> = {};

export function initRouter(root: HTMLElement, renderers: Record<ScreenName, Renderer>): void {
  _root = root;
  Object.assign(_renderers, renderers);
}

export function navigate(screen: ScreenName): void {
  _root.innerHTML = '';
  const render = _renderers[screen];
  if (render) render(_root);
}
