/**
 * RD COURS COMPTA — Theme Manager
 */
const THEME_KEY = 'rd-theme';
class ThemeManager {
  constructor() {
    this.html = document.documentElement;
    this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
    this.init();
  }
  init() {
    this.applyTheme(this.currentTheme, false);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => this.attachEvents());
    else this.attachEvents();
    this.watchSystem();
  }
  getStoredTheme() { return localStorage.getItem(THEME_KEY); }
  getSystemTheme() { return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  applyTheme(theme, save = true) {
    this.html.classList.toggle('dark', theme === 'dark');
    this.currentTheme = theme;
    if (save) localStorage.setItem(THEME_KEY, theme);
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    this.updateToggleButton();
  }
  toggleTheme() { this.applyTheme(this.currentTheme === 'light' ? 'dark' : 'light'); }
  attachEvents() {
    const btn = document.getElementById('themeToggle');
    if (btn) { btn.addEventListener('click', () => this.toggleTheme()); this.updateToggleButton(); }
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') { e.preventDefault(); this.toggleTheme(); }
    });
  }
  updateToggleButton() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const isDark = this.currentTheme === 'dark';
    btn.setAttribute('aria-pressed', isDark);
    btn.setAttribute('aria-label', isDark ? 'Passer au thème clair' : 'Passer au thème sombre');
    btn.innerHTML = '';
    const i = document.createElement('i');
    i.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    btn.appendChild(i);
    if (typeof lucide !== 'undefined') lucide.createIcons({ root: btn });
  }
  watchSystem() {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const h = (e) => { if (!this.getStoredTheme()) this.applyTheme(e.matches ? 'dark' : 'light', false); };
    mq.addEventListener ? mq.addEventListener('change', h) : mq.addListener(h);
  }
  setTheme(t) { if (t === 'light' || t === 'dark') this.applyTheme(t); }
  getTheme() { return this.currentTheme; }
}
const themeManager = new ThemeManager();
window.themeManager = themeManager;
