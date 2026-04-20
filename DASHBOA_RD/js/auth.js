/**
 * DASHBOA_RD — Auth Manager
 * Login · Logout · Session · Garde de route · Redirection
 */

import { signIn, signOut, getSession, getUserProfile, updateLastLogin } from './supabase.js';

const SESSION_KEY = 'dashboard_profile';

// ── Profil en mémoire (sessionStorage) ───────────────────────────
export function saveProfile(profile) {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile)); } catch {}
}

export function getProfile() {
  try {
    const r = sessionStorage.getItem(SESSION_KEY);
    return r ? JSON.parse(r) : null;
  } catch { return null; }
}

function clearProfile() {
  sessionStorage.removeItem(SESSION_KEY);
}

// ── Détection de la racine du projet (dossier contenant index.html) ──
function getProjectRoot() {
  // Méthode fiable : récupérer le chemin du script en cours d'exécution
  const scripts = document.getElementsByTagName('script');
  let scriptPath = '';
  for (let script of scripts) {
    if (script.src && script.src.includes('auth.js')) {
      scriptPath = script.src;
      break;
    }
  }

  if (scriptPath) {
    // Exemple : https://rodulfo-dmgz.github.io/KPI/DASHBOA_RD/js/auth.js
    const url = new URL(scriptPath);
    const pathParts = url.pathname.split('/');
    // Supprimer le dernier segment ('js/auth.js') → deux niveaux
    pathParts.pop(); // auth.js
    pathParts.pop(); // js
    const base = pathParts.join('/'); // /KPI/DASHBOA_RD
    return base === '' ? '/' : base;
  }

  // Fallback : utiliser le chemin de la page courante (moins fiable)
  const path = window.location.pathname;
  const segments = path.split('/').filter(s => s);
  // On suppose que la racine est le dossier contenant index.html
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].includes('.html')) {
      return '/' + segments.slice(0, i).join('/');
    }
  }
  return '';
}

// ── Chemin de redirection selon rôle ─────────────────────────────
export function getRedirectPath(profile) {
  const root = getProjectRoot();
  // Construire l'URL absolue à partir de la racine du projet
  const base = root.endsWith('/') ? root : root + '/';

  if (profile.role === 'admin')     return base + '../../admin/dashboard.html';
  if (profile.role === 'formateur') return base + '../../formateur/dashboard.html';

  const c = (profile.cohorte || 'arh').toLowerCase();
  return base + `../../stagiaire/${c}/dashboard.html`;
}

// ── Redirection vers login ───────────────────────────────────────
function redirectToLogin() {
  window.location.href = getProjectRoot() + '/index.html';
}

// ── CONNEXION ─────────────────────────────────────────────────────
export async function handleLogin(email, password, uiRefs = {}) {
  const { submitBtn, errorEl, emailErrorEl, passwordErrorEl } = uiRefs;

  hideErrors({ errorEl, emailErrorEl, passwordErrorEl });
  setLoading(submitBtn, true);

  try {
    // Validation basique
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showError(emailErrorEl, 'Adresse email invalide.');
      return;
    }
    if (!password || password.length < 6) {
      showError(passwordErrorEl, 'Mot de passe trop court (6 car. min.).');
      return;
    }

    // 1. Auth Supabase
    const { data: authData, error: authErr } = await signIn(email, password);
    if (authErr) { showError(errorEl, translateError(authErr.message)); return; }

    // 2. Profil en base
    const authUserId = authData.user?.id;
    if (!authUserId) { showError(errorEl, 'Erreur d\'identification. Réessayez.'); return; }

    const { data: profile, error: profileErr } = await getUserProfile(authUserId);
    if (profileErr || !profile) { showError(errorEl, 'Profil introuvable. Contactez votre formateur.'); return; }
    if (!profile.is_active) {
      showError(errorEl, 'Votre compte est désactivé. Contactez un administrateur.');
      await signOut();
      return;
    }

    // 3. Sauvegarde + redirect
    saveProfile(profile);
    updateLastLogin(profile.id);
    window.location.href = getRedirectPath(profile);

  } catch (err) {
    console.error('[Auth]', err);
    showError(errorEl, 'Erreur inattendue. Veuillez réessayer.');
  } finally {
    setLoading(submitBtn, false);
  }
}

// ── DÉCONNEXION ───────────────────────────────────────────────────
export async function handleLogout() {
  try { await signOut(); } catch {}
  clearProfile();
  window.location.href = getProjectRoot() + '/index.html';
}

// ── GARDE DE ROUTE ────────────────────────────────────────────────
export async function requireAuth({ roles = [], cohortes = [] } = {}) {
  const session = await getSession();
  if (!session) { redirectToLogin(); return null; }

  let profile = getProfile();
  if (!profile) {
    const { data, error } = await getUserProfile(session.user.id);
    if (error || !data) { redirectToLogin(); return null; }
    profile = data;
    saveProfile(profile);
  }

  if (roles.length && !roles.includes(profile.role)) {
    window.location.href = getRedirectPath(profile);
    return null;
  }

  if (cohortes.length && profile.role === 'stagiaire' && !cohortes.includes(profile.cohorte)) {
    window.location.href = getRedirectPath(profile);
    return null;
  }

  return profile;
}

// ── INIT PAGE LOGIN ───────────────────────────────────────────────
export function initLoginPage() {
  // Déjà connecté → redirect
  getSession().then(session => {
    if (session) {
      const p = getProfile();
      if (p) window.location.href = getRedirectPath(p);
    }
  });

  const form            = document.getElementById('loginForm');
  const submitBtn       = document.getElementById('submitBtn');
  const emailInput      = document.getElementById('email');
  const passwordInput   = document.getElementById('password');
  const passwordToggle  = document.getElementById('passwordToggle');
  const eyeIcon         = document.getElementById('eyeIcon');
  const errorEl         = document.getElementById('error');
  const emailErrorEl    = document.getElementById('email-error');
  const passwordErrorEl = document.getElementById('password-error');

  passwordToggle?.addEventListener('click', () => {
    const isVisible = passwordInput.type === 'text';
    passwordInput.type = isVisible ? 'password' : 'text';
    passwordToggle.setAttribute('aria-pressed', String(!isVisible));
    passwordToggle.setAttribute('aria-label', isVisible ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
    if (eyeIcon) {
      eyeIcon.setAttribute('data-lucide', isVisible ? 'eye' : 'eye-off');
      if (typeof lucide !== 'undefined') lucide.createIcons({ root: passwordToggle });
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleLogin(emailInput.value, passwordInput.value,
      { submitBtn, errorEl, emailErrorEl, passwordErrorEl });
  });

  const forgotLink  = document.getElementById('forgotPasswordLink');
  const modal       = document.getElementById('forgotPasswordModal');
  const closeBtn    = document.getElementById('forgotModalCloseBtn');
  const backdrop    = document.getElementById('forgotModalBackdrop');

  forgotLink?.addEventListener('click', (e) => {
    e.preventDefault();
    if (modal) modal.style.display = 'flex';
  });

  [closeBtn, backdrop].forEach(el => {
    el?.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.style.display !== 'none')
      modal.style.display = 'none';
  });
}

// ── Helpers UI ────────────────────────────────────────────────────
function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'flex';
  setTimeout(() => { if (el) el.style.display = 'none'; }, 6000);
}

function hideErrors(elements) {
  Object.values(elements).forEach(el => {
    if (el) { el.textContent = ''; el.style.display = 'none'; }
  });
}

function setLoading(btn, isLoading) {
  if (!btn) return;
  btn.disabled    = isLoading;
  btn.textContent = isLoading ? 'Connexion en cours…' : 'Accéder au dashboard';
  btn.style.opacity = isLoading ? '0.7' : '1';
}

function translateError(msg) {
  const map = {
    'Invalid login credentials':       'Email ou mot de passe incorrect.',
    'Email not confirmed':              'Email non confirmé. Contactez votre formateur.',
    'Too many requests':                'Trop de tentatives. Patientez quelques minutes.',
    'User not found':                   'Aucun compte trouvé avec cet email.',
    'JWT expired':                      'Session expirée. Reconnectez-vous.',
  };
  return map[msg] || 'Connexion échouée. Vérifiez vos identifiants.';
}

export default { handleLogin, handleLogout, requireAuth, getProfile, saveProfile, getRedirectPath, initLoginPage };
