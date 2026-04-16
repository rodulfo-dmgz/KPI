/**
 * DASHBOA_RD — Messages contextuels et labels
 */
import { COHORTES } from '../config/constants.js';

export function getCiviliteLabel(civilite) {
  return civilite === 'Mme' ? 'Madame' : 'Monsieur';
}

export function getCohorteLabel(cohorte) {
  return COHORTES[cohorte]?.label || cohorte || '—';
}

const MESSAGES_ARH = [
  "Vos KPI RH n'attendent que vous. C'est parti !",
  "Chaque indicateur est une décision en devenir. Explorons ensemble.",
  "NeoCorp a besoin de votre expertise RH aujourd'hui.",
  "Les données racontent une histoire. À vous de la lire.",
  "Pilotez votre service RH par la donnée — module par module.",
  "Votre tableau de bord RH prend forme. Continuez !",
];

const MESSAGES_GENERIQUES = [
  "Bonne continuation dans votre formation.",
  "Chaque module vous rapproche de la certification.",
  "Continuez à progresser, vous êtes sur la bonne voie.",
  "Votre parcours avance bien. C'est parti !",
];

export function getRandomMessage(profile) {
  const pool = profile?.cohorte === 'ARH' ? MESSAGES_ARH : MESSAGES_GENERIQUES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getNiveauLabel(niveau) {
  const labels = {
    debutant:     '🟦 Débutant',
    standard:     '🟨 Standard',
    avance:       '🟩 Avancé',
    renforcement: '🔴 Renforcement',
  };
  return labels[niveau] || niveau;
}

export function getScoreColor(pct) {
  if (pct >= 80) return 'var(--semantic-success)';
  if (pct >= 50) return 'var(--semantic-warning)';
  return 'var(--semantic-danger)';
}
