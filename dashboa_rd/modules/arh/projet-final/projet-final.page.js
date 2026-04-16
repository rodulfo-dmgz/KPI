/**
 * DASHBOA_RD — Projet Final Certifiant ARH
 */
import authService    from '../../../core/services/authService.js';
import storageService from '../../../core/services/storageService.js';
import { $, redirectTo, toast, handleError } from '../../../core/utils/utils.js';
import { getCohorteLabel } from '../../../core/utils/messages.js';

class ProjetFinalPage {
  constructor() { this.profile = null; this.init(); }

  async init() {
    try {
      const session = await authService.getSession();
      if (!session) { redirectTo('../../../index.html'); return; }
      this.profile = await authService.getProfile();
      if (!this.profile) { redirectTo('../../../index.html'); return; }

      this.renderUser();
      this.attachEvents();
      await this.loadExistingSubmission();
    } catch (e) { console.error(e); }
  }

  renderUser() {
    const { prenom, nom, cohorte } = this.profile;
    const a = $('#userAvatar'); if (a) a.textContent = `${prenom[0]}${nom[0]}`;
    const n = $('#userName');   if (n) n.textContent = `${prenom} ${nom}`;
    const r = $('#userRole');   if (r) r.textContent = getCohorteLabel(cohorte);
  }

  async loadExistingSubmission() {
    try {
      const existing = await storageService.getProjetFinal(this.profile.id);
      if (!existing) return;

      const banner = $('#alreadySubmitted');
      if (banner) banner.style.display = 'block';

      const dateEl = $('#submittedDate');
      if (dateEl) {
        dateEl.textContent = `Soumis le ${new Date(existing.submitted_at).toLocaleDateString('fr-FR')} — Mention : ${existing.mention || '—'}`;
      }

      const scoreEl = $('#submittedScore');
      if (scoreEl) scoreEl.textContent = `${existing.score_total} / 100`;

      // Pré-remplir les champs
      if ($('#scoreL1')) $('#scoreL1').value = existing.livrable_1_score || '';
      if ($('#scoreL2')) $('#scoreL2').value = existing.livrable_2_score || '';
      if ($('#scoreL3')) $('#scoreL3').value = existing.livrable_3_score || '';
      if ($('#scoreL4')) $('#scoreL4').value = existing.livrable_4_score || '';

    } catch (e) { /* silencieux */ }
  }

  async submitProjet() {
    const l1 = parseInt($('#scoreL1')?.value || 0);
    const l2 = parseInt($('#scoreL2')?.value || 0);
    const l3 = parseInt($('#scoreL3')?.value || 0);
    const l4 = parseInt($('#scoreL4')?.value || 0);

    if (l1 > 20 || l2 > 25 || l3 > 30 || l4 > 25) {
      toast.warning('Scores invalides — vérifiez les maximums (20, 25, 30, 25).');
      return;
    }

    const total = l1 + l2 + l3 + l4;

    const btn = $('#submitProjetBtn');
    if (btn) { btn.disabled = true; btn.classList.add('btn--loading'); }

    try {
      await storageService.saveProjetFinal(this.profile.id, { l1, l2, l3, l4 });

      // Attribuer badge si ≥ 70%
      if (total >= 70) {
        await storageService.awardBadge(this.profile.id, 'ARH_DATA_DRIVEN');
        if (total >= 80) {
          await storageService.awardBadge(this.profile.id, 'CERTIFIE_KPI_RH');
        }
      }

      const mention = total >= 80 ? 'Très bien' : total >= 70 ? 'Bien' : total >= 60 ? 'Passable' : 'Non validé';
      toast.success(`Projet soumis ! Score : ${total}/100 — ${mention}`);

      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      handleError(e, 'Soumission projet');
      if (btn) { btn.disabled = false; btn.classList.remove('btn--loading'); }
    }
  }

  attachEvents() {
    $('#submitProjetBtn')?.addEventListener('click', () => this.submitProjet());
    $('#logoutBtn')?.addEventListener('click', async () => {
      await authService.logout(); redirectTo('../../../index.html');
    });
    const mt = $('#menuToggle'), sb = $('#sidebar'), ov = $('#sidebarOverlay');
    if (mt && sb) {
      mt.addEventListener('click', () => { sb.classList.toggle('open'); ov?.classList.toggle('active'); });
      ov?.addEventListener('click', () => { sb.classList.remove('open'); ov.classList.remove('active'); });
    }
  }
}

new ProjetFinalPage();
