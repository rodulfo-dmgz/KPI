/**
 * DASHBOA_RD — Login Page Controller
 * Gère : connexion, activation du compte, modale mot de passe oublié
 */
import authService from '../../core/services/authService.js';
import { $, toast, handleError, redirectTo } from '../../core/utils/utils.js';

class LoginPage {
  constructor() { this.init(); }

  async init() {
    // Si session active ET profil lié → dashboard
    // On utilise une requête directe sans retry pour éviter la boucle
    const session = await authService.getSession();
    if (session) {
      try {
        const profile = await authService.getProfileDirect(session.user.id);
        if (profile) { redirectTo('pages/dashboard.html'); return; }
        // Pas de profil lié → on reste sur la page login (activation en cours)
      } catch {
        // Erreur réseau ou table inexistante → on reste sur login
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.attachEvents());
    } else {
      this.attachEvents();
    }
  }

  attachEvents() {
    $('#loginForm')?.addEventListener('submit',   e => this.handleLogin(e));
    $('#activateForm')?.addEventListener('submit', e => this.handleActivate(e));

    // Bascule login ↔ activation
    $('#showActivateLink')?.addEventListener('click', e => {
      e.preventDefault();
      $('#loginForm').style.display = 'none';
      $('#activateForm').style.display = 'flex';
    });
    $('#showLoginLink')?.addEventListener('click', e => {
      e.preventDefault();
      $('#activateForm').style.display = 'none';
      $('#loginForm').style.display = 'flex';
    });

    // Toggles mot de passe
    this.setupPasswordToggle('passwordToggle',        'password');
    this.setupPasswordToggle('activatePasswordToggle','activatePassword');

    // Modale mot de passe oublié
    const modal = $('#forgotPasswordModal');
    $('#forgotPasswordLink')?.addEventListener('click', e => {
      e.preventDefault();
      modal.style.display = 'block';
    });
    const closeModal = () => { modal.style.display = 'none'; };
    $('#forgotModalCloseBtn')?.addEventListener('click', closeModal);
    $('#forgotModalBackdrop')?.addEventListener('click', closeModal);
  }

  setupPasswordToggle(toggleId, inputId) {
    const toggle = $(`#${toggleId}`);
    const input  = $(`#${inputId}`);
    if (!toggle || !input) return;

    toggle.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      toggle.innerHTML = '';
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', show ? 'eye-off' : 'eye');
      toggle.appendChild(icon);
      if (typeof lucide !== 'undefined') lucide.createIcons({ root: toggle });
    });
  }

  async handleLogin(e) {
    e.preventDefault();
    const email    = $('#email').value.trim();
    const password = $('#password').value;

    this.clearErrors();

    if (!email)    { this.showError('email-error',    "L'email est requis"); return; }
    if (!password) { this.showError('password-error', 'Le mot de passe est requis'); return; }

    const btn = $('#submitBtn');
    btn.disabled = true;
    btn.classList.add('btn--loading');

    try {
      await authService.login(email, password);
      toast.success('Connexion réussie !');
      setTimeout(() => redirectTo('pages/dashboard.html'), 500);
    } catch (error) {
      btn.disabled = false;
      btn.classList.remove('btn--loading');

      if (error.message?.includes('Invalid login')) {
        this.showError('globalError', 'Email ou mot de passe incorrect.');
      } else {
        handleError(error, 'Connexion');
      }
    }
  }

  async handleActivate(e) {
    e.preventDefault();
    const email   = $('#activateEmail').value.trim();
    const pwd     = $('#activatePassword').value;
    const confirm = $('#activatePasswordConfirm').value;

    this.clearActivateErrors();

    if (!email)          { this.showError('activate-email-error',   "L'email est requis"); return; }
    if (pwd.length < 6)  { this.showError('activate-pwd-error',     'Minimum 6 caractères'); return; }
    if (pwd !== confirm) { this.showError('activate-confirm-error', 'Les mots de passe ne correspondent pas'); return; }

    const btn = $('#activateSubmitBtn');
    btn.disabled = true;
    btn.classList.add('btn--loading');

    try {
      // 1. Vérifier que l'email existe dans tb_kpi_users
      const profile = await authService.checkEmailExists(email);
      if (!profile) {
        this.showError('activateGlobalError', "Aucun profil trouvé. Contactez votre formateur.");
        btn.disabled = false; btn.classList.remove('btn--loading');
        return;
      }

      if (profile.is_activated) {
        this.showError('activateGlobalError', "Ce compte est déjà activé. Utilisez « Se connecter ».");
        btn.disabled = false; btn.classList.remove('btn--loading');
        return;
      }

      // 2. Signup → trigger Supabase lie auth_id automatiquement
      await authService.signup(email, pwd);

      const successEl = $('#activateSuccess');
      if (successEl) {
        successEl.textContent = `Bienvenue ${profile.prenom} ! Votre compte est activé.`;
        successEl.style.display = 'block';
      }

      btn.textContent = 'Compte activé !';
      btn.disabled = true;

      // Auto-retour login après 3s
      setTimeout(() => {
        $('#activateForm').style.display = 'none';
        $('#loginForm').style.display   = 'flex';
        $('#email').value = email;
        toast.success('Compte activé ! Connectez-vous maintenant.');
      }, 3000);

    } catch (error) {
      btn.disabled = false;
      btn.classList.remove('btn--loading');

      if (error.message?.includes('already registered')) {
        this.showError('activateGlobalError', "Email déjà enregistré. Utilisez « Se connecter ».");
      } else {
        this.showError('activateGlobalError', error.message || "Erreur lors de l'activation.");
      }
    }
  }

  showError(id, msg) {
    const el = $(`#${id}`);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  clearErrors() {
    ['email-error', 'password-error', 'globalError'].forEach(id => {
      const el = $(`#${id}`);
      if (el) el.style.display = 'none';
    });
  }

  clearActivateErrors() {
    ['activate-email-error','activate-pwd-error','activate-confirm-error','activateGlobalError'].forEach(id => {
      const el = $(`#${id}`);
      if (el) el.style.display = 'none';
    });
  }
}

new LoginPage();