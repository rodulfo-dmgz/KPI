/**
 * DASHBOA_RD — Module 2 ARH : Identifier les KPI RH
 */
import authService    from '../../../core/services/authService.js';
import storageService from '../../../core/services/storageService.js';
import { $, redirectTo, toast } from '../../../core/utils/utils.js';
import { getCohorteLabel }      from '../../../core/utils/messages.js';

const MODULE_CODE = 'M2';

const QUIZ_QUESTIONS = [
  {
    "id": 1,
    "text": "Combien de KPI maximum recommande-t-on par tableau de bord ?",
    "options": [
      {
        "key": "a",
        "text": "2-3"
      },
      {
        "key": "b",
        "text": "5-8"
      },
      {
        "key": "c",
        "text": "15-20"
      },
      {
        "key": "d",
        "text": "Autant que possible"
      }
    ],
    "correct": "b",
    "explanation": "La loi de Miller recommande de limiter les tableaux de bord à 5-8 KPI pour éviter la surcharge cognitive et rester décisionnel."
  },
  {
    "id": 2,
    "text": "L'index égalité H/F est un KPI :",
    "options": [
      {
        "key": "a",
        "text": "Stratégique"
      },
      {
        "key": "b",
        "text": "Opérationnel"
      },
      {
        "key": "c",
        "text": "Réglementaire"
      },
      {
        "key": "d",
        "text": "Financier"
      }
    ],
    "correct": "c",
    "explanation": "L'index égalité professionnelle H/F est une obligation légale pour les entreprises de +50 salariés. C'est donc un KPI réglementaire."
  },
  {
    "id": 3,
    "text": "Pour choisir un KPI, la première question est :",
    "options": [
      {
        "key": "a",
        "text": "Quel logiciel utilise-t-on ?"
      },
      {
        "key": "b",
        "text": "Quels sont les enjeux stratégiques ?"
      },
      {
        "key": "c",
        "text": "Combien coûte la collecte ?"
      },
      {
        "key": "d",
        "text": "Qui va le présenter ?"
      }
    ],
    "correct": "b",
    "explanation": "Les KPI doivent être alignés sur la stratégie de l'entreprise. Sans enjeux clairement définis, il est impossible de savoir quoi mesurer."
  },
  {
    "id": 4,
    "text": "Un KPI sans cible est :",
    "options": [
      {
        "key": "a",
        "text": "Suffisant si la donnée est récente"
      },
      {
        "key": "b",
        "text": "Impossible à interpréter"
      },
      {
        "key": "c",
        "text": "Réservé aux grandes entreprises"
      },
      {
        "key": "d",
        "text": "Un indicateur de tendance valable"
      }
    ],
    "correct": "b",
    "explanation": "Sans cible de référence, un chiffre isolé ne permet pas de savoir s'il est bon ou mauvais. La cible donne le sens à l'indicateur."
  },
  {
    "id": 5,
    "text": "Le taux de réalisation des entretiens annuels est un KPI :",
    "options": [
      {
        "key": "a",
        "text": "Financier"
      },
      {
        "key": "b",
        "text": "Opérationnel RH"
      },
      {
        "key": "c",
        "text": "Réglementaire obligatoire"
      },
      {
        "key": "d",
        "text": "Commercial"
      }
    ],
    "correct": "b",
    "explanation": "Le taux de réalisation des entretiens est un KPI opérationnel RH qui mesure l'activité managériale et le respect du processus RH."
  }
];

const MODULE_OBJECTIVE = "Sélectionner les KPI pertinents selon le contexte et la stratégie de l'entreprise.";

class Module2Page {
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

                <!-- SECTION 0 : KPIS -->
               <div class="video-block">
                            <div class="video-block__label video-block__label--youtube">
                                <i data-lucide="youtube"></i>
                                CONSTRUIRE LES INDICATEURS DE PERFORMANCE · 5:57 min
                            </div>
                            <div class="video-responsive">
                                <iframe
                                    src="https://www.youtube.com/embed/TJR5xsR1mxc?rel=0&modestbranding=1"
                                    title="Introduction aux KPI RH"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen loading="lazy">
                                </iframe>
                            </div>
                            <p class="video-block__caption">Des données à la destination</p>
                        </div>
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
              <div class="content-block__title">Concepts clés — ${'Identifier les KPI RH'}</div>
            </div>
            <div class="course-body" id="theorieContent">
              <p>Consultez le référentiel pédagogique complet dans le fichier
                <code>FORMATION_ARH_CONTENU.md</code> à la section MODULE 2.</p>
              <p>Ce module couvre : <strong>${MODULE_OBJECTIVE}</strong></p>
            </div>
          </div>

          <a href="https://docs.google.com/spreadsheets/d/1LzE3xwcl-tl1f4hW6KaclR2jlxw4Tp-x0_IjiAd2ehM/export?format=xlsx" target="_blank" rel="noopener noreferrer"
            class="external-link-block">
              <span class="external-link-block__icon">📰</span>
              <div class="external-link-block__text">
                  <div class="external-link-block__title">KPI.xlsx</div>
                  <div class="external-link-block__url">Google Drive</div>
              </div>
              <i data-lucide="file-spreadsheet" class="arrow"></i>
          </a>

                    <a href="https://drive.google.com/uc?export=download&id=1LIVfR0ckhKE8VAzekpzaoZvTiPngXnb4" target="_blank" rel="noopener noreferrer"
            class="external-link-block">
              <span class="external-link-block__icon">📄</span>
              <div class="external-link-block__text">
                  <div class="external-link-block__title">KPI - ARH.pdf</div>
                  <div class="external-link-block__url">Google Drive</div>
              </div>
              <i data-lucide="file-text" class="arrow"></i>
          </a>

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
        <div class="content-block__title">Mission NeoCorp — Module 2</div>
      </div>
      
      <!-- Énoncé du cas pratique -->
      <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
        <h3 style="margin-top: 0; margin-bottom: 1rem; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
          <i data-lucide="clipboard-list" style="width: 20px; height: 20px;"></i>
          Aidez Sophie à calculer ses 5 premiers KPI RH
        </h3>
        <p style="font-size: 1rem; line-height: 1.6; color: #334155; margin-bottom: 1rem;">
          <strong>Énoncé :</strong> C'est le grand jour. Sophie a rassemblé ses fichiers Excel, son export SIRH et ses notes d'emails. 
          La DRH lui a demandé de présenter <strong>5 indicateurs clés</strong> pour le Comité de Direction de jeudi.
        </p>
        <p style="font-size: 1rem; line-height: 1.6; color: #334155; margin-bottom: 1rem;">
          Pour ne pas se perdre, elle décide de se concentrer sur les 5 KPI suivants issus du référentiel officiel (qu'elle a imprimé en PDF) :
        </p>
        <ol style="margin-bottom: 1rem; padding-left: 1.5rem;">
          <li><strong>Effectif Total (ETP)</strong> — Base de tout calcul.</li>
          <li><strong>Âge Moyen</strong> — Pour anticiper les départs.</li>
          <li><strong>Taux de Turnover</strong> — Le voyant d'alarme social.</li>
          <li><strong>Taux d'Absentéisme</strong> — Le signal de la charge de travail.</li>
          <li><strong>Taux de Salariés Formés</strong> — L'investissement dans les compétences.</li>
        </ol>
        <p style="font-size: 1rem; line-height: 1.6; color: #334155; font-weight: 500;">
          📋 Votre Mission : À partir des données ci-dessous, réalisez les calculs pour Sophie.
        </p>

          <a href="https://drive.google.com/uc?export=download&id=10zypqbbc50cLR10bxp8lypLRwETTGhkg" target="_blank" rel="noopener noreferrer"
            class="external-link-block">
              <span class="external-link-block__icon">📄</span>
              <div class="external-link-block__text">
                  <div class="external-link-block__title">Cas Pratique - NeoCorp.pdf</div>
                  <div class="external-link-block__url">Google Drive</div>
              </div>
              <i data-lucide="file-text" class="arrow"></i>
          </a>
      </div>


      <!-- Tableaux de données -->
      <div style="margin-bottom: 1.5rem;">
        <h4 style="margin: 1.5rem 0 1rem 0; font-size: 1.1rem;">📊 Les Données de NeoCorp (Extrait au 31/03/2024)</h4>
        
        <!-- Tableau A : Effectif Global -->
        <div style="margin-bottom: 1.5rem; overflow-x: auto;">
          <p style="font-weight: 600; margin-bottom: 0.5rem;">Tableau A : Effectif Global (Source SIRH)</p>
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead style="background: #e2e8f0;">
              <tr>
                <th style="padding: 12px; text-align: left;">Catégorie</th>
                <th style="padding: 12px; text-align: right;">Nombre de salariés</th>
                <th style="padding: 12px; text-align: right;">Temps de travail</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">CDI Temps Plein</td><td style="padding: 10px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">320</td><td style="padding: 10px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">100%</td></tr>
              <tr><td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">CDI Temps Partiel (80%)</td><td style="padding: 10px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">15</td><td style="padding: 10px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">80%</td></tr>
              <tr><td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">CDD Temps Plein</td><td style="padding: 10px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">12</td><td style="padding: 10px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">100%</td></tr>
              <tr><td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">Apprentis (35h)</td><td style="padding: 10px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">3</td><td style="padding: 10px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">100%</td></tr>
              <tr style="font-weight: 600; background: #f1f5f9;"><td style="padding: 10px 12px;">Total Têtes</td><td style="padding: 10px 12px; text-align: right;">350</td><td style="padding: 10px 12px; text-align: right;">—</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Tableau B : Âges -->
        <div style="margin-bottom: 1.5rem; background: #f8fafc; padding: 1rem; border-radius: 8px;">
          <p style="font-weight: 600; margin-bottom: 0.5rem;">Tableau B : Données Âges (Extrait SIRH)</p>
          <p>Somme totale des âges des 350 salariés : <strong>12 950 ans</strong></p>
        </div>

        <!-- Tableau C : Mouvements -->
        <div style="margin-bottom: 1.5rem; background: #f8fafc; padding: 1rem; border-radius: 8px;">
          <p style="font-weight: 600; margin-bottom: 0.5rem;">Tableau C : Mouvements de Personnel (T1 2024)</p>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 0.3rem;">• Départs sur les 12 derniers mois :</li>
            <li style="margin-left: 1.5rem;">- Démissions : 18</li>
            <li style="margin-left: 1.5rem;">- Fins de CDD : 10</li>
            <li style="margin-left: 1.5rem;">- Ruptures conventionnelles : 4</li>
            <li style="margin-left: 1.5rem;">- Licenciements : 3</li>
            <li style="margin-left: 1.5rem;">- Départs en retraite : 5</li>
            <li style="margin-top: 0.5rem;">• Effectif moyen sur l'année (moyenne des ETP) : <strong>345 ETP</strong></li>
          </ul>
        </div>

        <!-- Tableau D : Absences -->
        <div style="margin-bottom: 1.5rem; background: #f8fafc; padding: 1rem; border-radius: 8px;">
          <p style="font-weight: 600; margin-bottom: 0.5rem;">Tableau D : Suivi des Absences (T1 2024 - 3 mois)</p>
          <ul style="list-style: none; padding: 0;">
            <li>• Jours d'absence pour Maladie : 420 jours</li>
            <li>• Jours d'absence pour Accident du Travail : 30 jours</li>
            <li>• Jours ouvrés théoriques sur la période (350 salariés × 60 jours) : <strong>21 000 jours</strong></li>
          </ul>
        </div>

        <!-- Tableau E : Formation -->
        <div style="margin-bottom: 1.5rem; background: #f8fafc; padding: 1rem; border-radius: 8px;">
          <p style="font-weight: 600; margin-bottom: 0.5rem;">Tableau E : Formation (Année 2023)</p>
          <ul style="list-style: none; padding: 0;">
            <li>• Nombre de salariés ayant suivi au moins une formation : 210</li>
            <li>• Effectif total moyen 2023 : 340</li>
          </ul>
        </div>
      </div>

      <!-- Questions -->
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 1.5rem 0 1rem 0; font-size: 1.1rem;">✏️ Questions (À vous de jouer)</h4>
        <div style="background: #fff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 1.5rem;">
          <p><strong>Q1 — Effectif Total en Équivalent Temps Plein (ETP)</strong><br><small><em>Rappel : Un temps partiel à 80% compte pour 0,8 ETP.</em></small></p>
          <p><strong>Q2 — Âge Moyen</strong><br><small><em>Rappel : Somme des âges / Effectif Total.</em></small></p>
          <p><strong>Q3 — Taux de Turnover (%)</strong><br><small><em>Rappel : (Nombre de départs sur la période / Effectif moyen) × 100.<br>Attention : Inclure les démissions, fins de CDD, ruptures conventionnelles, licenciements et départs en retraite.</em></small></p>
          <p><strong>Q4 — Taux d'Absentéisme (%)</strong><br><small><em>Rappel : (Jours d'absence maladie + AT) / Jours ouvrés théoriques × 100.</em></small></p>
          <p><strong>Q5 — Taux de Salariés Formés (%)</strong><br><small><em>Rappel : (Nombre de salariés formés / Effectif total) × 100.</em></small></p>
        </div>

            <a href="https://drive.google.com/uc?export=download&id=19a4gEuOQ3Iee0oskMEFCxc8S4Lo9oMVH" target="_blank" rel="noopener noreferrer"
            class="external-link-block">
              <span class="external-link-block__icon">📄</span>
              <div class="external-link-block__text">
                  <div class="external-link-block__title">Corrigé - Cas Pratique - NeoCorp.pdf</div>
                  <div class="external-link-block__url">Google Drive</div>
              </div>
              <i data-lucide="file-text" class="arrow"></i>
          </a>
      </div>

      <!-- Zone de réponse ou bouton corrigé -->
      <div style="display: flex; gap: 1rem; align-items: center;">
        <button class="btn-section-complete" onclick="markComplete('section-3', 's3')" style="margin-right: auto;">
          <i data-lucide="check"></i> Cas pratique réalisé
        </button>
        <button onclick="document.getElementById('corrige-s3').style.display='block'; this.style.display='none';" style="background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; cursor: pointer;">
          <i data-lucide="eye" style="width: 18px; height: 18px; margin-right: 6px;"></i> Voir le corrigé
        </button>
      </div>

      <!-- Corrigé (caché par défaut) -->
      <div id="corrige-s3" style="display: none; margin-top: 2rem; background: #f0fdf4; border-left: 4px solid #22c55e; padding: 1.5rem; border-radius: 8px;">
        <h4 style="margin-top: 0; color: #166534; display: flex; align-items: center; gap: 8px;"><i data-lucide="check-circle" style="color: #22c55e;"></i> Corrigé (pour Sophie)</h4>
        <div style="color: #14532d;">
          <p><strong>Q1 — Effectif Total ETP</strong><br>CDI Plein : 320 × 1,0 = 320,0<br>CDI Partiel : 15 × 0,8 = 12,0<br>CDD Plein : 12 × 1,0 = 12,0<br>Apprentis : 3 × 1,0 = 3,0<br><strong>Total ETP = 320 + 12 + 12 + 3 = 347 ETP</strong></p>
          <p><strong>Q2 — Âge Moyen</strong><br>12 950 / 350 = <strong>37 ans</strong></p>
          <p><strong>Q3 — Taux de Turnover</strong><br>Total départs = 18 + 10 + 4 + 3 + 5 = 40<br>(40 / 345) × 100 ≈ <strong>11,6 %</strong> (Objectif CODIR &lt; 15% → au vert)</p>
          <p><strong>Q4 — Taux d'Absentéisme (T1 2024)</strong><br>Jours absence = 420 + 30 = 450<br>(450 / 21 000) × 100 = <strong>2,14 %</strong> (surveiller sur l'année)</p>
          <p><strong>Q5 — Taux de Salariés Formés</strong><br>(210 / 340) × 100 ≈ <strong>61,8 %</strong></p>
          <p style="margin-top: 1rem; font-style: italic;">Sophie peut maintenant présenter ces 5 KPI avec confiance jeudi.</p>
        </div>
      </div>
    </div>
    <div class="section-complete-bar" style="margin-top: 1.5rem;">
      <!-- Le bouton a déjà été placé plus haut, on peut garder un espacement -->
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
                <div class="quiz-wrapper__title">Auto-évaluation Module 2</div>
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
    if (pass) { toast.success(`Bravo ! ${correct}/5 — Module 2 validé !`); this.saveProgression(pct, 'valide'); markComplete('section-4', 's4'); }
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

new Module2Page();
