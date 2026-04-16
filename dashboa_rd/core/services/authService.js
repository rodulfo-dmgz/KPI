/**
 * DASHBOA_RD — Auth Service
 * Gère : login, logout, session, profil, activation, CRUD users
 */
import supabaseClient from '../config/supabaseClient.js';
import { TABLES } from '../config/constants.js';

class AuthService {
  constructor() {
    this.client = supabaseClient;
  }

  // ═══ AUTH DE BASE ═══

  async login(email, password) {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async logout() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async getSession() {
    const { data: { session } } = await this.client.auth.getSession();
    return session;
  }

  async signup(email, password) {
    const { data, error } = await this.client.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
    return data;
  }

  onAuthStateChange(callback) {
    return this.client.auth.onAuthStateChange(callback);
  }

  // ═══ PROFIL & SESSION ═══

  async isAuthenticated() {
    const session = await this.getSession();
    return session !== null;
  }

  async getCurrentUser() {
    const session = await this.getSession();
    return session?.user ?? null;
  }

  /**
   * getProfileDirect() — Requête unique sans retry
   * Utilisé sur la page login pour vérifier rapidement si un profil existe.
   * Retourne null sans boucler si la table n'existe pas ou si le profil est absent.
   */
  async getProfileDirect(authUserId) {
    try {
      const { data, error } = await this.client
        .from(TABLES.USERS)
        .select('*')
        .eq('auth_id', authUserId)
        .maybeSingle();
      if (error) return null;
      return data;
    } catch {
      return null;
    }
  }

  /**
   * getProfile() — Profil depuis tb_kpi_users
   * Retry 5× + fallback email si auth_id NULL (activation en cours)
   */
  async getProfile() {
    const session = await this.getSession();
    if (!session) return null;

    const { user } = session;
    const MAX_RETRIES = 5;
    const DELAY_MS    = 400;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

      // Passe 1 : par auth_id
      const { data: byAuthId, error: err1 } = await this.client
        .from(TABLES.USERS)
        .select('*')
        .eq('auth_id', user.id)
        .maybeSingle();

      // 404 = table inexistante → ne pas boucler
      if (err1?.code === '42P01' || err1?.message?.includes('does not exist')) {
        console.warn('[AuthService] Table tb_kpi_users introuvable. Créez-la via supabase_setup.sql');
        return null;
      }
      if (err1 && attempt < MAX_RETRIES) { await this._wait(DELAY_MS * attempt); continue; }
      if (err1) throw err1;
      if (byAuthId) return byAuthId;

      // Passe 2 : fallback par email
      const { data: byEmail, error: err2 } = await this.client
        .from(TABLES.USERS)
        .select('*')
        .ilike('adresse_mail', user.email.trim())
        .maybeSingle();

      if (err2?.code === '42P01') return null;
      if (err2 && attempt < MAX_RETRIES) { await this._wait(DELAY_MS * attempt); continue; }
      if (err2) throw err2;

      if (!byEmail) {
        if (attempt < MAX_RETRIES) { await this._wait(DELAY_MS * attempt); continue; }
        throw new Error('Aucun profil trouvé. Contactez votre formateur.');
      }

      // Liaison automatique auth_id
      await this.client
        .from(TABLES.USERS)
        .update({ auth_id: user.id, is_activated: true })
        .eq('id', byEmail.id);

      return { ...byEmail, auth_id: user.id, is_activated: true };
    }

    throw new Error('Impossible de charger le profil. Réessayez dans quelques secondes.');
  }

  // ═══ VÉRIFICATIONS ═══

  async checkEmailExists(email) {
    const { data, error } = await this.client
      .from(TABLES.USERS)
      .select('id, prenom, is_activated')
      .ilike('adresse_mail', email.trim())
      .maybeSingle();
    if (error) throw error;
    return data; // null si non trouvé
  }

  // ═══ GESTION USERS (admin) ═══

  async getAllUsers(filters = {}) {
    let query = this.client
      .from(TABLES.USERS)
      .select('*')
      .order('nom');

    if (filters.cohorte) query = query.eq('cohorte', filters.cohorte);
    if (filters.role)    query = query.eq('role',    filters.role);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createSingleUser({ civilite, nom, prenom, adresse_mail, cohorte, role = 'stagiaire' }) {
    const existing = await this.checkEmailExists(adresse_mail);
    if (existing) throw new Error(`L'email ${adresse_mail} est déjà enregistré.`);

    const { data, error } = await this.client
      .from(TABLES.USERS)
      .insert({
        civilite,
        nom:          nom.toUpperCase().trim(),
        prenom:       prenom.trim(),
        adresse_mail: adresse_mail.toLowerCase().trim(),
        cohorte,
        role,
        is_activated: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async importUsers(users) {
    const results = { inserted: 0, skipped: 0, errors: [] };

    for (const user of users) {
      try {
        const existing = await this.checkEmailExists(user.adresse_mail);
        if (existing) { results.skipped++; continue; }

        const { error } = await this.client
          .from(TABLES.USERS)
          .insert({
            civilite:     user.civilite,
            nom:          (user.nom || '').toUpperCase().trim(),
            prenom:       (user.prenom || '').trim(),
            adresse_mail: (user.adresse_mail || '').toLowerCase().trim(),
            cohorte:      user.cohorte,
            role:         user.role || 'stagiaire',
            is_activated: false,
          });

        if (error) throw error;
        results.inserted++;
      } catch (err) {
        results.errors.push({ email: user.adresse_mail, message: err.message });
      }
    }

    return results;
  }

  async updateUser(userId, updates) {
    if (updates.nom)    updates.nom    = updates.nom.toUpperCase().trim();
    if (updates.prenom) updates.prenom = updates.prenom.trim();

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

  async toggleUserStatus(userId, isActivated) {
    const { data, error } = await this.client
      .from(TABLES.USERS)
      .update({ is_activated: isActivated, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async resendConfirmation(email) {
    const { data, error } = await this.client.auth.resend({
      type:  'signup',
      email: email.trim().toLowerCase(),
    });
    if (error) throw error;
    return data;
  }

  async resetPasswordForUser(email) {
    const { data, error } = await this.client.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/pages/reset-password.html` }
    );
    if (error) throw error;
    return data;
  }

  _wait(ms) { return new Promise(r => setTimeout(r, ms)); }
}

const authService = new AuthService();
export default authService;