/**
 * DASHBOA_RD — Module 3 ARH : Calcul des KPI
 */
import authService    from '../../../core/services/authService.js';
import storageService from '../../../core/services/storageService.js';
import { $, redirectTo, toast } from '../../../core/utils/utils.js';
import { getCohorteLabel }      from '../../../core/utils/messages.js';

const MODULE_CODE = 'M3';

const QUIZ_QUESTIONS = [
  {
    "id": 1,
    "text": "L'effectif moyen se calcule :",
    "options": [
      {
        "key": "a",
        "text": "Effectif au 1er janvier"
      },
      {
        "key": "b",
        "text": "(Effectif début + Effectif fin) / 2"
      },
      {
        "key": "c",
        "text": "Effectif total / 12"
      },
      {
        "key": "d",
        "text": "Effectif CDI uniquement"
      }
    ],
    "correct": "b",
    "explanation": "L'effectif moyen est la moyenne arithmétique entre l'effectif de début de période et l'effectif de fin de période."
  },
  {
    "id": 2,
    "text": "Pour 350 salariés, 77 jours d'absence sur 22 jours ouvrés, le taux d'absentéisme est :",
    "options": [
      {
        "key": "a",
        "text": "22%"
      },
      {
        "key": "b",
        "text": "10%"
      },
      {
        "key": "c",
        "text": "1%"
      },
      {
        "key": "d",
        "text": "0,22%"
      }
    ],
    "correct": "c",
    "explanation": "TA = 77 / (350 × 22) × 100 = 77 / 7700 × 100 = 1%. Attention à bien multiplier l'effectif par le nombre de jours ouvrés."
  },
  {
    "id": 3,
    "text": "Le taux de turnover volontaire exclut :",
    "options": [
      {
        "key": "a",
        "text": "Les démissions"
      },
      {
        "key": "b",
        "text": "Les fins de CDD"
      },
      {
        "key": "c",
        "text": "Les licenciements et retraites"
      },
      {
        "key": "d",
        "text": "Les ruptures conventionnelles"
      }
    ],
    "correct": "c",
    "explanation": "Le turnover volontaire ne comptabilise que les départs à l'initiative du salarié (démissions, ruptures conventionnelles). Les licenciements et retraites sont des départs involontaires."
  },
  {
    "id": 4,
    "text": "Un coût moyen de recrutement de 8 500€ pour un technicien est :",
    "options": [
      {
        "key": "a",
        "text": "Normal pour tout poste"
      },
      {
        "key": "b",
        "text": "Élevé, nécessite une analyse"
      },
      {
        "key": "c",
        "text": "Toujours acceptable"
      },
      {
        "key": "d",
        "text": "Impossible à calculer sans SIRH"
      }
    ],
    "correct": "b",
    "explanation": "Pour un poste de technicien, un CMR de 8500€ est supérieur à la fourchette habituelle (3000-6000€). Il faut analyser les sources de coûts et optimiser le process de recrutement."
  },
  {
    "id": 5,
    "text": "Le taux de réalisation du plan de formation idéal est :",
    "options": [
      {
        "key": "a",
        "text": "50%"
      },
      {
        "key": "b",
        "text": "70%"
      },
      {
        "key": "c",
        "text": "Supérieur à 85%"
      },
      {
        "key": "d",
        "text": "100% obligatoire"
      }
    ],
    "correct": "c",
    "explanation": "Un taux supérieur à 85% est considéré comme satisfaisant. Un taux de 100% est rare car des formations peuvent être annulées ou reportées pour des raisons opérationnelles."
  }
];

const MODULE_OBJECTIVE = "Appliquer les formules des KPI RH fondamentaux et interpréter les résultats.";

class Module3Page {
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
            <div class="accordion-header__subtitle">CONTENU · 10 min</div>
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
              <div class="content-block__title">Concepts clés — Calcul des KPI</div>
            </div>

            <!-- Objectifs pédagogiques -->
            <div style="background: #eef2ff; padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem;">
              <h4 style="margin-top: 0; color: #1e293b; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="target" style="width: 20px; height: 20px; color: #4f46e5;"></i>
                Objectifs pédagogiques (SMART)
              </h4>
              <ol style="margin: 0; padding-left: 1.5rem; color: #1e293b;">
                <li>Appliquer les formules des 8 KPI RH fondamentaux</li>
                <li>Identifier et corriger les erreurs de calcul courantes</li>
                <li>Calculer un taux d'absentéisme, de turnover, de coût de recrutement sur données réelles</li>
                <li>Interpréter un résultat en le comparant à une référence sectorielle</li>
              </ol>
            </div>

            <!-- Storytelling d'entrée -->
            <div style="background: #fefce8; border-left: 4px solid #eab308; padding: 1.25rem; border-radius: 8px; margin-bottom: 1.5rem;">
              <p style="margin: 0; font-style: italic;">
                💬 <strong>Sophie</strong> a son référentiel de KPI. La DRH lui demande maintenant de calculer les chiffres pour le rapport mensuel. 
                Elle ouvre son Excel et réalise qu'elle ne maîtrise pas toutes les formules. 
                <strong>Le module 3 lui donne les outils pour ne plus jamais bloquer sur un calcul.</strong>
              </p>
            </div>

            <!-- Contenu théorique : Formules fondamentales -->
            <h3 style="margin: 1.5rem 0 1rem 0;">📐 FORMULES FONDAMENTALES</h3>

            <!-- 8 KPI en format grille / liste -->
            <div style="display: grid; gap: 1rem;">
              <!-- KPI 1 -->
              <div style="background: #f8fafc; padding: 1rem; border-radius: 8px;">
                <div style="font-weight: 700; font-size: 1.1rem;">1. Taux d'absentéisme</div>
                <code style="display: block; background: #fff; padding: 0.5rem; border-radius: 6px; margin: 0.5rem 0;">
                  TA = (Nombre de jours d'absence / Nombre de jours théoriques travaillés) × 100
                </code>
                <p style="margin: 0.25rem 0; font-size: 0.9rem;">Jours théoriques = Effectif × Nombre de jours ouvrés de la période</p>
                <p style="margin: 0.25rem 0; font-size: 0.9rem; color: #475569;">📊 Référence sectorielle : &lt; 3,5% (France, moyenne tous secteurs)</p>
              </div>

              <!-- KPI 2 -->
              <div style="background: #f8fafc; padding: 1rem; border-radius: 8px;">
                <div style="font-weight: 700; font-size: 1.1rem;">2. Taux de turnover</div>
                <code style="display: block; background: #fff; padding: 0.5rem; border-radius: 6px; margin: 0.5rem 0;">
                  TTO = (Nombre de départs / Effectif moyen) × 100
                </code>
                <p style="margin: 0.25rem 0; font-size: 0.9rem;">Effectif moyen = (Effectif début + Effectif fin) / 2</p>
                <p style="margin: 0.25rem 0; font-size: 0.9rem; color: #475569;">📊 Référence : &lt; 15% considéré acceptable en France</p>
              </div>

              <!-- KPI 3 -->
              <div style="background: #f8fafc; padding: 1rem; border-radius: 8px;">
                <div style="font-weight: 700; font-size: 1.1rem;">3. Taux de turnover volontaire</div>
                <code style="display: block; background: #fff; padding: 0.5rem; border-radius: 6px; margin: 0.5rem 0;">
                  TTV = (Démissions / Effectif moyen) × 100
                </code>
                <p style="margin: 0.25rem 0; font-size: 0.9rem;">Important : distinguer départs volontaires / involontaires</p>
              </div>

              <!-- KPI 4 -->
              <div style="background: #f8fafc; padding: 1rem; border-radius: 8px;">
                <div style="font-weight: 700; font-size: 1.1rem;">4. Délai moyen de recrutement</div>
                <code style="display: block; background: #fff; padding: 0.5rem; border-radius: 6px; margin: 0.5rem 0;">
                  DMR = Somme des délais (affichage offre → date d'embauche) / Nombre de recrutements
                </code>
                <p style="margin: 0.25rem 0; font-size: 0.9rem; color: #475569;">📊 Référence : 30–45 jours en PME</p>
              </div>

              <!-- KPI 5 -->
              <div style="background: #f8fafc; padding: 1rem; border-radius: 8px;">
                <div style="font-weight: 700; font-size: 1.1rem;">5. Coût moyen de recrutement</div>
                <code style="display: block; background: #fff; padding: 0.5rem; border-radius: 6px; margin: 0.5rem 0;">
                  CMR = (Coûts annonces + Coûts cabinet + Temps RH valorisé + Intégration) / Nb embauches
                </code>
                <p style="margin: 0.25rem 0; font-size: 0.9rem; color: #475569;">📊 Référence : 3 000–8 000 € selon poste</p>
              </div>

              <!-- KPI 6 -->
              <div style="background: #f8fafc; padding: 1rem; border-radius: 8px;">
                <div style="font-weight: 700; font-size: 1.1rem;">6. Taux de réalisation plan de formation</div>
                <code style="display: block; background: #fff; padding: 0.5rem; border-radius: 6px; margin: 0.5rem 0;">
                  TRF = (Heures de formation réalisées / Heures planifiées) × 100
                </code>
                <p style="margin: 0.25rem 0; font-size: 0.9rem; color: #475569;">🎯 Cible : > 85%</p>
              </div>

              <!-- KPI 7 -->
              <div style="background: #f8fafc; padding: 1rem; border-radius: 8px;">
                <div style="font-weight: 700; font-size: 1.1rem;">7. Masse salariale / Chiffre d'affaires</div>
                <code style="display: block; background: #fff; padding: 0.5rem; border-radius: 6px; margin: 0.5rem 0;">
                  MS/CA = Masse salariale brute chargée / Chiffre d'affaires × 100
                </code>
                <p style="margin: 0.25rem 0; font-size: 0.9rem; color: #475569;">📊 Référence : 20–40% selon secteur</p>
              </div>

              <!-- KPI 8 -->
              <div style="background: #f8fafc; padding: 1rem; border-radius: 8px;">
                <div style="font-weight: 700; font-size: 1.1rem;">8. Taux de réalisation des entretiens annuels</div>
                <code style="display: block; background: #fff; padding: 0.5rem; border-radius: 6px; margin: 0.5rem 0;">
                  TEA = (Entretiens réalisés / Effectif éligible) × 100
                </code>
                <p style="margin: 0.25rem 0; font-size: 0.9rem; color: #475569;">🎯 Cible légale : 100% (obligation CPF/entretien pro tous les 2 ans)</p>
              </div>
            </div>

            <!-- Erreurs fréquentes -->
            <div style="margin-top: 1.5rem; background: #ff580aa9; padding: 1.25rem; border-radius: 8px;">
              <h4 style="margin-top: 0; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="alert-triangle" style="width: 20px; height: 20px; color: #e4e4e4;"></i>
                Erreurs fréquentes à éviter
              </h4>
              <ul style="margin: 0; padding-left: 1.5rem;">
                <li>Confondre effectif physique et ETP</li>
                <li>Oublier les CDD dans le calcul du turnover</li>
                <li>Utiliser des jours calendaires au lieu des jours ouvrés</li>
                <li>Ne pas distinguer absences justifiées / injustifiées</li>
              </ul>
            </div>

            <!-- Exercice interactif : Calculatrice KPI -->
            <div style="margin-top: 2rem;">
              <h3 style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="calculator"></i>
                🧠 Exercice interactif — Calculatrice KPI
              </h3>
              <p><em>Complétez le tableau avec les bonnes formules et résultats :</em></p>

              <!-- Tableau des données -->
              <div style="overflow-x: auto; margin-bottom: 1.5rem;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <thead style="background: #1e293b; color: white;">
                    <tr>
                      <th style="padding: 12px; text-align: left;">Données NeoCorp — Avril</th>
                      <th style="padding: 12px; text-align: right;">Valeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">Effectif début</td><td style="padding: 10px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">350</td></tr>
                    <tr><td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">Effectif fin</td><td style="padding: 10px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">347</td></tr>
                    <tr><td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">Jours d'absence</td><td style="padding: 10px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">68</td></tr>
                    <tr><td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">Jours ouvrés</td><td style="padding: 10px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">21</td></tr>
                    <tr><td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">Départs (dont 4 démissions)</td><td style="padding: 10px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">6</td></tr>
                    <tr><td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">Recrutements finalisés</td><td style="padding: 10px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">3</td></tr>
                    <tr><td style="padding: 10px 12px;">Délais recrutement (j)</td><td style="padding: 10px 12px; text-align: right;">28, 35, 42</td></tr>
                  </tbody>
                </table>
              </div>

              <p><strong>Calculez : TA, TTO, TTV, DMR</strong></p>

              <!-- Bouton pour afficher la correction -->
              <div style="margin: 1rem 0;">
                <button onclick="document.getElementById('correction-exercice').style.display='block'; this.style.display='none';" 
                        style="background: #2563eb; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-weight: 500; cursor: pointer;">
                  <i data-lucide="eye" style="width: 18px; height: 18px; margin-right: 6px;"></i> Voir la correction
                </button>
              </div>

              <!-- Correction (cachée par défaut) -->
              <div id="correction-exercice" style="display: none; background: #f0fdf4; border-left: 4px solid #22c55e; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
                <h4 style="margin-top: 0; color: #166534;">✅ Corrections</h4>
                <ul style="color: #14532d; line-height: 1.6;">
                  <li><strong>Effectif moyen</strong> = (350 + 347) / 2 = 348,5</li>
                  <li><strong>TA (Taux d'absentéisme)</strong> = 68 / (348,5 × 21) × 100 = <strong>0,93%</strong> ✅ (objectif &lt; 3,5% → vert)</li>
                  <li><strong>TTO (Turnover)</strong> = 6 / 348,5 × 100 = <strong>1,72%</strong> mensuel → <strong>20,6% annualisé</strong> ⚠️ (> 15% → orange)</li>
                  <li><strong>TTV (Turnover volontaire)</strong> = 4 / 348,5 × 100 = <strong>1,15%</strong> mensuel → <strong>13,8% annualisé</strong> (démissions)</li>
                  <li><strong>DMR (Délai moyen de recrutement)</strong> = (28 + 35 + 42) / 3 = <strong>35 jours</strong> (objectif 30j → légèrement hors cible)</li>
                </ul>
              </div>
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
              <div class="content-block__title">Mission NeoCorp — Module 3</div>
            </div>

            <!-- Présentation du cas pratique -->
            <div style="background: #f1f5f9; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
              <h4 style="margin-top: 0; color: #1e293b;  display: flex; align-items: center; gap: 8px;">
                <i data-lucide="clipboard-list"></i>
                💼 Cas pratique NeoCorp — Module 3
              </h4>
              <p style="margin-bottom: 0.5rem;"><strong>NeoCorp vous transmet les données RH du S1 (6 mois) :</strong></p>
              <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
                <li>Effectif moyen : <strong>348</strong></li>
                <li>Total jours d'absence : <strong>892</strong> (sur 130 jours ouvrés)</li>
                <li>Départs : <strong>28</strong> (dont 18 démissions)</li>
                <li>Budget recrutement S1 : <strong>24 000 €</strong> — 8 embauches</li>
                <li>Entretiens annuels réalisés : <strong>289</strong> / 348 éligibles</li>
                <li>Plan formation : <strong>1 200 h</strong> planifiées — <strong>980 h</strong> réalisées</li>
              </ul>
              <p style="margin-top: 1rem; font-weight: 500;">
                🎯 <strong>Mission :</strong> Calculez les 6 KPI ci-dessous, comparez aux cibles, et rédigez un paragraphe de synthèse pour la DRH (5 lignes max).
              </p>
            </div>

            <!-- Les 6 KPI à calculer (sans les réponses) -->
            <div style="margin-bottom: 1.5rem;">
              <h4>📊 KPI à calculer</h4>
              <ol style="line-height: 1.8;">
                <li><strong>Taux d'absentéisme (TA)</strong> — Cible &lt; 3,5%</li>
                <li><strong>Taux de turnover (TTO)</strong> — Cible &lt; 15% annualisé</li>
                <li><strong>Taux de turnover volontaire (TTV)</strong></li>
                <li><strong>Coût moyen de recrutement (CMR)</strong> — Cible 3 000 – 8 000 €</li>
                <li><strong>Taux de réalisation des entretiens annuels (TEA)</strong> — Cible 100%</li>
                <li><strong>Taux de réalisation du plan de formation (TRF)</strong> — Cible &gt; 85%</li>
              </ol>
            </div>

            <!-- Bouton pour afficher la correction -->
            <div style="margin: 1.5rem 0;">
              <button onclick="document.getElementById('correction-module3').style.display='block'; this.style.display='none';" 
                      style="background: #0f172a; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
                <i data-lucide="eye" style="width: 18px; height: 18px;"></i> Voir la correction complète
              </button>
            </div>

            <!-- Correction complète (cachée par défaut) -->
            <div id="correction-module3" style="display: none; background: #f0fdf4; border-left: 4px solid #16a34a; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
              <h4 style="margin-top: 0; color: #166534; display: flex; align-items: center; gap: 8px;">
                <i data-lucide="check-circle" style="color: #16a34a;"></i> ✅ Correction complète
              </h4>
              
              <h5 style="margin-bottom: 0.5rem;">Calculs détaillés</h5>
              <ol style="padding-left: 1.5rem; margin-bottom: 1.5rem;">
                <li><strong>TA</strong> = 892 / (348 × 130) × 100 = <strong>1,97%</strong> ✅ vert (&lt; 3,5%)</li>
                <li><strong>TTO</strong> = 28 / 348 × 100 = <strong>8,05%</strong> sur 6 mois → <strong>16,1% annualisé</strong> 🔴 (> 15%)</li>
                <li><strong>TTV</strong> = 18 / 348 × 100 = <strong>5,17%</strong> sur 6 mois → <strong>10,3% annualisé</strong> 🟡</li>
                <li><strong>CMR</strong> = 24 000 / 8 = <strong>3 000 € / recrue</strong> ✅ vert</li>
                <li><strong>TEA</strong> = 289 / 348 × 100 = <strong>83%</strong> 🟡 (objectif 100%)</li>
                <li><strong>TRF</strong> = 980 / 1 200 × 100 = <strong>81,7%</strong> 🟡 (objectif > 85%)</li>
              </ol>

              <h5 style="margin-bottom: 0.5rem;">📝 Synthèse pour la DRH (5 lignes max)</h5>
              <div style="background: white; padding: 1rem; border-radius: 6px; border: 1px solid #bbf7d0;">
                <p style="margin: 0; font-style: italic;">
                  « Le S1 présente un absentéisme maîtrisé (1,97%) et un coût de recrutement dans les normes. 
                  En revanche, le turnover annualisé à 16,1% dépasse l'objectif de 15%, porté par 18 démissions. 
                  Les entretiens annuels (83%) et la réalisation du plan de formation (82%) restent sous les cibles. 
                  Un plan d'action sur la fidélisation et la formation s'impose pour le S2. »
                </p>
              </div>
            </div>

            <!-- Bouton de complétion -->
            <div class="section-complete-bar" style="margin-top: 2rem;">
              <button class="btn-section-complete" onclick="markComplete('section-3', 's3')">
                <i data-lucide="check"></i> Cas pratique réalisé
              </button>
            </div>
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
                <div class="quiz-wrapper__title">Auto-évaluation Module 3</div>
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
    if (pass) { toast.success(`Bravo ! ${correct}/5 — Module 3 validé !`); this.saveProgression(pct, 'valide'); markComplete('section-4', 's4'); }
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

new Module3Page();
