/**
 * DASHBOA_RD — Diagnostic Initial ARH
 * 10 questions · Logique adaptative · Sauvegarde niveau en BDD
 */
import authService    from '../../core/services/authService.js';
import storageService from '../../core/services/storageService.js';
import { $, redirectTo, toast } from '../../core/utils/utils.js';
import { getCohorteLabel }      from '../../core/utils/messages.js';
import { NIVEAUX }              from '../../core/config/constants.js';

const QUESTIONS = [
  {
    id: 1,
    text: "Qu'est-ce qu'un KPI ?",
    options: [
      { key: 'a', text: 'Un logiciel RH' },
      { key: 'b', text: 'Un indicateur clé de performance' },
      { key: 'c', text: 'Un contrat de travail' },
      { key: 'd', text: 'Un outil de paie' },
    ],
    correct: 'b',
  },
  {
    id: 2,
    text: "NeoCorp a recruté 12 personnes en 6 mois et en a perdu 4. Quel est le taux de turnover approximatif sur la période ?",
    options: [
      { key: 'a', text: '12%' },
      { key: 'b', text: '33%' },
      { key: 'c', text: '25%' },
      { key: 'd', text: '50%' },
    ],
    correct: 'b',
  },
  {
    id: 3,
    text: "Lequel de ces KPI mesure l'efficacité du recrutement ?",
    options: [
      { key: 'a', text: "Taux d'absentéisme" },
      { key: 'b', text: 'Délai moyen de recrutement' },
      { key: 'c', text: 'Masse salariale' },
      { key: 'd', text: 'Taux de formation' },
    ],
    correct: 'b',
  },
  {
    id: 4,
    text: "Une équipe de 50 personnes génère 110 jours d'absence en 1 mois (22 jours ouvrés). Quel est le taux d'absentéisme ?",
    options: [
      { key: 'a', text: '10%' },
      { key: 'b', text: '2,2%' },
      { key: 'c', text: '10% (110/50×22 × 100)' },
      { key: 'd', text: '5%' },
    ],
    correct: 'b',
  },
  {
    id: 5,
    text: "Sur un tableau de bord RH, un indicateur rouge signifie :",
    options: [
      { key: 'a', text: 'Excellent résultat' },
      { key: 'b', text: 'Résultat à surveiller' },
      { key: 'c', text: 'Résultat hors cible, action requise' },
      { key: 'd', text: 'Données manquantes' },
    ],
    correct: 'c',
  },
  {
    id: 6,
    text: "La masse salariale représente 45% du CA. Que faut-il faire ?",
    options: [
      { key: 'a', text: "C'est toujours trop élevé" },
      { key: 'b', text: 'Comparer au secteur et aux années précédentes' },
      { key: 'c', text: "C'est un indicateur social" },
      { key: 'd', text: 'Ne rien faire, ce ratio est toujours acceptable' },
    ],
    correct: 'b',
  },
  {
    id: 7,
    text: "Dans Excel, quelle fonction permet de calculer une ancienneté en années ?",
    options: [
      { key: 'a', text: '=YEAR()' },
      { key: 'b', text: '=DATEDIF()' },
      { key: 'c', text: '=DATE()' },
      { key: 'd', text: '=NOW()' },
    ],
    correct: 'b',
  },
  {
    id: 8,
    text: "Le taux de réalisation des entretiens annuels = ?",
    options: [
      { key: 'a', text: 'Nombre entretiens / Effectif total × 100' },
      { key: 'b', text: 'Durée des entretiens / 12' },
      { key: 'c', text: 'Budget formation / Masse salariale' },
      { key: 'd', text: 'Nombre de managers / Effectif' },
    ],
    correct: 'a',
  },
  {
    id: 9,
    text: "Chez NeoCorp, le taux d'absentéisme grimpe chaque lundi. Que proposez-vous en priorité ?",
    options: [
      { key: 'a', text: "Rien, c'est normal" },
      { key: 'b', text: 'Analyser les causes par service et proposer un plan d\'action' },
      { key: 'c', text: 'Supprimer les lundis' },
      { key: 'd', text: 'Augmenter les salaires' },
    ],
    correct: 'b',
  },
  {
    id: 10,
    text: "Un tableau de bord RH efficace doit contenir :",
    options: [
      { key: 'a', text: 'Tous les KPI existants' },
      { key: 'b', text: 'Les KPI alignés sur la stratégie de l\'entreprise (5–8 max)' },
      { key: 'c', text: 'Uniquement des chiffres financiers' },
      { key: 'd', text: 'Les données personnelles des salariés' },
    ],
    correct: 'b',
  },
];

class DiagnosticPage {
  constructor() {
    this.profile = null;
    this.currentQ = 0;
    this.answers  = {};
    this.init();
  }

  async init() {
    try {
      const session = await authService.getSession();
      if (!session) { redirectTo('../../index.html'); return; }
      this.profile = await authService.getProfile();
      if (!this.profile) { redirectTo('../../index.html'); return; }

      this.renderUser();
      this.attachEvents();
      window.diagController = this;
    } catch (e) { console.error(e); }
  }

  renderUser() {
    const { prenom, nom, cohorte } = this.profile;
    const a = $('#userAvatar'); if (a) a.textContent = `${prenom[0]}${nom[0]}`;
    const n = $('#userName');   if (n) n.textContent = `${prenom} ${nom}`;
    const r = $('#userRole');   if (r) r.textContent = getCohorteLabel(cohorte);
  }

  startDiagnostic() {
    $('#diagnosticIntro').style.display = 'none';
    $('#diagnosticQuiz').style.display  = 'block';
    this.renderQuestion(0);
  }

  renderQuestion(index) {
    const q   = QUESTIONS[index];
    const pct = Math.round(((index + 1) / QUESTIONS.length) * 100);

    const fill  = $('#diagProgressFill');
    const count = $('#diagProgressCount');
    if (fill)  fill.style.width = `${pct}%`;
    if (count) count.textContent = `${index + 1} / ${QUESTIONS.length}`;

    const container = $('#diagQuestionContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="diagnostic-question animate-fade-up">
        <div class="diagnostic-question__num">QUESTION ${index + 1} / ${QUESTIONS.length}</div>
        <div class="diagnostic-question__text">${q.text}</div>
        <div class="quiz-options">
          ${q.options.map(opt => `
            <div class="quiz-option" id="diag-opt-${q.id}-${opt.key}"
              onclick="window.diagController.selectAnswer(${q.id}, '${opt.key}')">
              <div class="quiz-option__marker">${opt.key.toUpperCase()}</div>
              <span>${opt.text}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Réinitialiser le bouton
    const btn = $('#diagNextBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = index < QUESTIONS.length - 1
        ? 'Question suivante <i data-lucide="arrow-right"></i>'
        : 'Voir mes résultats <i data-lucide="check-circle"></i>';
    }

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: container });
    if (typeof lucide !== 'undefined') lucide.createIcons({ root: btn });
  }

  selectAnswer(questionId, optionKey) {
    // Désélectionner
    QUESTIONS.find(q => q.id === questionId)?.options.forEach(opt => {
      const el = $(`#diag-opt-${questionId}-${opt.key}`);
      if (el) el.classList.remove('selected');
    });

    // Sélectionner
    const el = $(`#diag-opt-${questionId}-${optionKey}`);
    if (el) el.classList.add('selected');

    this.answers[questionId] = optionKey;

    const btn = $('#diagNextBtn');
    if (btn) btn.disabled = false;
  }

  nextQuestion() {
    const q = QUESTIONS[this.currentQ];
    if (!this.answers[q.id]) {
      toast.warning('Veuillez sélectionner une réponse.');
      return;
    }

    this.currentQ++;

    if (this.currentQ >= QUESTIONS.length) {
      this.showResult();
    } else {
      this.renderQuestion(this.currentQ);
    }
  }

  async showResult() {
    // Calculer le score
    let correct = 0;
    QUESTIONS.forEach(q => { if (this.answers[q.id] === q.correct) correct++; });
    const pct = Math.round((correct / QUESTIONS.length) * 100);

    // Déterminer le niveau
    let niveau, niveauLabel, niveauClass, niveauDesc;
    if (pct < 50) {
      niveau = NIVEAUX.DEBUTANT;
      niveauLabel = '🟦 Niveau Débutant';
      niveauClass = 'diagnostic-result--debutant';
      niveauDesc  = 'Tous les modules sont activés avec des contenus de renforcement pour vous accompagner pas à pas. Ne vous inquiétez pas, tout le monde commence quelque part !';
    } else if (pct < 80) {
      niveau = NIVEAUX.STANDARD;
      niveauLabel = '🟨 Niveau Standard';
      niveauClass = 'diagnostic-result--standard';
      niveauDesc  = 'Vous avez de bonnes bases. Votre parcours est adapté au niveau intermédiaire avec des cas pratiques progressifs.';
    } else {
      niveau = NIVEAUX.AVANCE;
      niveauLabel = '🟩 Niveau Avancé';
      niveauClass = 'diagnostic-result--avance';
      niveauDesc  = 'Excellentes connaissances ! Des cas avancés sont débloqués dans chaque module pour approfondir votre expertise.';
    }

    // Sauvegarder en BDD
    try {
      await authService.updateUser(this.profile.id, {
        niveau_adaptatif: niveau,
        score_diagnostic: correct,
      });
      await storageService.saveProgression(this.profile.id, 'DIAGNOSTIC', {
        statut:           'valide',
        score_pct:        pct,
        niveau_adaptatif: niveau,
        completed_at:     new Date().toISOString(),
      });
    } catch (e) { console.error('Sauvegarde diagnostic:', e); }

    // Afficher le résultat
    $('#diagnosticQuiz').style.display  = 'none';
    const resultEl = $('#diagnosticResult');
    if (!resultEl) return;

    resultEl.innerHTML = `
      <div class="diagnostic-result ${niveauClass} animate-fade-scale">
        <div class="diagnostic-result__score">${correct} / 10</div>
        <div class="diagnostic-result__label">Score diagnostic</div>
        <div class="diagnostic-result__niveau diagnostic-result__niveau--${niveau.toLowerCase()}">
          ${niveauLabel}
        </div>
        <p class="diagnostic-result__text">${niveauDesc}</p>

        <div style="display:flex;gap:var(--space-4);justify-content:center;flex-wrap:wrap;">
          <a href="module-1/index.html" class="btn btn-cta btn-lg">
            <i data-lucide="play"></i> Commencer le Module 1
          </a>
          <a href="index.html" class="btn btn-ghost">
            <i data-lucide="layout-grid"></i> Vue d'ensemble
          </a>
        </div>

        <div style="margin-top:var(--space-8);padding:var(--space-5);background:var(--surface-subtle);border-radius:var(--radius-xl);">
          <div style="font-family:var(--font-mono);font-size:0.6875rem;color:var(--text-muted);
            text-transform:uppercase;letter-spacing:0.04em;margin-bottom:var(--space-3);">
            Détail des réponses
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:var(--space-2);">
            ${QUESTIONS.map(q => {
              const ok = this.answers[q.id] === q.correct;
              return `<div style="padding:var(--space-2) var(--space-3);border-radius:var(--radius-md);
                background:${ok ? 'var(--semantic-success-bg)' : 'var(--semantic-danger-bg)'};
                font-size:var(--font-caption-size);
                color:${ok ? 'var(--text-success)' : 'var(--text-danger)'};">
                Q${q.id} ${ok ? '✅' : '❌'}
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    resultEl.style.display = 'block';
    if (typeof lucide !== 'undefined') lucide.createIcons({ root: resultEl });
  }

  attachEvents() {
    $('#logoutBtn')?.addEventListener('click', async () => {
      await authService.logout(); redirectTo('../../index.html');
    });
    const mt = $('#menuToggle'), sb = $('#sidebar'), ov = $('#sidebarOverlay');
    if (mt && sb) {
      mt.addEventListener('click', () => { sb.classList.toggle('open'); ov?.classList.toggle('active'); });
      ov?.addEventListener('click', () => { sb.classList.remove('open'); ov.classList.remove('active'); });
    }
  }
}

new DiagnosticPage();
