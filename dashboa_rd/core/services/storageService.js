/**
 * DASHBOA_RD — Storage Service
 * Gère : progression, quiz_reponses, badges, projet_final
 */
import supabaseClient from '../config/supabaseClient.js';
import { TABLES, BADGES, SCORE_SEUILS } from '../config/constants.js';

class StorageService {
  constructor() {
    this.client = supabaseClient;
  }

  // ═══ USERS (lecture) ═══

  async getAllUsers() {
    const { data, error } = await this.client
      .from(TABLES.USERS)
      .select('*')
      .order('nom');
    if (error) throw error;
    return data;
  }

  async updateUser(userId, updates) {
    const { data, error } = await this.client
      .from(TABLES.USERS)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteUser(userId) {
    const { error } = await this.client
      .from(TABLES.USERS)
      .delete()
      .eq('id', userId);
    if (error) throw error;
    return true;
  }

  // ═══ PROGRESSION ═══

  async getProgression(userId) {
    const { data, error } = await this.client
      .from(TABLES.PROGRESSION)
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  }

  async getModuleProgression(userId, moduleCode) {
    const { data, error } = await this.client
      .from(TABLES.PROGRESSION)
      .select('*')
      .eq('user_id', userId)
      .eq('module_code', moduleCode)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async saveProgression(userId, moduleCode, updates) {
    const existing = await this.getModuleProgression(userId, moduleCode);

    if (existing) {
      const { data, error } = await this.client
        .from(TABLES.PROGRESSION)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await this.client
        .from(TABLES.PROGRESSION)
        .insert({ user_id: userId, module_code: moduleCode, ...updates })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  async markSectionComplete(userId, moduleCode, sectionId) {
    const existing = await this.getModuleProgression(userId, moduleCode);
    const sections = existing?.sections_completees || [];

    if (!sections.includes(sectionId)) {
      sections.push(sectionId);
      return this.saveProgression(userId, moduleCode, {
        sections_completees: sections,
        statut: 'en_cours',
        started_at: existing?.started_at || new Date().toISOString(),
      });
    }
    return existing;
  }

  // ═══ QUIZ RÉPONSES ═══

  async saveQuizReponses(userId, moduleCode, reponses) {
    // reponses : [{ question_id, reponse_choisie, est_correcte, score_obtenu }]
    const rows = reponses.map(r => ({
      user_id:          userId,
      module_code:      moduleCode,
      question_id:      r.question_id,
      reponse_choisie:  r.reponse_choisie,
      est_correcte:     r.est_correcte,
      score_obtenu:     r.score_obtenu,
      answered_at:      new Date().toISOString(),
    }));

    const { data, error } = await this.client
      .from(TABLES.QUIZ_REPONSES)
      .insert(rows)
      .select();
    if (error) throw error;
    return data;
  }

  // ═══ BADGES ═══

  async getUserBadges(userId) {
    const { data, error } = await this.client
      .from(TABLES.BADGES)
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  }

  async awardBadge(userId, badgeCode) {
    const badgeDef = BADGES[badgeCode];
    if (!badgeDef) return null;

    // Vérifier si déjà attribué
    const { data: existing } = await this.client
      .from(TABLES.BADGES)
      .select('id')
      .eq('user_id', userId)
      .eq('badge_code', badgeCode)
      .maybeSingle();

    if (existing) return existing;

    const { data, error } = await this.client
      .from(TABLES.BADGES)
      .insert({
        user_id:             userId,
        badge_code:          badgeCode,
        badge_label:         badgeDef.label,
        condition_atteinte:  badgeDef.condition,
        obtained_at:         new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Vérifie et attribue automatiquement les badges
   * après la complétion d'un module
   */
  async checkAndAwardBadges(userId) {
    const progression = await this.getProgression(userId);

    const isValidated = (moduleCode, seuil = SCORE_SEUILS.CERTIFICATION) => {
      const p = progression.find(x => x.module_code === moduleCode);
      return p && p.statut === 'valide' && (p.score_pct || 0) >= seuil;
    };

    const awarded = [];

    if (isValidated('M1') && isValidated('M2'))
      awarded.push(await this.awardBadge(userId, 'ANALYSTE_KPI'));

    if (isValidated('M3'))
      awarded.push(await this.awardBadge(userId, 'CALCULATEUR_RH'));

    if (isValidated('M4') && isValidated('M5'))
      awarded.push(await this.awardBadge(userId, 'PILOTE_DONNEES'));

    if (isValidated('M6', 80))
      awarded.push(await this.awardBadge(userId, 'EXPERT_EXCEL'));

    if (isValidated('M7', 80))
      awarded.push(await this.awardBadge(userId, 'SPECIALISTE_METIER'));

    return awarded.filter(Boolean);
  }

  // ═══ PROJET FINAL ═══

  async getProjetFinal(userId) {
    const { data, error } = await this.client
      .from(TABLES.PROJET_FINAL)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async saveProjetFinal(userId, scores) {
    const total = (scores.l1 || 0) + (scores.l2 || 0) + (scores.l3 || 0) + (scores.l4 || 0);
    const pct = (total / 100) * 100;
    let mention = 'non_valide';
    if (pct >= 80) mention = 'tres_bien';
    else if (pct >= 70) mention = 'bien';
    else if (pct >= 60) mention = 'passable';

    const { data, error } = await this.client
      .from(TABLES.PROJET_FINAL)
      .upsert({
        user_id:          userId,
        livrable_1_score: scores.l1,
        livrable_2_score: scores.l2,
        livrable_3_score: scores.l3,
        livrable_4_score: scores.l4,
        score_total:      total,
        mention,
        submitted_at:     new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

const storageService = new StorageService();
export default storageService;
