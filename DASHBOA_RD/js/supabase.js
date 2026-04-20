/**
 * DASHBOA_RD — Client Supabase
 * ─────────────────────────────────────────────────────────────────
 * Schéma aligné sur la base réelle :
 *   tb_kpi_users        → profils stagiaires / formateurs / admins
 *   tb_kpi_progression  → progression par module (toutes cohortes)
 *   tb_kpi_badges       → badges obtenus
 *   tb_kpi_projet_final → évaluation finale
 *   tb_kpi_quiz_reponses → réponses individuelles aux quiz
 * ─────────────────────────────────────────────────────────────────
 */

const SUPABASE_URL      = 'https://iomzcbmyzjwtswrkvxqk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbXpjYm15emp3dHN3cmt2eHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjM4MTAsImV4cCI6MjA4NTc5OTgxMH0.ap4Fk6pxGZgVSAdb6krWbv8CM-Dzw0ZQRcsKPKScSVw';

const { createClient } = window.supabase;

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: true,
  },
});

// ═══════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════

export async function signIn(email, password) {
  return supabaseClient.auth.signInWithPassword({
    email:    email.trim().toLowerCase(),
    password,
  });
}

export async function signOut() {
  return supabaseClient.auth.signOut();
}

export async function getSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  return session;
}

export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(callback);
  return subscription;
}

// ═══════════════════════════════════════════════════════════════
// PROFIL UTILISATEUR  (tb_kpi_users)
// Colonnes réelles :
//   id, auth_id, civilite, nom, prenom, adresse_mail,
//   cohorte, role, is_activated, niveau_adaptatif,
//   score_diagnostic, created_at, updated_at
// ═══════════════════════════════════════════════════════════════

export async function getUserProfile(authId) {
  const { data, error } = await supabaseClient
    .from('tb_kpi_users')
    .select('*')
    .eq('auth_id', authId)   // colonne réelle = auth_id (pas auth_user_id)
    .single();

  if (error || !data) return { data: null, error };

  // Normalisation → objet attendu par shell.js et auth.js
  const profile = {
    id:             data.id,
    auth_id:        data.auth_id,

    // Identité
    civilite:       data.civilite     || '',
    nom:            data.nom          || '',
    prenom:         data.prenom       || '',
    email:          data.adresse_mail || '',   // alias pour compatibilité

    // Rôle & cohorte
    role:           data.role         || 'stagiaire',
    cohorte:        data.cohorte      || null,
    specialisation: data.cohorte      || null, // affiché dans la sidebar

    // Compte
    is_active:      data.is_activated ?? false,  // alias

    // Parcours adaptatif
    niveau_adaptatif: data.niveau_adaptatif || null,
    score_diagnostic: data.score_diagnostic || null,

    // Timestamps
    created_at: data.created_at,
    updated_at: data.updated_at,
  };

  return { data: profile, error: null };
}

export async function updateLastLogin(userId) {
  // la table n'a pas de colonne last_login_at → updated_at fait l'affaire
  await supabaseClient
    .from('tb_kpi_users')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', userId);
}

// ═══════════════════════════════════════════════════════════════
// PROGRESSION  (tb_kpi_progression)
// Colonnes réelles :
//   id, user_id, module_code, statut, score_pct,
//   niveau_adaptatif, sections_completees,
//   started_at, completed_at, created_at, updated_at
//
// Convention module_code :  COHORTE_M<num>
//   Ex : "ARH_M1", "AC_M3", "AD_M7", "SA_M2"
//
// statut enum : non_commence | en_cours | termine | valide
// ═══════════════════════════════════════════════════════════════

/** Toute la progression d'un utilisateur (toutes cohortes) */
export async function getProgression(userId) {
  const { data, error } = await supabaseClient
    .from('tb_kpi_progression')
    .select('*')
    .eq('user_id', userId)
    .order('module_code', { ascending: true });

  return { data: data || [], error };
}

/** Progression filtrée sur une cohorte (ex : "ARH") */
export async function getProgressionByCohorte(userId, cohorte) {
  const { data, error } = await supabaseClient
    .from('tb_kpi_progression')
    .select('*')
    .eq('user_id', userId)
    .like('module_code', `${cohorte.toUpperCase()}_%`);

  return { data: data || [], error };
}

/**
 * Upsert progression après un quiz.
 * Compatible avec tous les modules de toutes les cohortes.
 *
 * @param {string} userId
 * @param {string} cohorte    "ARH" | "AC" | "AD" | "SA"
 * @param {number} moduleNum  1 à 7
 * @param {number} scorePct   0 à 100
 * @param {string[]} sections sections complétées (optionnel)
 */
export async function upsertProgression(userId, cohorte, moduleNum, scorePct, sections = []) {
  const moduleCode = `${cohorte.toUpperCase()}_M${moduleNum}`;
  const now        = new Date().toISOString();
  const statut     = scorePct >= 70 ? 'valide' : 'termine';

  const { data, error } = await supabaseClient
    .from('tb_kpi_progression')
    .upsert({
      user_id:             userId,
      module_code:         moduleCode,
      statut,
      score_pct:           scorePct,
      sections_completees: sections,
      completed_at:        now,
      updated_at:          now,
    }, { onConflict: 'user_id,module_code' })
    .select()
    .single();

  return { data, error };
}

/** Marque un module comme démarré (en_cours) */
export async function startModule(userId, cohorte, moduleNum) {
  const moduleCode = `${cohorte.toUpperCase()}_M${moduleNum}`;
  const now        = new Date().toISOString();

  const { data, error } = await supabaseClient
    .from('tb_kpi_progression')
    .upsert({
      user_id:    userId,
      module_code: moduleCode,
      statut:     'en_cours',
      started_at: now,
      updated_at: now,
    }, { onConflict: 'user_id,module_code', ignoreDuplicates: true })
    .select()
    .single();

  return { data, error };
}

// ═══════════════════════════════════════════════════════════════
// QUIZ RÉPONSES  (tb_kpi_quiz_reponses)
// Colonnes : id, user_id, module_code, question_id,
//   reponse_choisie (A/B/C/D), est_correcte,
//   score_obtenu, answered_at
// ═══════════════════════════════════════════════════════════════

/**
 * Enregistre UNE réponse au quiz.
 * Appeler une fois par question avant de soumettre le quiz complet.
 */
export async function saveQuizReponse(userId, cohorte, moduleNum, questionId, reponse, estCorrecte, scoreObtenu = 0) {
  const moduleCode = `${cohorte.toUpperCase()}_M${moduleNum}`;

  const { data, error } = await supabaseClient
    .from('tb_kpi_quiz_reponses')
    .insert({
      user_id:         userId,
      module_code:     moduleCode,
      question_id:     questionId,
      reponse_choisie: String(reponse).toUpperCase().charAt(0),
      est_correcte:    estCorrecte,
      score_obtenu:    scoreObtenu,
      answered_at:     new Date().toISOString(),
    });

  return { data, error };
}

// ═══════════════════════════════════════════════════════════════
// BADGES  (tb_kpi_badges)
// Colonnes : id, user_id, badge_code, badge_label,
//   condition_atteinte, obtained_at
// ═══════════════════════════════════════════════════════════════

export async function getBadges(userId) {
  const { data, error } = await supabaseClient
    .from('tb_kpi_badges')
    .select('*')
    .eq('user_id', userId)
    .order('obtained_at', { ascending: false });

  return { data: data || [], error };
}

/**
 * Attribue un badge (ignoré si déjà obtenu)
 * badge_code ex : "ARH_B1", "AC_B3", "SA_CERT", "AD_GREEN"
 */
export async function awardBadge(userId, badgeCode, badgeLabel, condition = '') {
  const { data, error } = await supabaseClient
    .from('tb_kpi_badges')
    .upsert({
      user_id:            userId,
      badge_code:         badgeCode,
      badge_label:        badgeLabel,
      condition_atteinte: condition,
      obtained_at:        new Date().toISOString(),
    }, {
      onConflict:       'user_id,badge_code',
      ignoreDuplicates: true,
    })
    .select()
    .single();

  return { data, error };
}

// ═══════════════════════════════════════════════════════════════
// PROJET FINAL  (tb_kpi_projet_final)
// ═══════════════════════════════════════════════════════════════

export async function getProjetFinal(userId) {
  const { data, error } = await supabaseClient
    .from('tb_kpi_projet_final')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

// ═══════════════════════════════════════════════════════════════
// HELPER — Résumé progression pour le dashboard
// ═══════════════════════════════════════════════════════════════

/**
 * Retourne un résumé de progression pour afficher dans le dashboard.
 * Combine tb_kpi_progression + tb_kpi_badges pour une cohorte donnée.
 */
export async function getProgressionSummary(userId, cohorte) {
  const TOTAL = 7;

  const [progResult, badgesResult] = await Promise.all([
    getProgressionByCohorte(userId, cohorte),
    getBadges(userId),
  ]);

  const progs  = progResult.data   || [];
  const badges = badgesResult.data || [];

  const valides  = progs.filter(p => p.statut === 'valide');
  const scores   = progs
    .filter(p => p.score_pct !== null)
    .map(p => parseFloat(p.score_pct));
  const scoreMoy = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  return {
    modulesValides:  valides.length,
    totalModules:    TOTAL,
    progressionPct:  Math.round((valides.length / TOTAL) * 100),
    scoreMoyen:      scoreMoy,
    badgesCount:     badges.filter(b => b.badge_code.startsWith(`${cohorte}_`)).length,
    progression:     progs,
    badges,
  };
}

export default supabaseClient;
