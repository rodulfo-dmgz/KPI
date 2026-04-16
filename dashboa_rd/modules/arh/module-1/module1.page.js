/**
 * DASHBOA_RD — Module 1 ARH : Comprendre les KPI RH
 * Gère : auth, exercice interactif, quiz QCM, progression
 */
import authService    from '../../../core/services/authService.js';
import storageService from '../../../core/services/storageService.js';
import { $, redirectTo, toast } from '../../../core/utils/utils.js';
import { getCohorteLabel }      from '../../../core/utils/messages.js';

const MODULE_CODE = 'M1';

const EXERCISE_ITEMS = [
  { id: 1, kpi: 'Taux d\'absentéisme',         correct: 'Social' },
  { id: 2, kpi: 'Délai moyen de recrutement',  correct: 'Recrutement' },
  { id: 3, kpi: 'Heures de formation/salarié', correct: 'Formation' },
  { id: 4, kpi: 'Masse salariale / CA',        correct: 'Paie & Admin' },
  { id: 5, kpi: 'Taux de turnover',            correct: 'Social' },
  { id: 6, kpi: 'Coût par recrue',             correct: 'Recrutement' },
];

const FAMILLES = ['Recrutement', 'Social', 'Formation', 'Paie & Admin'];

const QUIZ_QUESTIONS = [
  {
    id: 1,
    text: 'Un KPI se distingue d\'une donnée brute par :',
    options: [
      { key: 'a', text: 'Sa taille' },
      { key: 'b', text: 'Sa comparaison à une cible et son actionabilité' },
      { key: 'c', text: 'Son format Excel' },
      { key: 'd', text: 'Son ancienneté' },
    ],
    correct: 'b',
    explanation: 'Un KPI est toujours associé à un objectif ou une cible. Il permet de prendre une décision, contrairement à une donnée brute qui est simplement une information.',
  },
  {
    id: 2,
    text: 'Quelle famille de KPI concerne le taux de turnover ?',
    options: [
      { key: 'a', text: 'Formation' },
      { key: 'b', text: 'Paie & Admin' },
      { key: 'c', text: 'Social' },
      { key: 'd', text: 'Recrutement' },
    ],
    correct: 'c',
    explanation: 'Le taux de turnover appartient à la famille "Social" car il mesure la stabilité des effectifs et le niveau de fidélisation des salariés.',
  },
  {
    id: 3,
    text: 'SMART signifie :',
    options: [
      { key: 'a', text: 'Spécifique, Mesurable, Atteignable, Réaliste, Temporel' },
      { key: 'b', text: 'Simple, Moderne, Analytique, Rapide, Technique' },
      { key: 'c', text: 'Stratégique, Mesurable, Annuel, Réduit, Transversal' },
      { key: 'd', text: 'Systématique, Manuel, Automatique, Rigoureux, Temporaire' },
    ],
    correct: 'a',
    explanation: 'SMART est un acronyme qui définit les 5 critères d\'un bon objectif (et donc d\'un bon KPI) : Spécifique, Mesurable, Atteignable, Réaliste et Temporel.',
  },
  {
    id: 4,
    text: 'Lequel de ces documents contient des KPI RH obligatoires ?',
    options: [
      { key: 'a', text: 'Le contrat de travail' },
      { key: 'b', text: 'Le bilan social' },
      { key: 'c', text: 'La fiche de paie' },
      { key: 'd', text: 'L\'accord de confidentialité' },
    ],
    correct: 'b',
    explanation: 'Le bilan social est un document légalement obligatoire (entreprises > 300 salariés) qui contient des indicateurs RH : effectifs, rémunérations, conditions de travail, formation, etc.',
  },
  {
    id: 5,
    text: 'Un KPI "rouge" dans un tableau de bord indique :',
    options: [
      { key: 'a', text: 'Bonne performance' },
      { key: 'b', text: 'Données manquantes' },
      { key: 'c', text: 'Résultat hors cible nécessitant une action corrective' },
      { key: 'd', text: 'KPI en cours de calcul' },
    ],
    correct: 'c',
    explanation: 'Dans le système RAG (Rouge-Ambre-Vert), le rouge signifie que l\'indicateur est significativement hors cible et qu\'une action corrective est requise immédiatement.',
  },
];

class Module1Page {
  constructor() {
    this.profile = null;
    this.userAnswers = {};
    this.quizSubmitted = false;
    this.exerciseAnswers = {};
    this.init();
  }

  async init() {
    try {
      const session = await authService.getSession();
      if (!session) { redirectTo('../../../index.html'); return; }
      this.profile = await authService.getProfile();
      if (!this.profile) { redirectTo('../../../index.html'); return; }

      this.renderUser();
      this.renderExercise();
      this.renderQuiz();
      await this.loadProgression();
      this.attachEvents();

      // Exposer pour les fonctions globales du HTML
      window.moduleController = this;
    } catch (e) { console.error(e); }
  }

  renderUser() {
    const { prenom, nom, cohorte } = this.profile;
    const a = $('#userAvatar'); if (a) a.textContent = `${prenom[0]}${nom[0]}`;
    const n = $('#userName');   if (n) n.textContent = `${prenom} ${nom}`;
    const r = $('#userRole');   if (r) r.textContent = getCohorteLabel(cohorte);
  }

  renderExercise() {
    const container = $('#exerciseItems');
    if (!container) return;

    container.innerHTML = EXERCISE_ITEMS.map(item => `
      <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3);flex-wrap:wrap;" id="exercise-${item.id}">
        <span style="flex:1;font-size:var(--font-body2-size);color:var(--text-primary);font-weight:var(--font-weight-medium);min-width:220px;">
          ${item.kpi}
        </span>
        <select class="form-input form-select" style="max-width:200px;"
          onchange="window.moduleController.setExerciseAnswer(${item.id}, this.value)">
          <option value="">— Choisir —</option>
          ${FAMILLES.map(f => `<option value="${f}">${f}</option>`).join('')}
        </select>
        <span class="exercise-result-${item.id}" style="font-size:var(--font-caption-size);"></span>
      </div>
    `).join('');
  }

  setExerciseAnswer(id, value) {
    this.exerciseAnswers[id] = value;
  }

  renderQuiz() {
    const container = $('#quizContainer');
    if (!container) return;

    container.innerHTML = QUIZ_QUESTIONS.map((q, i) => `
      <div class="quiz-question" id="q-${q.id}">
        <div class="quiz-question__num">QUESTION ${i + 1} / ${QUIZ_QUESTIONS.length}</div>
        <div class="quiz-question__text">${q.text}</div>
        <div class="quiz-options">
          ${q.options.map(opt => `
            <div class="quiz-option" id="opt-${q.id}-${opt.key}"
              onclick="window.moduleController.selectAnswer(${q.id}, '${opt.key}')">
              <div class="quiz-option__marker">${opt.key.toUpperCase()}</div>
              <span>${opt.text}</span>
            </div>
          `).join('')}
        </div>
        <div class="quiz-explanation" id="expl-${q.id}">${q.explanation}</div>
      </div>
    `).join('');

    container.innerHTML += `
      <div style="text-align:center;margin-top:var(--space-6);" id="submitBtn-container">
        <button class="btn btn-cta" onclick="window.moduleController.submitQuiz()">
          <i data-lucide="send"></i> Valider mes réponses
        </button>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons({ root: container });
  }

  selectAnswer(questionId, optionKey) {
    if (this.quizSubmitted) return;

    // Désélectionner les autres options
    QUIZ_QUESTIONS.find(q => q.id === questionId).options.forEach(opt => {
      const el = $(`#opt-${questionId}-${opt.key}`);
      if (el) el.classList.remove('selected');
    });

    // Sélectionner cette option
    const selected = $(`#opt-${questionId}-${optionKey}`);
    if (selected) selected.classList.add('selected');

    this.userAnswers[questionId] = optionKey;
  }

  submitQuiz() {
    const answered = Object.keys(this.userAnswers).length;
    if (answered < QUIZ_QUESTIONS.length) {
      toast.warning(`Répondez à toutes les questions (${answered}/${QUIZ_QUESTIONS.length})`);
      return;
    }

    this.quizSubmitted = true;
    let correct = 0;

    QUIZ_QUESTIONS.forEach(q => {
      const userAns = this.userAnswers[q.id];
      const isCorrect = userAns === q.correct;
      if (isCorrect) correct++;

      // Colorier les options
      q.options.forEach(opt => {
        const el = $(`#opt-${q.id}-${opt.key}`);
        if (!el) return;
        el.classList.add('disabled');
        if (opt.key === q.correct) el.classList.add('correct');
        else if (opt.key === userAns && !isCorrect) el.classList.add('wrong');
      });

      // Afficher explication
      const expl = $(`#expl-${q.id}`);
      if (expl) expl.classList.add('visible');
    });

    const pct = Math.round((correct / QUIZ_QUESTIONS.length) * 100);
    const pass = correct >= 4; // seuil 4/5

    // Afficher score
    const footer = $('#quizFooter');
    if (footer) footer.style.display = 'flex';

    const scoreVal = $('#quizScoreValue');
    if (scoreVal) {
      scoreVal.textContent = `${correct} / ${QUIZ_QUESTIONS.length} (${pct}%)`;
      scoreVal.className = pass ? 'quiz-score--pass' : 'quiz-score--fail';
    }

    // Bouton module suivant si réussi
    if (pass) {
      const nextBtn = $('#nextModuleBtn');
      if (nextBtn) nextBtn.style.display = 'flex';
      toast.success(`Bravo ! ${correct}/5 — Module 1 validé !`);
      this.saveProgression(pct, 'valide');
      markComplete('section-4', 's4');
    } else {
      toast.warning(`${correct}/5 — Seuil non atteint (4/5 requis). Réessayez !`);
      this.saveProgression(pct, 'termine');
    }

    // Cacher bouton submit
    const submitContainer = $('#submitBtn-container');
    if (submitContainer) submitContainer.style.display = 'none';
  }

  async saveProgression(pct, statut) {
    try {
      await storageService.saveProgression(this.profile.id, MODULE_CODE, {
        statut,
        score_pct:        pct,
        niveau_adaptatif: pct < 50 ? 'renforcement' : pct < 80 ? 'standard' : 'avance',
        completed_at:     statut === 'valide' ? new Date().toISOString() : null,
      });
      await storageService.checkAndAwardBadges(this.profile.id);
    } catch (e) { console.error('Progression save:', e); }
  }

  async loadProgression() {
    try {
      const prog = await storageService.getModuleProgression(this.profile.id, MODULE_CODE);
      if (prog?.statut === 'valide' || prog?.statut === 'termine') {
        // Déjà fait — afficher le score précédent
        const done = 4;
        const fill = $('#moduleProgressFill');
        const text = $('#moduleProgressText');
        if (fill) fill.style.width = '100%';
        if (text) text.textContent = `${done} / ${done}`;
      }
    } catch (e) { /* silencieux */ }
  }

  onSectionComplete(sectionId) {
    try {
      const done = document.querySelectorAll('.accordion-header__status--done').length;
      storageService.saveProgression(this.profile.id, MODULE_CODE, {
        statut: done < 4 ? 'en_cours' : 'termine',
        sections_completees: [sectionId],
        started_at: new Date().toISOString(),
      });
    } catch (e) { /* silencieux */ }
  }

  attachEvents() {
    $('#logoutBtn')?.addEventListener('click', async () => {
      await authService.logout();
      redirectTo('../../../index.html');
    });

    const mt = $('#menuToggle'), sb = $('#sidebar'), ov = $('#sidebarOverlay');
    if (mt && sb) {
      mt.addEventListener('click', () => { sb.classList.toggle('open'); ov?.classList.toggle('active'); });
      ov?.addEventListener('click', () => { sb.classList.remove('open'); ov.classList.remove('active'); });
    }
  }
}

// ── Fonctions globales pour le HTML ──
window.checkExercise = function() {
  if (!window.moduleController) return;
  const ctrl = window.moduleController;
  let correct = 0;

  EXERCISE_ITEMS.forEach(item => {
    const answer = ctrl.exerciseAnswers[item.id];
    const resultEl = document.querySelector(`.exercise-result-${item.id}`);
    if (!resultEl) return;

    if (!answer) {
      resultEl.textContent = '⬜ Non répondu';
      resultEl.style.color = 'var(--text-muted)';
    } else if (answer === item.correct) {
      resultEl.textContent = '✅ Correct';
      resultEl.style.color = 'var(--semantic-success)';
      correct++;
    } else {
      resultEl.textContent = `❌ → ${item.correct}`;
      resultEl.style.color = 'var(--semantic-danger)';
    }
  });

  const resultDiv = $('#exerciseResult');
  if (resultDiv) {
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <div style="padding:var(--space-4);background:${correct >= 5 ? 'var(--semantic-success-bg)' : 'var(--semantic-info-bg)'};border-radius:var(--radius-lg);">
        <strong>${correct} / ${EXERCISE_ITEMS.length} bons classements</strong>
        ${correct >= 5
          ? ' — Excellent ! Vous maîtrisez les familles de KPI.'
          : ' — Revoyez la capsule théorique pour consolider les familles.'}
      </div>
    `;
    const completeBtn = $('#completeS3Btn');
    if (completeBtn) completeBtn.style.display = 'flex';
  }
};

window.resetQuiz = function() {
  if (!window.moduleController) return;
  window.moduleController.userAnswers = {};
  window.moduleController.quizSubmitted = false;
  window.moduleController.renderQuiz();
  const footer = $('#quizFooter');
  if (footer) footer.style.display = 'none';
  if (typeof lucide !== 'undefined') lucide.createIcons();
};

new Module1Page();
