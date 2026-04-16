/**
 * DASHBOA_RD — Utilitaires globaux
 */

// ── Sélecteurs ──
export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── Redirection ──
export function redirectTo(page) {
  window.location.href = page;
}

// ── Toast notifications ──
export const toast = {
  _container: null,

  _getContainer() {
    if (!this._container) {
      this._container = document.createElement('div');
      this._container.className = 'toast-container';
      document.body.appendChild(this._container);
    }
    return this._container;
  },

  show(message, type = 'info', duration = 3500) {
    const container = this._getContainer();
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;

    const icons = {
      success: 'check-circle',
      error:   'x-circle',
      warning: 'alert-triangle',
      info:    'info',
    };

    el.innerHTML = `<i data-lucide="${icons[type] || 'info'}"></i><span>${message}</span>`;
    container.appendChild(el);

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: el });

    requestAnimationFrame(() => el.classList.add('toast--visible'));

    setTimeout(() => {
      el.classList.remove('toast--visible');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
    }, duration);
  },

  success(m, d) { this.show(m, 'success', d); },
  error(m, d)   { this.show(m, 'error',   d || 5000); },
  warning(m, d) { this.show(m, 'warning', d); },
  info(m, d)    { this.show(m, 'info',    d); },
};

// ── Gestion d'erreurs ──
export function handleError(error, context = '') {
  console.error(`[${context}]`, error);
  toast.error(error?.message || 'Une erreur est survenue');
}

// ── Formatters ──
export function formatPercent(value, decimals = 1) {
  if (value == null || isNaN(value)) return '—';
  return `${Number(value).toFixed(decimals)}%`;
}

export function formatNumber(value, decimals = 0) {
  if (value == null || isNaN(value)) return '—';
  return Number(value).toFixed(decimals).replace('.', ',');
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

// ── RAG helper ──
export function getRag(value, cibleMin, cibleMax) {
  if (value == null) return 'neutral';
  if (cibleMax !== undefined) {
    if (value >= cibleMin && value <= cibleMax) return 'green';
    if (value >= cibleMin * 0.9 && value <= cibleMax * 1.1) return 'orange';
    return 'red';
  }
  // Cas "inférieur à cible = bon" (absentéisme, turnover)
  if (value <= cibleMin) return 'green';
  if (value <= cibleMin * 1.1) return 'orange';
  return 'red';
}

// ── DOM helpers ──
export function show(el) { if (el) el.style.display = ''; }
export function hide(el) { if (el) el.style.display = 'none'; }
export function setHTML(selector, html) { const el = $(selector); if (el) el.innerHTML = html; }
export function setText(selector, text) { const el = $(selector); if (el) el.textContent = text; }

// ── Debounce ──
export function debounce(fn, delay = 250) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
