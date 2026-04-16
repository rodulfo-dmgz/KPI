/**
 * DASHBOA_RD — Module 4 ARH : Analyse RH & Décision
 */
import authService    from '../../../core/services/authService.js';
import storageService from '../../../core/services/storageService.js';
import { $, redirectTo, toast } from '../../../core/utils/utils.js';
import { getCohorteLabel }      from '../../../core/utils/messages.js';

const MODULE_CODE = 'M4';

const QUIZ_QUESTIONS = [
  {
    "id": 1,
    "text": "L'analyse prescriptive répond à la question :",
    "options": [
      {
        "key": "a",
        "text": "Que s'est-il passé ?"
      },
      {
        "key": "b",
        "text": "Pourquoi ?"
      },
      {
        "key": "c",
        "text": "Que va-t-il se passer ?"
      },
      {
        "key": "d",
        "text": "Que faire ?"
      }
    ],
    "correct": "d",
    "explanation": "Les 4 niveaux d'analyse : descriptif (que s'est-il passé ?), diagnostique (pourquoi ?), prédictif (que va-t-il se passer ?) et prescriptif (que faire ?)."
  },
  {
    "id": 2,
    "text": "La méthode des 5 Pourquoi sert à :",
    "options": [
      {
        "key": "a",
        "text": "Calculer 5 KPI simultanément"
      },
      {
        "key": "b",
        "text": "Identifier la cause racine d'un problème"
      },
      {
        "key": "c",
        "text": "Rédiger un rapport annuel"
      },
      {
        "key": "d",
        "text": "Classer les KPI par priorité"
      }
    ],
    "correct": "b",
    "explanation": "La méthode des 5 Pourquoi (Root Cause Analysis) consiste à se poser la question 'Pourquoi ?' de manière répétée jusqu'à identifier la cause fondamentale d'un problème."
  },
  {
    "id": 3,
    "text": "Turnover élevé + formation sous-réalisée signale :",
    "options": [
      {
        "key": "a",
        "text": "Un problème de paie"
      },
      {
        "key": "b",
        "text": "Un risque de perte de compétences non remplacées"
      },
      {
        "key": "c",
        "text": "Un bon climat social"
      },
      {
        "key": "d",
        "text": "Une stratégie de recrutement efficace"
      }
    ],
    "correct": "b",
    "explanation": "La combinaison de ces deux signaux indique que des compétences quittent l'entreprise et que le plan de formation ne compense pas ces départs."
  },
  {
    "id": 4,
    "text": "Une note d'analyse RH doit prioritairement contenir :",
    "options": [
      {
        "key": "a",
        "text": "Tous les KPI disponibles"
      },
      {
        "key": "b",
        "text": "Des recommandations actionnables"
      },
      {
        "key": "c",
        "text": "Le détail des calculs"
      },
      {
        "key": "d",
        "text": "Les données personnelles des salariés"
      }
    ],
    "correct": "b",
    "explanation": "Une note d'analyse RH efficace va au-delà des chiffres : elle propose des actions concrètes, priorisées et chiffrées pour aider la direction à décider."
  },
  {
    "id": 5,
    "text": "Un KPI 'orange' dans le système RAG indique :",
    "options": [
      {
        "key": "a",
        "text": "Excellent"
      },
      {
        "key": "b",
        "text": "Hors cible critique"
      },
      {
        "key": "c",
        "text": "À surveiller, risque de dérive"
      },
      {
        "key": "d",
        "text": "Donnée manquante"
      }
    ],
    "correct": "c",
    "explanation": "Dans le système RAG : Vert = dans la cible, Orange/Ambre = légèrement hors cible mais pas critique (à surveiller), Rouge = hors cible significatif (action requise)."
  }
];

const MODULE_OBJECTIVE = "Interpréter un KPI en contexte et formuler des recommandations RH argumentées.";

class Module4Page {
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
              <div class="content-block__title">Concepts clés — ${'Analyse RH & Décision'}</div>
            </div>
            <div class="course-body" id="theorieContent">
              <p>Consultez le référentiel pédagogique complet dans le fichier
                <code>FORMATION_ARH_CONTENU.md</code> à la section MODULE 4.</p>
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
              <div class="content-block__title">Mission NeoCorp — Module 4</div>
            </div>
            <p style="font-size:var(--font-body2-size);color:var(--text-secondary);margin-bottom:var(--space-4);">
              Consultez le référentiel pédagogique (section MODULE 4 — Cas pratique NeoCorp)
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
                <div class="quiz-wrapper__title">Auto-évaluation Module 4</div>
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
    if (pass) { toast.success(`Bravo ! ${correct}/5 — Module 4 validé !`); this.saveProgression(pct, 'valide'); markComplete('section-4', 's4'); }
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

new Module4Page();
