/**
 * RD WORKFLOW — Theme Manager
 * Gestion du basculement thème Clair/Sombre avec persistance
 */

const THEME_KEY = 'rd-theme';

class ThemeManager {
  constructor() {
    this.html = document.documentElement;
    this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
    this.init();
  }

  init() {
    // Applique le thème immédiatement (évite flash)
    this.applyTheme(this.currentTheme, false);
    
    // Attache les événements après DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.attachEvents());
    } else {
      this.attachEvents();
    }

    // Écoute les changements système
    this.watchSystem();
  }

  getStoredTheme() {
    return localStorage.getItem(THEME_KEY);
  }

  getSystemTheme() {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  applyTheme(theme, save = true) {
    this.html.classList.toggle('dark', theme === 'dark');
    this.currentTheme = theme;
    
    if (save) localStorage.setItem(THEME_KEY, theme);
    
    // Dispatch event pour hooks externes
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    
    // Met à jour le bouton toggle
    this.updateToggleButton();
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  attachEvents() {
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleTheme());
      this.updateToggleButton();
    }

    // Raccourci clavier : Ctrl/Cmd + Shift + D
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

    updateToggleButton() {
        const toggleBtn = document.getElementById('themeToggle');
        if (!toggleBtn) return;

        const isDark = this.currentTheme === 'dark';
        
        // Mise à jour de l'accessibilité
        toggleBtn.setAttribute('aria-pressed', isDark);
        toggleBtn.setAttribute('aria-label', isDark ? 'Passer au thème clair' : 'Passer au thème sombre');

        // --- NOUVEAUTÉ : Mise à jour de l'icône Lucide ---
        
        // 1. On vide le bouton pour retirer le <svg> généré précédemment
        toggleBtn.innerHTML = ''; 

        // 2. On recrée l'élément <i> de base avec le bon attribut
        // Si on est en dark, on affiche un soleil (pour passer au clair), sinon une lune.
        const newIcon = document.createElement('i');
        newIcon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        toggleBtn.appendChild(newIcon);

        // 3. On demande à Lucide de régénérer l'icône spécifiquement dans ce bouton
        // On vérifie que 'lucide' est bien chargé pour éviter une erreur JS
        if (typeof lucide !== 'undefined') {
          lucide.createIcons({
            root: toggleBtn
          });
        }
      }

  watchSystem() {
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mediaQuery) return;

    const handler = (e) => {
      if (!this.getStoredTheme()) {
        this.applyTheme(e.matches ? 'dark' : 'light', false);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }
  }

  // API publique
  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    this.applyTheme(theme);
  }

  getTheme() {
    return this.currentTheme;
  }

  reset() {
    localStorage.removeItem(THEME_KEY);
    this.applyTheme(this.getSystemTheme(), false);
  }
}

// Initialisation automatique
const themeManager = new ThemeManager();
window.themeManager = themeManager;
