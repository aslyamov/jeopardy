// Разрешаем только http/https URL для картинок
export function sanitizeImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
  } catch {}
  return '';
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===================== КАСТОМНЫЙ МОДАЛ =====================

export function showModal(message: string, onConfirm?: () => void): void {
  document.getElementById('custom-modal')?.remove();

  const isConfirm = !!onConfirm;
  const modal = document.createElement('div');
  modal.id = 'custom-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl text-center space-y-4">
      <p class="text-lg">${escapeHtml(message)}</p>
      <div class="flex gap-3 justify-center">
        ${isConfirm ? `
          <button id="modal-cancel" class="bg-gray-700 hover:bg-gray-600 px-5 py-2.5 rounded-xl transition-colors">Отмена</button>
          <button id="modal-ok" class="bg-red-600 hover:bg-red-500 px-5 py-2.5 rounded-xl font-bold transition-colors">Подтвердить</button>
        ` : `
          <button id="modal-ok" class="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl font-bold transition-colors">Ок</button>
        `}
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.getElementById('modal-ok')!.addEventListener('click', () => {
    closeModal();
    if (onConfirm) onConfirm();
  });

  document.getElementById('modal-cancel')?.addEventListener('click', closeModal);
}

function closeModal(): void {
  document.getElementById('custom-modal')?.remove();
}
