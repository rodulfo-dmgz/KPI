/**
 * DASHBOA_RD — Dashboard Page Controller
 */
import authService  from '../../core/services/authService.js';
import storageService from '../../core/services/storageService.js';
import { $, redirectTo, toast }               from '../../core/utils/utils.js';
import { getRandomMessage, getCiviliteLabel, getCohorteLabel } from '../../core/utils/messages.js';
import { ROLES, MODULES_ARH, COHORTES }       from '../../core/config/constants.js';

class DashboardPage {
  constructor() { this.profile = null; this.init(); }

  async init() {
    try {
      const session = await authService.getSession();
      if (!session) { redirectTo('../index.html'); return; }

      this.profile = await authService.getProfile();
      if (!this.profile) { redirectTo('../index.html'); return; }

      this.renderUser();
      this.renderWelcome();
      this.renderModules();
      this.attachEvents();
      await this.loadStats();
    } catch (e) {
      console.error(e);
      redirectTo('../index.html');
    }
  }

  renderUser() {
    const { prenom, nom, role, cohorte } = this.profile;

    const avatar = $('#userAvatar');
    if (avatar) avatar.textContent = `${prenom[0]}${nom[0]}`;

    const name = $('#userName');
    if (name) name.textContent = `${prenom} ${nom}`;

    const roleEl = $('#userRole');
    if (roleEl) {
      roleEl.textContent = role === 'stagiaire'
        ? getCohorteLabel(cohorte)
        : role.charAt(0).toUpperCase() + role.slice(1);
    }

    // Admin/formateur → afficher section admin
    if (role === ROLES.ADMIN || role === ROLES.FORMATEUR) {
      const lbl = $('#adminSectionLabel'); if (lbl) lbl.style.display = '';
      const nav = $('#adminNavItem');      if (nav) nav.style.display = '';
    }

    // Afficher le lien de module selon la cohorte
    if (cohorte === 'ARH') {
      const navArh = $('#navModuleArh');
      if (navArh) navArh.style.display = '';
    }

    const cohorteName = $('#cohorteName');
    if (cohorteName) cohorteName.textContent = getCohorteLabel(cohorte);
  }

  renderWelcome() {
    const greeting = $('#welcomeGreeting');
    if (greeting) {
      greeting.textContent = `${getCiviliteLabel(this.profile.civilite)} ${this.profile.nom}`;
    }
    const msg = $('#welcomeMessage');
    if (msg) msg.textContent = getRandomMessage(this.profile);
  }

  renderModules() {
    const grid = $('#modulesGrid');
    if (!grid) return;

    const { cohorte } = this.profile;
    let modules = [];

    if (cohorte === 'ARH') {
      modules = MODULES_ARH;
    } else {
      // Pour les autres cohortes : placeholder générique
      grid.innerHTML = `
        <div class="stat-card" style="grid-column:1/-1;text-align:center;padding:var(--space-10);color:var(--text-muted);">
          <i data-lucide="clock" style="width:32px;height:32px;margin-bottom:var(--space-3);opacity:0.4;"></i>
          <p style="margin:0;">Les modules pour la cohorte <strong>${cohorte}</strong> sont en cours de déploiement.</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons({ root: grid });
      return;
    }

    const icons = {
      'lightbulb':       '💡', 'search': '🔍', 'calculator': '🧮',
      'bar-chart-2':     '📊', 'layout-dashboard': '📋',
      'table-2':         '💻', 'briefcase': '🎯',
    };

    const niveauLabels = {
      debutant:      '<span class="badge badge--debutant">Débutant</span>',
      intermediaire: '<span class="badge badge--intermediaire">Intermédiaire</span>',
      avance:        '<span class="badge badge--avance">Avancé</span>',
    };

    grid.innerHTML = modules.map((m, i) => `
      <a href="../modules/arh/module-${i + 1}/index.html" class="module-card animate-fade-up delay-${Math.min(i + 1, 6)}">
        <div class="module-card__icon"
          style="background:var(--action-cta-ultra-soft);border:1px solid var(--action-cta-border-soft);">
          <span style="font-size:1.25rem;">${icons[m.icon] || '📘'}</span>
        </div>
        <div class="module-card__meta">
          <span class="module-header__badge">${m.id}</span>
          ${niveauLabels[m.niveau] || ''}
          <span class="module-header__duration">
            <i data-lucide="clock"></i> ${m.duree}h
          </span>
        </div>
        <div class="module-card__title">${m.titre}</div>
        <div class="module-card__footer">
          <span id="status-${m.id}" class="badge badge--neutral">Non commencé</span>
          <span id="score-${m.id}" style="font-family:var(--font-mono);font-size:0.6875rem;color:var(--text-muted);">—</span>
        </div>
      </a>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: grid });
  }

  async loadStats() {
    try {
      const progression = await storageService.getProgression(this.profile.id);
      const badges      = await storageService.getUserBadges(this.profile.id);

      const total  = MODULES_ARH.length;
      const done   = progression.filter(p =>
        p.statut === 'valide' || p.statut === 'termine'
      ).length;

      const scores = progression.map(p => p.score_pct).filter(s => s != null);
      const avgScore = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;

      const el = id => $(id);
      if (el('#statCompleted')) el('#statCompleted').textContent = `${done} / ${total}`;
      if (el('#statProgress'))  el('#statProgress').textContent  = `${Math.round((done / total) * 100)}%`;
      if (el('#statScore'))     el('#statScore').textContent     = avgScore != null ? `${avgScore}%` : '—';
      if (el('#statBadges'))    el('#statBadges').textContent    = `${badges.length} / 7`;

      // Mettre à jour les statuts des modules
      progression.forEach(p => {
        const statusEl = $(`#status-${p.module_code}`);
        const scoreEl  = $(`#score-${p.module_code}`);
        if (statusEl) {
          const labels = {
            en_cours: '<span class="badge badge--warning">En cours</span>',
            termine:  '<span class="badge badge--primary">Terminé</span>',
            valide:   '<span class="badge badge--success">Validé</span>',
          };
          statusEl.outerHTML = labels[p.statut] || statusEl.outerHTML;
        }
        if (scoreEl && p.score_pct != null) {
          scoreEl.textContent = `${Math.round(p.score_pct)}%`;
        }
      });

    } catch (e) { console.error('Stats:', e); }
  }

  attachEvents() {
    $('#logoutBtn')?.addEventListener('click', async () => {
      await authService.logout();
      redirectTo('../index.html');
    });

    const mt = $('#menuToggle'), sb = $('#sidebar'), ov = $('#sidebarOverlay');
    if (mt && sb) {
      mt.addEventListener('click', () => {
        sb.classList.toggle('open');
        ov?.classList.toggle('active');
      });
      ov?.addEventListener('click', () => {
        sb.classList.remove('open');
        ov.classList.remove('active');
      });
    }
  }
}

new DashboardPage();
