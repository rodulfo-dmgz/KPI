/**
 * DASHBOA_RD — Module 7 ARH : KPI par métier RH
 */
import authService    from '../../../core/services/authService.js';
import storageService from '../../../core/services/storageService.js';
import { $, redirectTo, toast } from '../../../core/utils/utils.js';
import { getCohorteLabel }      from '../../../core/utils/messages.js';

const MODULE_CODE = 'M7';

const QUIZ_QUESTIONS = [
  {
    "id": 1,
    "text": "L'eNPS (Employee Net Promoter Score) mesure :",
    "options": [
      {
        "key": "a",
        "text": "L'efficacité du recrutement"
      },
      {
        "key": "b",
        "text": "L'engagement et la fidélité des salariés"
      },
      {
        "key": "c",
        "text": "Le taux de formation"
      },
      {
        "key": "d",
        "text": "La masse salariale"
      }
    ],
    "correct": "b",
    "explanation": "L'eNPS mesure la probabilité que les salariés recommandent leur entreprise comme employeur. Score = % Promoteurs - % Détracteurs. Un eNPS > 30 est considéré comme excellent."
  },
  {
    "id": 2,
    "text": "Un taux d'erreur paie de 3% est :",
    "options": [
      {
        "key": "a",
        "text": "Acceptable en PME"
      },
      {
        "key": "b",
        "text": "Dans la norme"
      },
      {
        "key": "c",
        "text": "Trop élevé, cible < 1%"
      },
      {
        "key": "d",
        "text": "Impossible à calculer"
      }
    ],
    "correct": "c",
    "explanation": "La cible standard pour le taux d'erreur paie est inférieure à 1%. Un taux de 3% signifie 3 bulletins erronés sur 100, ce qui entraîne des corrections, des mécontentements salariés et des risques URSSAF."
  },
  {
    "id": 3,
    "text": "Pour un manager de service, le tableau de bord RH doit contenir :",
    "options": [
      {
        "key": "a",
        "text": "Tous les KPI de l'entreprise"
      },
      {
        "key": "b",
        "text": "Uniquement les KPI de son périmètre"
      },
      {
        "key": "c",
        "text": "Les données de paie de son équipe"
      },
      {
        "key": "d",
        "text": "Le bilan social complet"
      }
    ],
    "correct": "b",
    "explanation": "Chaque tableau de bord doit être adapté à son audience. Un manager n'a besoin que des KPI de son service : absentéisme, entretiens réalisés, formations de son équipe."
  },
  {
    "id": 4,
    "text": "Le ROI formation est difficile à calculer car :",
    "options": [
      {
        "key": "a",
        "text": "Excel ne peut pas le calculer"
      },
      {
        "key": "b",
        "text": "Les bénéfices sont souvent immatériels et décalés dans le temps"
      },
      {
        "key": "c",
        "text": "Il n'existe pas de formule"
      },
      {
        "key": "d",
        "text": "C'est réservé aux grandes entreprises"
      }
    ],
    "correct": "b",
    "explanation": "Le ROI de la formation est complexe car les bénéfices (montée en compétences, réduction des erreurs, amélioration de la qualité) sont difficiles à quantifier et se manifestent sur le long terme."
  },
  {
    "id": 5,
    "text": "La masse salariale à 55% du CA chez NeoCorp est :",
    "options": [
      {
        "key": "a",
        "text": "Normal dans tous les secteurs"
      },
      {
        "key": "b",
        "text": "Élevé, nécessite une analyse et un plan de maîtrise"
      },
      {
        "key": "c",
        "text": "Excellent, signe de bonne gestion"
      },
      {
        "key": "d",
        "text": "Un indicateur non pertinent"
      }
    ],
    "correct": "b",
    "explanation": "La masse salariale représente en moyenne 25-40% du CA selon les secteurs. A 55%, NeoCorp est au-dessus des normes de la plupart des secteurs industriels ou technologiques. Un plan de maîtrise s'impose."
  }
];

const MODULE_OBJECTIVE = "Adapter les indicateurs aux différentes fonctions RH et construire une vision globale.";

class Module7Page {
  constructor() {
    this.profile = null;
    this.userAnswers = {};
    this.quizSubmitted = false;
    this.init();
  }

  async init() {
    try {
      const session = await authService.getSession();
      if (!session) { redirectTo('../../../index.html'); return; }
      this.profile = await authService.getProfile();
      if (!this.profile) { redirectTo('../../../index.html'); return; }

      this.renderUser();
      this.renderContent();
      await this.loadProgression();
      this.attachEvents();
      window.moduleController = this;
    } catch (e) { console.error(e); }
  }

  renderUser() {
    const { prenom, nom, cohorte } = this.profile;
    const a = $('#userAvatar'); if (a) a.textContent = `${prenom[0]}${nom[0]}`;
    const n = $('#userName');   if (n) n.textContent = `${prenom} ${nom}`;
    const r = $('#userRole');   if (r) r.textContent = getCohorteLabel(cohorte);
    const obj = $('#moduleObjective'); if (obj) obj.textContent = MODULE_OBJECTIVE;
  }

  renderContent() {
    const container = $('#moduleContent');
    if (!container) return;

    container.innerHTML = `
      <!-- Section 1 : Storytelling -->
      <div class="accordion-section open" id="section-1">
        <div class="accordion-header" onclick="toggleAccordion('section-1')">
          <div class="accordion-header__icon accordion-header__icon--primary">
            <i data-lucide="film"></i>
          </div>
          <div class="accordion-header__text">
            <div class="accordion-header__title">🎬 Mise en situation — NeoCorp</div>
            <div class="accordion-header__subtitle">STORYTELLING · 5 min</div>
          </div>
          <span class="accordion-header__status accordion-header__status--pending" id="status-s1">
            <i data-lucide="circle"></i> À faire
          </span>
          <div class="accordion-header__toggle"><i data-lucide="chevron-down"></i></div>
        </div>
        <div class="accordion-body">
          <div class="storytelling-banner">
            <div class="storytelling-banner__label">Mise en situation</div>
            <p class="storytelling-banner__text">
              Sophie continue sa mission chez <strong>NeoCorp</strong>. Dans ce module, elle s'attaque à :
              <em>"${MODULE_OBJECTIVE}"</em>
              Suivez-la dans cette nouvelle étape de son pilotage RH.
            </p>
          </div>
          <div class="section-complete-bar">
            <button class="btn-section-complete" onclick="markComplete('section-1', 's1')">
              <i data-lucide="check"></i> Section lue
            </button>
          </div>
        </div>
      </div>

      <!-- Section 2 : Théorie -->
      <div class="accordion-section" id="section-2">
        <div class="accordion-header" onclick="toggleAccordion('section-2')">
          <div class="accordion-header__icon accordion-header__icon--cta">
            <i data-lucide="book-open"></i>
          </div>
          <div class="accordion-header__text">
            <div class="accordion-header__title">📚 Capsule théorique</div>
            <div class="accordion-header__subtitle">CONTENU · 8-10 min</div>
          </div>
          <span class="accordion-header__status accordion-header__status--pending" id="status-s2">
            <i data-lucide="circle"></i> À faire
          </span>
          <div class="accordion-header__toggle"><i data-lucide="chevron-down"></i></div>
        </div>
        <div class="accordion-body">
          <div class="content-block">
            <div class="content-block__header">
              <div class="content-block__icon content-block__icon--theory">
                <i data-lucide="book-open"></i>
              </div>
              <div class="content-block__title">Concepts clés — ${'KPI par métier RH'}</div>
            </div>
            <div class="course-body" id="theorieContent">
              <p>Consultez le référentiel pédagogique complet dans le fichier
                <code>FORMATION_ARH_CONTENU.md</code> à la section MODULE 7.</p>
              <p>Ce module couvre : <strong>${MODULE_OBJECTIVE}</strong></p>
            </div>
          </div>
          <div class="section-complete-bar">
            <button class="btn-section-complete" onclick="markComplete('section-2', 's2')">
              <i data-lucide="check"></i> Section lue
            </button>
          </div>
        </div>
      </div>

      <!-- Section 3 : Cas pratique NeoCorp -->
      <div class="accordion-section" id="section-3">
        <div class="accordion-header" onclick="toggleAccordion('section-3')">
          <div class="accordion-header__icon accordion-header__icon--secondary">
            <i data-lucide="briefcase"></i>
          </div>
          <div class="accordion-header__text">
            <div class="accordion-header__title">💼 Cas pratique NeoCorp</div>
            <div class="accordion-header__subtitle">APPLICATION MÉTIER · 20 min</div>
          </div>
          <span class="accordion-header__status accordion-header__status--pending" id="status-s3">
            <i data-lucide="circle"></i> À faire
          </span>
          <div class="accordion-header__toggle"><i data-lucide="chevron-down"></i></div>
        </div>
        <div class="accordion-body">
          <div class="content-block">
            <div class="content-block__header">
              <div class="content-block__icon content-block__icon--case">
                <i data-lucide="building-2"></i>
              </div>
              <div class="content-block__title">Mission NeoCorp — Module 7</div>
            </div>
            <p style="font-size:var(--font-body2-size);color:var(--text-secondary);margin-bottom:var(--space-4);">
              Consultez le référentiel pédagogique (section MODULE 7 — Cas pratique NeoCorp)
              pour les données et la mission complète. Réalisez le travail demandé avant de passer à l'auto-évaluation.
            </p>
            <div class="formula-box">
              <div class="formula-box__title">Rappel objectif</div>
              ${MODULE_OBJECTIVE}
            </div>
          </div>
          <div class="section-complete-bar">
            <button class="btn-section-complete" onclick="markComplete('section-3', 's3')">
              <i data-lucide="check"></i> Cas pratique réalisé
            </button>
          </div>
        </div>
      </div>

      <!-- Section 4 : Quiz -->
      <div class="accordion-section" id="section-4">
        <div class="accordion-header" onclick="toggleAccordion('section-4')">
          <div class="accordion-header__icon accordion-header__icon--info">
            <i data-lucide="help-circle"></i>
          </div>
          <div class="accordion-header__text">
            <div class="accordion-header__title">✅ Auto-évaluation — 5 questions QCM</div>
            <div class="accordion-header__subtitle">QUIZ · 10 min · Seuil : 4/5</div>
          </div>
          <span class="accordion-header__status accordion-header__status--pending" id="status-s4">
            <i data-lucide="circle"></i> À faire
          </span>
          <div class="accordion-header__toggle"><i data-lucide="chevron-down"></i></div>
        </div>
        <div class="accordion-body">
          <div class="quiz-wrapper">
            <div class="quiz-wrapper__header">
              <div class="quiz-wrapper__icon"><i data-lucide="brain"></i></div>
              <div>
                <div class="quiz-wrapper__title">Auto-évaluation Module 7</div>
                <div class="quiz-wrapper__subtitle">5 QUESTIONS</div>
              </div>
            </div>
            <div id="quizContainer"></div>
            <div class="quiz-footer" id="quizFooter" style="display:none;">
              <div class="quiz-score" id="quizScore">
                <span class="quiz-score__label">Votre score</span>
                <span id="quizScoreValue">—</span>
              </div>
              <div style="display:flex;gap:var(--space-3);">
                <button class="btn btn-ghost" onclick="window.moduleController.resetQuiz()">
                  <i data-lucide="refresh-cw"></i> Recommencer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: container });
    this.renderQuiz();
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
    `).join('') + `
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
    QUIZ_QUESTIONS.find(q => q.id === questionId).options.forEach(opt => {
      const el = $(`#opt-${questionId}-${opt.key}`);
      if (el) el.classList.remove('selected');
    });
    const sel = $(`#opt-${questionId}-${optionKey}`);
    if (sel) sel.classList.add('selected');
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
      const isCorrect = this.userAnswers[q.id] === q.correct;
      if (isCorrect) correct++;
      q.options.forEach(opt => {
        const el = $(`#opt-${q.id}-${opt.key}`);
        if (!el) return;
        el.classList.add('disabled');
        if (opt.key === q.correct) el.classList.add('correct');
        else if (opt.key === this.userAnswers[q.id] && !isCorrect) el.classList.add('wrong');
      });
      const expl = $(`#expl-${q.id}`);
      if (expl) expl.classList.add('visible');
    });
    const pct  = Math.round((correct / QUIZ_QUESTIONS.length) * 100);
    const pass = correct >= 4;
    const footer = $('#quizFooter');
    if (footer) footer.style.display = 'flex';
    const scoreVal = $('#quizScoreValue');
    if (scoreVal) { scoreVal.textContent = `${correct} / ${QUIZ_QUESTIONS.length} (${pct}%)`; scoreVal.className = pass ? 'quiz-score--pass' : 'quiz-score--fail'; }
    if (pass) { toast.success(`Bravo ! ${correct}/5 — Module 7 validé !`); this.saveProgression(pct, 'valide'); markComplete('section-4', 's4'); }
    else { toast.warning(`${correct}/5 — Seuil non atteint (4/5 requis). Réessayez !`); this.saveProgression(pct, 'termine'); }
    const sub = $('#submitBtn-container'); if (sub) sub.style.display = 'none';
  }

  resetQuiz() {
    this.userAnswers = {}; this.quizSubmitted = false; this.renderQuiz();
    const footer = $('#quizFooter'); if (footer) footer.style.display = 'none';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  async saveProgression(pct, statut) {
    try {
      await storageService.saveProgression(this.profile.id, MODULE_CODE, {
        statut, score_pct: pct,
        niveau_adaptatif: pct < 50 ? 'renforcement' : pct < 80 ? 'standard' : 'avance',
        completed_at: statut === 'valide' ? new Date().toISOString() : null,
      });
      await storageService.checkAndAwardBadges(this.profile.id);
    } catch (e) { console.error('Progression:', e); }
  }

  async loadProgression() {
    try {
      const prog = await storageService.getModuleProgression(this.profile.id, MODULE_CODE);
      if (prog?.score_pct != null) {
        // Afficher score précédent dans l'en-tête si déjà fait
      }
    } catch (e) { /* silencieux */ }
  }

  onSectionComplete(sectionId) {
    try {
      storageService.saveProgression(this.profile.id, MODULE_CODE, {
        statut: 'en_cours', started_at: new Date().toISOString(),
      });
    } catch (e) { /* silencieux */ }
  }

  attachEvents() {
    $('#logoutBtn')?.addEventListener('click', async () => { await authService.logout(); redirectTo('../../../index.html'); });
    const mt = $('#menuToggle'), sb = $('#sidebar'), ov = $('#sidebarOverlay');
    if (mt && sb) {
      mt.addEventListener('click', () => { sb.classList.toggle('open'); ov?.classList.toggle('active'); });
      ov?.addEventListener('click', () => { sb.classList.remove('open'); ov.classList.remove('active'); });
    }
  }
}

new Module7Page();
