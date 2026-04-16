/**
 * DASHBOA_RD — ARH Hub Page Controller
 */
import authService    from '../../core/services/authService.js';
import storageService from '../../core/services/storageService.js';
import { $, redirectTo, toast } from '../../core/utils/utils.js';
import { getCohorteLabel }      from '../../core/utils/messages.js';
import { MODULES_ARH, BADGES, ROLES } from '../../core/config/constants.js';

class ArhPage {
  constructor() { this.profile = null; this.progression = []; this.badges = []; this.init(); }

  async init() {
    try {
      const session = await authService.getSession();
      if (!session) { redirectTo('../../index.html'); return; }

      this.profile = await authService.getProfile();
      if (!this.profile) { redirectTo('../../index.html'); return; }

      this.renderUser();
      this.attachEvents();

      const [prog, bdg] = await Promise.all([
        storageService.getProgression(this.profile.id),
        storageService.getUserBadges(this.profile.id),
      ]);
      this.progression = prog;
      this.badges      = bdg;

      this.renderModules();
      this.renderOverview();
      this.renderBadges();

    } catch (e) { console.error(e); }
  }

  renderUser() {
    const { prenom, nom, cohorte } = this.profile;
    const a = $('#userAvatar');  if (a) a.textContent = `${prenom[0]}${nom[0]}`;
    const n = $('#userName');    if (n) n.textContent = `${prenom} ${nom}`;
    const r = $('#userRole');    if (r) r.textContent = getCohorteLabel(cohorte);
  }

  renderModules() {
    const list = $('#modulesList');
    if (!list) return;

    const niveauClass = { debutant: 'debutant', intermediaire: 'intermediaire', avance: 'avance' };
    const niveauIcons = { debutant: 'lightbulb', intermediaire: 'bar-chart-2', avance: 'zap' };

    list.innerHTML = MODULES_ARH.map((m, i) => {
      const prog   = this.progression.find(p => p.module_code === m.id);
      const statut = prog?.statut || 'non_commence';
      const score  = prog?.score_pct != null ? `${Math.round(prog.score_pct)}%` : '—';

      const statusBadge = {
        non_commence: '<span class="badge badge--neutral">Non commencé</span>',
        en_cours:     '<span class="badge badge--warning">En cours</span>',
        termine:      '<span class="badge badge--primary">Terminé</span>',
        valide:       '<span class="badge badge--success">Validé ✓</span>',
      }[statut] || '';

      const rowClass = statut === 'valide' ? 'module-row--completed' :
                       statut === 'en_cours' ? 'module-row--active' : '';

      return `
        <a href="module-${i + 1}/index.html"
           class="module-row ${rowClass} animate-fade-up delay-${Math.min(i + 1, 6)}">
          <span class="module-row__num">${m.id}</span>
          <div class="module-row__icon module-row__icon--${niveauClass[m.niveau] || 'debutant'}">
            <i data-lucide="${niveauIcons[m.niveau] || 'book-open'}"></i>
          </div>
          <div class="module-row__content">
            <div class="module-row__title">${m.titre}</div>
            <div class="module-row__meta">
              <span><i data-lucide="clock" style="width:12px;height:12px;"></i> ${m.duree}h</span>
              <span class="badge badge--${niveauClass[m.niveau]}" style="font-size:0.5625rem;padding:1px 6px;">
                ${m.niveau.charAt(0).toUpperCase() + m.niveau.slice(1)}
              </span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:var(--space-1);">
            ${statusBadge}
            <span style="font-family:var(--font-mono);font-size:0.6875rem;color:var(--text-muted);">${score}</span>
          </div>
        </a>
      `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: list });
  }

  renderOverview() {
    const total = MODULES_ARH.length;
    const done  = this.progression.filter(p => p.statut === 'valide' || p.statut === 'termine').length;
    const scores = this.progression.map(p => p.score_pct).filter(s => s != null);
    const avg   = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const dureeRestante = MODULES_ARH
      .filter((m, i) => !this.progression.find(p => p.module_code === m.id && (p.statut === 'valide' || p.statut === 'termine')))
      .reduce((acc, m) => acc + m.duree, 0);

    const prog = this.progression.find(p => p.niveau_adaptatif);
    const niveau = prog?.niveau_adaptatif || (this.profile.niveau_adaptatif || '—');

    const el = id => $(id);
    if (el('#overviewCompleted')) el('#overviewCompleted').textContent = `${done} / ${total}`;
    if (el('#overviewScore'))     el('#overviewScore').textContent     = avg != null ? `${avg}%` : '—';
    if (el('#overviewTime'))      el('#overviewTime').textContent      = `${dureeRestante}h restantes`;
    if (el('#overviewNiveau'))    el('#overviewNiveau').textContent    = niveau;
    if (el('#globalProgress'))    el('#globalProgress').textContent    = `${done} / ${total} complétés`;
  }

  renderBadges() {
    const grid = $('#badgesGrid');
    if (!grid) return;

    const obtainedCodes = new Set(this.badges.map(b => b.badge_code));

    grid.innerHTML = Object.values(BADGES).map(b => {
      const unlocked = obtainedCodes.has(b.code);
      return `
        <div class="badge-item" title="${b.label} — ${b.condition}">
          <div class="badge-item__icon ${unlocked ? 'badge-item__icon--unlocked' : 'badge-item__icon--locked'}">
            ${b.icon}
          </div>
          <span class="badge-item__label">${b.label}</span>
        </div>
      `;
    }).join('');
  }

  attachEvents() {
    $('#logoutBtn')?.addEventListener('click', async () => {
      await authService.logout();
      redirectTo('../../index.html');
    });

    const mt = $('#menuToggle'), sb = $('#sidebar'), ov = $('#sidebarOverlay');
    if (mt && sb) {
      mt.addEventListener('click', () => { sb.classList.toggle('open'); ov?.classList.toggle('active'); });
      ov?.addEventListener('click', () => { sb.classList.remove('open'); ov.classList.remove('active'); });
    }
  }
}

new ArhPage();
