/**
 * DASHBOA_RD — Shell commun
 * ─────────────────────────────────────────────────────────────────
 * À importer en premier dans chaque page protégée.
 * Gère : auth guard, sidebar, déconnexion, thème, profil DOM.
 *
 * Usage :
 *   import { initShell } from '../../js/shell.js';
 *   const profile = await initShell({ roles:['stagiaire'], cohortes:['ARH'] });
 *   if (!profile) return; // redirect géré par requireAuth
 * ─────────────────────────────────────────────────────────────────
 */

import { requireAuth, handleLogout } from './auth.js';
import { getSpecialisationLabel }    from './messages.js';
import { getInitials }               from './utils.js';

/** Couleurs ARH selon spécialisation */
const ARH_COLORS = {
  generaliste: '#059669',
  recrutement: '#1f4590',
  paie:        '#dc2626',
  formation:   '#7c3aed',
};

const ARH_COLOR_DEFAULT = '#059669';

/**
 * Initialise le shell de l'application
 * @param {Object} opts
 * @param {string[]} opts.roles     - Rôles autorisés
 * @param {string[]} opts.cohortes  - Cohortes autorisées ([] = toutes)
 * @param {Function} opts.onReady   - Callback(profile) une fois prêt
 * @returns {Object|null} profile
 */
export async function initShell({ roles = [], cohortes = [], onReady } = {}) {

  // 1. Guard auth
  const profile = await requireAuth({ roles, cohortes });
  if (!profile) return null;

  // 2. Couleur cohorte → variable CSS
  applyCohorteColor(profile);

  // 3. Thème (déjà géré par theme.js chargé en <head>, on réinit le bouton)
  initThemeButton();

  // 4. Lucide icons
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // 5. Injecter profil dans le DOM
  injectProfile(profile);

  // 6. Activer le lien sidebar courant
  highlightActiveLink();

  // 7. Déconnexion
  bindLogout();

  // 8. Sidebar mobile
  bindSidebarToggle();

  // 9. Callback page
  if (typeof onReady === 'function') await onReady(profile);

  return profile;
}

// ── Injection profil dans le DOM ─────────────────────────────────
function injectProfile(p) {
  const spec  = p.specialisation || 'generaliste';
  const label = getSpecialisationLabel(spec);
  const initials = getInitials(p.prenom, p.nom);

  // data-profile="*" → texte
  const map = {
    'nom':           `${p.prenom} ${p.nom}`,
    'prenom':        p.prenom || '',
    'nom-seul':      p.nom    || '',
    'email':         p.email  || '',
    'role':          p.role   || '',
    'cohorte':       p.cohorte || '',
    'cohorte-label': label,
    'initiales':     initials,
    'civilite':      p.civilite || '',
    'specialisation': label,
  };

  Object.entries(map).forEach(([key, val]) => {
    document.querySelectorAll(`[data-profile="${key}"]`)
      .forEach(el => { el.textContent = val; });
  });

  // Avatar initiales
  document.querySelectorAll('.sidebar__user-avatar').forEach(el => {
    if (!el.querySelector('img')) el.textContent = initials;
  });
}

// ── Couleur cohorte ARH ──────────────────────────────────────────
function applyCohorteColor(profile) {
  const spec  = (profile.specialisation || 'generaliste').toLowerCase();
  const color = ARH_COLORS[spec] || ARH_COLOR_DEFAULT;
  document.documentElement.style.setProperty('--cohorte-color', color);
  document.documentElement.setAttribute('data-cohorte', profile.cohorte || 'ARH');
  document.documentElement.setAttribute('data-spec', spec);
}

// ── Lien actif sidebar ────────────────────────────────────────────
function highlightActiveLink() {
  const current = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.sidebar__link').forEach(link => {
    const isActive = link.dataset.page === current || link.getAttribute('href') === current;
    link.classList.toggle('active', isActive);
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

// ── Déconnexion ───────────────────────────────────────────────────
function bindLogout() {
  document.querySelectorAll('[data-action="logout"], #logoutBtn, .sidebar__logout').forEach(btn => {
    // Éviter double-bind
    if (btn.dataset.logoutBound) return;
    btn.dataset.logoutBound = '1';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  });
}

// ── Sidebar mobile (hamburger) ────────────────────────────────────
function bindSidebarToggle() {
  const toggle  = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;

  // Créer l'overlay si absent
  let overlay = document.getElementById('sidebarOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id        = 'sidebarOverlay';
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  const open = () => {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-visible');
    toggle.setAttribute('aria-expanded', 'true');
  };

  const close = () => {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () =>
    sidebar.classList.contains('is-open') ? close() : open()
  );

  overlay.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

// ── Bouton thème ──────────────────────────────────────────────────
function initThemeButton() {
  // theme.js est déjà chargé via <script> dans le <head>
  // On s'assure juste que le bouton est mis à jour
  if (window.themeManager) {
    window.themeManager.updateToggleButton?.();
  }
}
