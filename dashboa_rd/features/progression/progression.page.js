/**
 * DASHBOA_RD — Progression Page Controller
 */
import authService    from '../../core/services/authService.js';
import storageService from '../../core/services/storageService.js';
import { $, redirectTo } from '../../core/utils/utils.js';
import { getCohorteLabel, getNiveauLabel } from '../../core/utils/messages.js';
import { MODULES_ARH, BADGES, ROLES }      from '../../core/config/constants.js';

class ProgressionPage {
  constructor() { this.profile = null; this.init(); }

  async init() {
    try {
      const session = await authService.getSession();
      if (!session) { redirectTo('../index.html'); return; }
      this.profile = await authService.getProfile();
      if (!this.profile) { redirectTo('../index.html'); return; }

      this.renderUser();
      this.attachEvents();

      const [prog, badges] = await Promise.all([
        storageService.getProgression(this.profile.id),
        storageService.getUserBadges(this.profile.id),
      ]);

      this.renderStats(prog, badges);
      this.renderModules(prog);
      this.renderBadges(badges);
    } catch (e) { console.error(e); }
  }

  renderUser() {
    const { prenom, nom, role, cohorte } = this.profile;
    const a = $('#userAvatar'); if (a) a.textContent = `${prenom[0]}${nom[0]}`;
    const n = $('#userName');   if (n) n.textContent = `${prenom} ${nom}`;
    const r = $('#userRole');   if (r) r.textContent = role === 'stagiaire' ? getCohorteLabel(cohorte) : role;

    if (role === ROLES.ADMIN || role === ROLES.FORMATEUR) {
      const lbl = $('#adminSectionLabel'); if (lbl) lbl.style.display = '';
      const nav = $('#adminNavItem');      if (nav) nav.style.display = '';
    }
  }

  renderStats(prog, badges) {
    const total     = MODULES_ARH.length;
    const validated = prog.filter(p => p.statut === 'valide').length;
    const scores    = prog.map(p => p.score_pct).filter(s => s != null);
    const avg       = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    const pct       = Math.round((validated / total) * 100);

    const niveauProg = prog.find(p => p.niveau_adaptatif);
    const niveau     = niveauProg?.niveau_adaptatif || this.profile.niveau_adaptatif || '—';

    const el = id => $(id);
    if (el('#statValidated'))   el('#statValidated').textContent   = `${validated} / ${total}`;
    if (el('#statAvg'))         el('#statAvg').textContent         = avg != null ? `${avg}%` : '—';
    if (el('#statBadges'))      el('#statBadges').textContent      = `${badges.length} / 7`;
    if (el('#statNiveau'))      el('#statNiveau').textContent      = getNiveauLabel(niveau);
    if (el('#progressPct'))     el('#progressPct').textContent     = `${pct}%`;
    if (el('#globalProgressFill')) el('#globalProgressFill').style.width = `${pct}%`;
  }

  renderModules(prog) {
    const list = $('#modulesProgressList');
    if (!list) return;

    list.innerHTML = MODULES_ARH.map((m, i) => {
      const p       = prog.find(x => x.module_code === m.id);
      const statut  = p?.statut || 'non_commence';
      const score   = p?.score_pct != null ? Math.round(p.score_pct) : null;
      const pct     = score ?? 0;

      const statusColor = {
        valide:       'var(--semantic-success)',
        termine:      'var(--color-primary-600)',
        en_cours:     'var(--semantic-warning)',
        non_commence: 'var(--text-muted)',
      }[statut];

      const statusLabel = {
        valide:       '✅ Validé',
        termine:      '🔵 Terminé',
        en_cours:     '🟡 En cours',
        non_commence: '⬜ Non commencé',
      }[statut];

      return `
        <div class="card animate-fade-up delay-${Math.min(i + 1, 6)}" style="padding:var(--space-5);">
          <div style="display:flex;align-items:center;gap:var(--space-4);flex-wrap:wrap;">
            <span style="font-family:var(--font-mono);font-size:0.6875rem;font-weight:var(--font-weight-bold);
              color:var(--action-cta);min-width:28px;">${m.id}</span>
            <div style="flex:1;min-width:160px;">
              <div style="font-weight:var(--font-weight-semibold);color:var(--text-primary);
                margin-bottom:var(--space-1);">${m.titre}</div>
              <div style="font-family:var(--font-mono);font-size:0.6875rem;color:var(--text-muted);">
                ${m.duree}h · ${m.niveau}
              </div>
            </div>
            <div style="flex:1;min-width:120px;">
              <div class="progress-bar" style="height:8px;margin-bottom:var(--space-1);">
                <div class="progress-bar__fill" style="width:${pct}%;background:${statusColor};"></div>
              </div>
              <div style="font-family:var(--font-mono);font-size:0.6875rem;color:var(--text-muted);">
                ${score != null ? `${score}%` : '—'}
              </div>
            </div>
            <span style="font-size:var(--font-body2-size);color:${statusColor};white-space:nowrap;">
              ${statusLabel}
            </span>
            <a href="../modules/arh/module-${i + 1}/index.html"
              class="btn btn-outline-cta btn-sm" style="white-space:nowrap;">
              ${statut === 'non_commence' ? 'Commencer' : statut === 'valide' ? 'Revoir' : 'Continuer'}
              <i data-lucide="arrow-right"></i>
            </a>
          </div>
        </div>
      `;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: list });
  }

  renderBadges(badges) {
    const list = $('#badgesList');
    const count = $('#badgesCount');
    if (!list) return;

    const obtainedCodes = new Set(badges.map(b => b.badge_code));
    if (count) count.textContent = `${obtainedCodes.size} / 7`;

    list.innerHTML = Object.values(BADGES).map(b => {
      const unlocked  = obtainedCodes.has(b.code);
      const obtainedB = badges.find(x => x.badge_code === b.code);

      return `
        <div style="text-align:center;padding:var(--space-5);background:var(--surface-base);
          border:1px solid ${unlocked ? 'var(--color-accent-300)' : 'var(--border-light)'};
          border-radius:var(--radius-2xl);transition:all var(--transition-base);">
          <div style="font-size:2.5rem;margin-bottom:var(--space-3);
            ${unlocked ? '' : 'filter:grayscale(1);opacity:0.35;'}">
            ${b.icon}
          </div>
          <div style="font-family:var(--font-heading);font-size:var(--font-body2-size);
            font-weight:var(--font-weight-semibold);color:${unlocked ? 'var(--text-primary)' : 'var(--text-muted)'};
            margin-bottom:var(--space-2);">${b.label}</div>
          <div style="font-size:var(--font-caption-size);color:var(--text-muted);line-height:1.4;">
            ${b.condition}
          </div>
          ${unlocked && obtainedB ? `
            <div style="margin-top:var(--space-3);font-family:var(--font-mono);font-size:0.5625rem;
              color:var(--semantic-success);">
              Obtenu le ${new Date(obtainedB.obtained_at).toLocaleDateString('fr-FR')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  attachEvents() {
    $('#logoutBtn')?.addEventListener('click', async () => {
      await authService.logout(); redirectTo('../index.html');
    });
    const mt = $('#menuToggle'), sb = $('#sidebar'), ov = $('#sidebarOverlay');
    if (mt && sb) {
      mt.addEventListener('click', () => { sb.classList.toggle('open'); ov?.classList.toggle('active'); });
      ov?.addEventListener('click', () => { sb.classList.remove('open'); ov.classList.remove('active'); });
    }
  }
}

new ProgressionPage();
