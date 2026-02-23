/**
 * Beautiful custom modals — replaces system alert() / confirm()
 */

import { escHtml } from './utils';

const BASE_OVERLAY =
  'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4';
const BASE_PANEL =
  'bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full shadow-2xl space-y-5';

function createOverlay(): HTMLDivElement {
  const el = document.createElement('div');
  el.className = BASE_OVERLAY;
  return el;
}

// ── Alert ─────────────────────────────────────────────────────
export function showAlert(msg: string, onClose?: () => void): void {
  const overlay = createOverlay();
  overlay.innerHTML = `
    <div class="${BASE_PANEL}" style="max-width:380px">
      <p class="text-center text-white text-base leading-relaxed">${escHtml(msg)}</p>
      <button id="modal-ok"
        class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl border-0 text-white
               font-bold cursor-pointer transition-colors">
        ОК
      </button>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => { overlay.remove(); onClose?.(); };
  overlay.querySelector('#modal-ok')!.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

// ── Confirm ───────────────────────────────────────────────────
export function showConfirm(
  msg: string,
  onConfirm: () => void,
  options?: { confirmLabel?: string; confirmClass?: string },
): void {
  const overlay = createOverlay();
  const confirmLabel = options?.confirmLabel ?? 'Подтвердить';
  const confirmCls   = options?.confirmClass
    ?? 'bg-red-600 hover:bg-red-500';

  overlay.innerHTML = `
    <div class="${BASE_PANEL}" style="max-width:380px">
      <p class="text-center text-white text-base leading-relaxed">${msg}</p>
      <div class="flex gap-3">
        <button id="modal-cancel"
          class="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl border-0 text-white
                 cursor-pointer transition-colors">
          Отмена
        </button>
        <button id="modal-confirm"
          class="flex-1 py-2.5 ${confirmCls} rounded-xl border-0 text-white font-bold
                 cursor-pointer transition-colors">
          ${escHtml(confirmLabel)}
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('#modal-cancel')!.addEventListener('click', close);
  overlay.querySelector('#modal-confirm')!.addEventListener('click', () => {
    close();
    onConfirm();
  });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}
