/**
 * DASHBOA_RD — Messages de bienvenue personnalisés
 * ═══════════════════════════════════════════════════════════════
 * Personnalisation : prénom + civilité (M./Mme) + cohorte + spécialisation
 * Cohortes : ARH, AC, AD, SA
 * Rôles    : admin, formateur, stagiaire
 * ═══════════════════════════════════════════════════════════════
 */

// ── ADMIN & FORMATEUR ────────────────────────────────────────────
const MESSAGES_ADMIN = [
  "Bonjour {prenom}. Le tableau de pilotage vous attend.",
  "Bonne journée {prenom}. Toutes les cohortes sont actives.",
  "Bienvenue {prenom}. Les stagiaires comptent sur vous.",
];

const MESSAGES_FORMATEUR = [
  "Bonjour {prenom}. Vos stagiaires progressent bien.",
  "Bienvenue {prenom}. Le suivi des cohortes est disponible.",
  "Bonne journée {prenom}. Prêt(e) à accompagner la prochaine session ?",
];

// ── ARH · GÉNÉRALISTE ────────────────────────────────────────────
const MESSAGES_ARH_H = [
  "Bonjour {prenom}, NeoCorp a besoin de tes indicateurs RH aujourd'hui.",
  "Salut {prenom}, prêt à transformer les données RH en décisions actionnables ?",
  "Hello {prenom}, le turnover de NeoCorp n'attend que ton analyse.",
  "Bienvenue {prenom}, un bon ARH se mesure. Un excellent se pilote par les KPI.",
  "Salut {prenom}, 450 salariés, des données partout — à toi de donner du sens.",
  "Bonjour {prenom}, ton tableau de bord RH NeoCorp attend sa mise à jour.",
  "Hey {prenom}, le DRH attend tes 5 KPI pour le CODIR de ce matin.",
  "Hello {prenom}, données brutes → indicateurs → KPI → décision. C'est ton parcours.",
];

const MESSAGES_ARH_F = [
  "Bonjour {prenom}, NeoCorp a besoin de tes indicateurs RH aujourd'hui.",
  "Salut {prenom}, prête à transformer les données RH en décisions actionnables ?",
  "Hello {prenom}, le turnover de NeoCorp n'attend que ton analyse.",
  "Bienvenue {prenom}, une bonne ARH se mesure. Une excellente se pilote par les KPI.",
  "Salut {prenom}, 450 salariés, des données partout — à toi de donner du sens.",
  "Bonjour {prenom}, ton tableau de bord RH NeoCorp attend sa mise à jour.",
  "Hey {prenom}, le DRH attend tes 5 KPI pour le CODIR de ce matin.",
  "Hello {prenom}, données brutes → indicateurs → KPI → décision. C'est ton parcours.",
];

// ── ARH · RECRUTEMENT ────────────────────────────────────────────
const MESSAGES_ARH_RECRUTEMENT_H = [
  "Bonjour {prenom}, le Time to Fill de NeoCorp a besoin de toi.",
  "Salut {prenom}, combien de postes sont en attente dans ton ATS aujourd'hui ?",
  "Hello {prenom}, un bon recruteur mesure son pipeline. Quel est le tien ?",
  "Bienvenue {prenom}, chaque jour sans candidat qualifié, c'est un KPI qui souffre.",
  "Salut {prenom}, le coût par embauche NeoCorp est-il dans la cible ?",
  "Bonjour {prenom}, les entretiens de la semaine sont prêts dans le dashboard.",
];

const MESSAGES_ARH_RECRUTEMENT_F = [
  "Bonjour {prenom}, le Time to Fill de NeoCorp a besoin de toi.",
  "Salut {prenom}, combien de postes sont en attente dans ton ATS aujourd'hui ?",
  "Hello {prenom}, une bonne recruteuse mesure son pipeline. Quel est le tien ?",
  "Bienvenue {prenom}, chaque jour sans candidat qualifié, c'est un KPI qui souffre.",
  "Salut {prenom}, le coût par embauche NeoCorp est-il dans la cible ?",
  "Bonjour {prenom}, les entretiens de la semaine sont prêts dans le dashboard.",
];

// ── ARH · PAIE ───────────────────────────────────────────────────
const MESSAGES_ARH_PAIE_H = [
  "Bonjour {prenom}, le bulletin de paie de NeoCorp ne tolère aucune erreur.",
  "Salut {prenom}, le taux d'anomalies paie est ton KPI le plus critique.",
  "Hello {prenom}, la masse salariale prévisionnelle attend ton contrôle.",
  "Bienvenue {prenom}, zéro erreur sur les bulletins — c'est ton objectif quotidien.",
  "Bonjour {prenom}, le calendrier de paie de NeoCorp est chargé ce mois-ci.",
];

const MESSAGES_ARH_PAIE_F = [
  "Bonjour {prenom}, le bulletin de paie de NeoCorp ne tolère aucune erreur.",
  "Salut {prenom}, le taux d'anomalies paie est ton KPI le plus critique.",
  "Hello {prenom}, la masse salariale prévisionnelle attend ton contrôle.",
  "Bienvenue {prenom}, zéro erreur sur les bulletins — c'est ton objectif quotidien.",
  "Bonjour {prenom}, le calendrier de paie de NeoCorp est chargé ce mois-ci.",
];

// ── ARH · FORMATION ──────────────────────────────────────────────
const MESSAGES_ARH_FORMATION_H = [
  "Bonjour {prenom}, le plan de formation NeoCorp attend ta validation.",
  "Salut {prenom}, quel est le taux de réalisation du plan de formation ce mois ?",
  "Hello {prenom}, le ROI formation de NeoCorp se construit aujourd'hui.",
  "Bienvenue {prenom}, chaque heure de formation est un investissement à mesurer.",
  "Bonjour {prenom}, 92% des salariés formés — l'objectif 90% est dépassé. Continue !",
];

const MESSAGES_ARH_FORMATION_F = [
  "Bonjour {prenom}, le plan de formation NeoCorp attend ta validation.",
  "Salut {prenom}, quel est le taux de réalisation du plan de formation ce mois ?",
  "Hello {prenom}, le ROI formation de NeoCorp se construit aujourd'hui.",
  "Bienvenue {prenom}, chaque heure de formation est un investissement à mesurer.",
  "Bonjour {prenom}, 92% des salariés formés — l'objectif 90% est dépassé. Continue !",
];

// ── AC — ASSISTANT COMMERCIAL ─────────────────────────────────────
const MESSAGES_AC_H = [
  "Bonjour {prenom}, le tunnel de conversion de NeoCorp n'attend que ton analyse.",
  "Salut {prenom}, prêt à transformer les données ERP en plan d'action commercial ?",
  "Hello {prenom}, ton taux de transformation du jour est-il au-dessus de l'objectif ?",
  "Bienvenue {prenom}, chaque chiffre commercial cache une opportunité. Trouve-la.",
  "Hey {prenom}, le responsable ADV attend tes 5 KPI. T'es prêt ?",
  "Salut {prenom}, un bon assistant commercial se mesure. Un excellent se pilote.",
  "Bonjour {prenom}, NeoCorp a besoin de ton œil analytique aujourd'hui.",
  "Hello {prenom}, DSO, OTD, réclamations — à toi de donner le cap.",
  "Bienvenue {prenom}, ton dashboard commercial va parler pour toi en réunion.",
  "Salut {prenom}, données brutes → indicateurs → KPI → action. C'est ton parcours.",
];

const MESSAGES_AC_F = [
  "Bonjour {prenom}, le tunnel de conversion de NeoCorp n'attend que ton analyse.",
  "Salut {prenom}, prête à transformer les données ERP en plan d'action commercial ?",
  "Hello {prenom}, ton taux de transformation du jour est-il au-dessus de l'objectif ?",
  "Bienvenue {prenom}, chaque chiffre commercial cache une opportunité. Trouve-la.",
  "Hey {prenom}, le responsable ADV attend tes 5 KPI. T'es prête ?",
  "Salut {prenom}, une bonne assistante commerciale se mesure. Une excellente se pilote.",
  "Bonjour {prenom}, NeoCorp a besoin de ton œil analytique aujourd'hui.",
  "Hello {prenom}, DSO, OTD, réclamations — à toi de donner le cap.",
  "Bienvenue {prenom}, ton dashboard commercial va parler pour toi en réunion.",
  "Salut {prenom}, données brutes → indicateurs → KPI → action. C'est ton parcours.",
];

// ── AD — ASSISTANT DE DIRECTION ──────────────────────────────────
const MESSAGES_AD_H = [
  "Bonjour {prenom}, le CODIR de NeoCorp commence dans 1 heure. Ton tableau de bord est prêt ?",
  "Salut {prenom}, le DG attend ta note de synthèse. 3 projets en retard, 1 budget dépassé.",
  "Hello {prenom}, prêt à transformer les données de direction en décisions claires ?",
  "Bienvenue {prenom}, l'assistant de direction qui maîtrise les KPI devient indispensable.",
  "Hey {prenom}, le CODIR ne lit pas les chiffres — il lit ton analyse. Fais-la parler.",
  "Salut {prenom}, chaque retard de projet cache une cause. À toi de la trouver.",
  "Bonjour {prenom}, ton tableau de bord de pilotage attend sa mise à jour mensuelle.",
  "Hello {prenom}, prêt à présenter 5 KPI au DG en 30 secondes chrono ?",
  "Bienvenue {prenom}, NeoCorp pilote mieux quand tu es aux commandes des données.",
  "Salut {prenom}, un bon AD ne subit pas les données — il les anticipe.",
];

const MESSAGES_AD_F = [
  "Bonjour {prenom}, le CODIR de NeoCorp commence dans 1 heure. Ton tableau de bord est prêt ?",
  "Salut {prenom}, le DG attend ta note de synthèse. 3 projets en retard, 1 budget dépassé.",
  "Hello {prenom}, prête à transformer les données de direction en décisions claires ?",
  "Bienvenue {prenom}, l'assistante de direction qui maîtrise les KPI devient indispensable.",
  "Hey {prenom}, le CODIR ne lit pas les chiffres — il lit ton analyse. Fais-la parler.",
  "Salut {prenom}, chaque retard de projet cache une cause. À toi de la trouver.",
  "Bonjour {prenom}, ton tableau de bord de pilotage attend sa mise à jour mensuelle.",
  "Hello {prenom}, prête à présenter 5 KPI au DG en 30 secondes chrono ?",
  "Bienvenue {prenom}, NeoCorp pilote mieux quand tu es aux commandes des données.",
  "Salut {prenom}, une bonne AD ne subit pas les données — elle les anticipe.",
];

// ── SA — SECRÉTAIRE ASSISTANT ─────────────────────────────────────
const MESSAGES_SA_H = [
  "Bonjour {prenom}, le taux de réclamation de NeoCorp a besoin de ton analyse.",
  "Salut {prenom}, prêt à transformer les données de l'ERP en rapport mensuel clair ?",
  "Hello {prenom}, le responsable attend ton commentaire C-A-I sur les KPI du mois.",
  "Bienvenue {prenom}, le secrétaire assistant qui analyse les données change de dimension.",
  "Hey {prenom}, les chiffres de NeoCorp parlent. Encore faut-il savoir les écouter.",
  "Salut {prenom}, un bon tableau de suivi vaut mieux qu'un long discours en réunion.",
  "Bonjour {prenom}, prêt à construire le rapport mensuel de NeoCorp ?",
  "Hello {prenom}, ton analyse des KPI aide le responsable à décider mieux et plus vite.",
  "Bienvenue {prenom}, NeoCorp a besoin de ton regard analytique sur l'activité du mois.",
  "Salut {prenom}, données brutes → indicateurs → KPI → action. C'est ton parcours.",
];

const MESSAGES_SA_F = [
  "Bonjour {prenom}, le taux de réclamation de NeoCorp a besoin de ton analyse.",
  "Salut {prenom}, prête à transformer les données de l'ERP en rapport mensuel clair ?",
  "Hello {prenom}, le responsable attend ton commentaire C-A-I sur les KPI du mois.",
  "Bienvenue {prenom}, la secrétaire assistante qui analyse les données change de dimension.",
  "Hey {prenom}, les chiffres de NeoCorp parlent. Encore faut-il savoir les écouter.",
  "Salut {prenom}, un bon tableau de suivi vaut mieux qu'un long discours en réunion.",
  "Bonjour {prenom}, prête à construire le rapport mensuel de NeoCorp ?",
  "Hello {prenom}, ton analyse des KPI aide le responsable à décider mieux et plus vite.",
  "Bienvenue {prenom}, NeoCorp a besoin de ton regard analytique sur l'activité du mois.",
  "Salut {prenom}, données brutes → indicateurs → KPI → action. C'est ton parcours.",
];

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

/**
 * Retourne le libellé de spécialisation selon la cohorte.
 * Utilisé dans la sidebar (data-profile="specialisation").
 */
export function getSpecialisationLabel(cohorteOrSpec) {
  const val = (cohorteOrSpec || '').toLowerCase();
  const map = {
    // ARH spécialisations
    'generaliste':  'ARH Généraliste',
    'recrutement':  'ARH Recrutement',
    'paie':         'ARH Paie',
    'formation':    'ARH Formation',
    // Cohortes principales
    'arh':          'Assistant RH',
    'ac':           'Assistant Commercial',
    'ad':           'Assistant de Direction',
    'sa':           'Secrétaire Assistant',
  };
  return map[val] || cohorteOrSpec || 'Stagiaire';
}

/**
 * Retourne un message de bienvenue aléatoire et personnalisé.
 * Compatible toutes cohortes : ARH, AC, AD, SA.
 *
 * @param {Object} profile - profil normalisé (output de getUserProfile)
 * @returns {string}
 */
export function getRandomMessage(profile) {
  const { prenom, civilite, role, cohorte, specialisation } = profile;
  const isFemme = civilite === 'Mme';

  let pool;

  if (role === 'admin') {
    pool = MESSAGES_ADMIN;

  } else if (role === 'formateur') {
    pool = MESSAGES_FORMATEUR;

  } else {
    // Stagiaire — routage par cohorte puis spécialisation
    switch ((cohorte || '').toUpperCase()) {

      case 'ARH': {
        const spec = (specialisation || 'generaliste').toLowerCase();
        if (spec === 'recrutement') pool = isFemme ? MESSAGES_ARH_RECRUTEMENT_F : MESSAGES_ARH_RECRUTEMENT_H;
        else if (spec === 'paie')   pool = isFemme ? MESSAGES_ARH_PAIE_F       : MESSAGES_ARH_PAIE_H;
        else if (spec === 'formation') pool = isFemme ? MESSAGES_ARH_FORMATION_F : MESSAGES_ARH_FORMATION_H;
        else                           pool = isFemme ? MESSAGES_ARH_F           : MESSAGES_ARH_H;
        break;
      }

      case 'AC':
        pool = isFemme ? MESSAGES_AC_F : MESSAGES_AC_H;
        break;

      case 'AD':
        pool = isFemme ? MESSAGES_AD_F : MESSAGES_AD_H;
        break;

      case 'SA':
        pool = isFemme ? MESSAGES_SA_F : MESSAGES_SA_H;
        break;

      default:
        pool = isFemme ? MESSAGES_ARH_F : MESSAGES_ARH_H;
    }
  }

  const msg = pool[Math.floor(Math.random() * pool.length)];
  return msg.replace(/\{prenom\}/g, prenom || 'vous');
}
