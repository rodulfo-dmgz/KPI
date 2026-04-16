/**
 * DASHBOA_RD — Constantes globales
 */

export const ROLES = {
  ADMIN:     'admin',
  FORMATEUR: 'formateur',
  STAGIAIRE: 'stagiaire',
};

export const COHORTES = {
  CA:  { code: 'CA',  label: 'Comptable Assistant',             color: 'primary' },
  AC:  { code: 'AC',  label: 'Assistant Commercial',            color: 'secondary' },
  SA:  { code: 'SA',  label: 'Secrétaire Assistant',            color: 'info' },
  SC:  { code: 'SC',  label: 'Secrétaire Comptable',            color: 'warning' },
  ARH: { code: 'ARH', label: 'Assistant Ressources Humaines',   color: 'success' },
  GP:  { code: 'GP',  label: 'Gestionnaire de Paie',            color: 'accent' },
  GCF: { code: 'GCF', label: 'Gestionnaire Comptable et Fiscal',color: 'danger' },
  AD:  { code: 'AD',  label: 'Assistant de Direction',          color: 'neutral' },
};

export const CIVILITES = {
  M:   { code: 'M',   label: 'Monsieur' },
  MME: { code: 'Mme', label: 'Madame' },
};

export const NIVEAUX = {
  DEBUTANT:      'debutant',
  STANDARD:      'standard',
  AVANCE:        'avance',
  RENFORCEMENT:  'renforcement',
};

export const STATUTS_MODULE = {
  NON_COMMENCE: 'non_commence',
  EN_COURS:     'en_cours',
  TERMINE:      'termine',
  VALIDE:       'valide',
};

export const TABLES = {
  USERS:          'tb_kpi_users',
  MODULES:        'tb_kpi_modules',
  PROGRESSION:    'tb_kpi_progression',
  QUIZ_REPONSES:  'tb_kpi_quiz_reponses',
  BADGES:         'tb_kpi_badges',
  PROJET_FINAL:   'tb_kpi_projet_final',
};

export const BADGES = {
  ANALYSTE_KPI:      { code: 'ANALYSTE_KPI',      label: 'Analyste KPI',      icon: '🔍', condition: 'M1 + M2 ≥ 70%' },
  CALCULATEUR_RH:    { code: 'CALCULATEUR_RH',    label: 'Calculateur RH',    icon: '🧮', condition: 'M3 ≥ 70%' },
  PILOTE_DONNEES:    { code: 'PILOTE_DONNEES',    label: 'Pilote de Données',  icon: '📊', condition: 'M4 + M5 ≥ 70%' },
  EXPERT_EXCEL:      { code: 'EXPERT_EXCEL',      label: 'Expert Excel RH',   icon: '💻', condition: 'M6 ≥ 80%' },
  SPECIALISTE_METIER:{ code: 'SPECIALISTE_METIER',label: 'Spécialiste Métier', icon: '🎯', condition: 'M7 ≥ 80%' },
  ARH_DATA_DRIVEN:   { code: 'ARH_DATA_DRIVEN',   label: 'ARH Data-Driven',   icon: '⭐', condition: 'Projet final ≥ 70%' },
  CERTIFIE_KPI_RH:   { code: 'CERTIFIE_KPI_RH',   label: 'Certifié KPI RH',   icon: '🏆', condition: 'Score global ≥ 80%' },
};

export const MODULES_ARH = [
  { id: 'M1', titre: 'Comprendre les KPI RH',    duree: 3,  niveau: 'debutant',      icon: 'lightbulb' },
  { id: 'M2', titre: 'Identifier les KPI RH',    duree: 3,  niveau: 'debutant',      icon: 'search' },
  { id: 'M3', titre: 'Calcul des KPI',           duree: 4,  niveau: 'intermediaire', icon: 'calculator' },
  { id: 'M4', titre: 'Analyse RH & Décision',    duree: 3,  niveau: 'intermediaire', icon: 'bar-chart-2' },
  { id: 'M5', titre: 'Tableau de bord RH',       duree: 4,  niveau: 'intermediaire', icon: 'layout-dashboard' },
  { id: 'M6', titre: 'Outils (Excel / BI)',       duree: 4,  niveau: 'intermediaire', icon: 'table-2' },
  { id: 'M7', titre: 'KPI par métier RH',        duree: 4,  niveau: 'avance',        icon: 'briefcase' },
];

export const SCORE_SEUILS = {
  RENFORCEMENT: 50,
  AVANCE:       80,
  CERTIFICATION: 70,
};
