/**
 * DASHBOA_RD — Admin Page Controller
 * CRUD utilisateurs + Import CSV
 */
import authService    from '../../core/services/authService.js';
import storageService from '../../core/services/storageService.js';
import { $, $$, redirectTo, toast, handleError } from '../../core/utils/utils.js';
import { ROLES, COHORTES } from '../../core/config/constants.js';

class AdminPage {
  constructor() {
    this.profile = null;
    this.users   = [];
    this.editingUserId = null;
    this.csvData = [];
    this.init();
  }

  async init() {
    try {
      const session = await authService.getSession();
      if (!session) { redirectTo('../index.html'); return; }

      this.profile = await authService.getProfile();
      if (!this.profile ||
        (this.profile.role !== ROLES.ADMIN && this.profile.role !== ROLES.FORMATEUR)) {
        toast.error('Accès non autorisé');
        redirectTo('dashboard.html');
        return;
      }

      this.renderUser();
      this.attachEvents();
      await this.loadUsers();
    } catch (e) { handleError(e, 'Admin init'); }
  }

  renderUser() {
    const { prenom, nom, role } = this.profile;
    const a = $('#userAvatar'); if (a) a.textContent = `${prenom[0]}${nom[0]}`;
    const n = $('#userName');   if (n) n.textContent = `${prenom} ${nom}`;
    const r = $('#userRole');   if (r) r.textContent = role.charAt(0).toUpperCase() + role.slice(1);
  }

  // ── Chargement & Rendu ──

  async loadUsers() {
    try {
      this.users = await storageService.getAllUsers();
      this.renderTable();
      this.renderStats();
    } catch (e) { handleError(e, 'Chargement utilisateurs'); }
  }

  renderStats() {
    const stagiaires = this.users.filter(u => u.role === 'stagiaire').length;
    const formateurs = this.users.filter(u => u.role === 'formateur').length;
    const activated  = this.users.filter(u => u.is_activated).length;
    const cohortes   = new Set(this.users.filter(u => u.cohorte).map(u => u.cohorte)).size;

    const el = id => $(id);
    if (el('#statTotal'))     el('#statTotal').textContent     = stagiaires;
    if (el('#statFormateurs')) el('#statFormateurs').textContent = formateurs;
    if (el('#statActivated')) el('#statActivated').textContent  = `${activated} / ${this.users.length}`;
    if (el('#statCohortes'))  el('#statCohortes').textContent   = cohortes;
  }

  renderTable(filtered = null) {
    const tbody = $('#usersTableBody');
    if (!tbody) return;
    const list = filtered ?? this.users;

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:var(--space-10);color:var(--text-muted);">Aucun utilisateur trouvé.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(u => {
      const roleBadge = u.role === 'admin'
        ? 'badge--danger'
        : u.role === 'formateur' ? 'badge--primary' : 'badge--success';
      const actBadge  = u.is_activated ? 'badge--activated' : 'badge--pending';
      const actLabel  = u.is_activated ? 'Activé' : 'En attente';

      return `<tr data-id="${u.id}">
        <td>${u.civilite || '—'}</td>
        <td class="admin-table__name">${u.nom || '—'}</td>
        <td>${u.prenom || '—'}</td>
        <td class="admin-table__email">${u.adresse_mail || '—'}</td>
        <td><span class="badge badge--cta">${u.cohorte || '—'}</span></td>
        <td><span class="badge ${roleBadge}">${u.role}</span></td>
        <td><span class="badge ${actBadge}">${actLabel}</span></td>
        <td class="admin-table__actions">
          <button class="btn btn-ghost btn-sm btn-edit" data-id="${u.id}" title="Modifier">
            <i data-lucide="pencil"></i>
          </button>
          <button class="btn btn-ghost btn-sm btn-delete" data-id="${u.id}" title="Supprimer">
            <i data-lucide="trash-2"></i>
          </button>
        </td>
      </tr>`;
    }).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons({ root: tbody });

    $$('.btn-edit').forEach(b => b.addEventListener('click', () => this.openEditModal(b.dataset.id)));
    $$('.btn-delete').forEach(b => b.addEventListener('click', () => this.deleteUser(b.dataset.id)));
  }

  applyFilters() {
    const cohorte = $('#filterCohorte')?.value;
    const role    = $('#filterRole')?.value;
    let filtered  = this.users;
    if (cohorte) filtered = filtered.filter(u => u.cohorte === cohorte);
    if (role)    filtered = filtered.filter(u => u.role === role);
    this.renderTable(filtered);
  }

  // ── Modal Utilisateur ──

  openModal(editing = false) {
    $('#modalBackdrop')?.classList.add('active');
    $('#userModal')?.classList.add('active');
    const t = $('#modalTitle');
    if (t) t.textContent = editing ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  closeModal() {
    $('#modalBackdrop')?.classList.remove('active');
    $('#userModal')?.classList.remove('active');
    this.editingUserId = null;
    ['formCivilite','formNom','formPrenom','formEmail','formCohorte'].forEach(id => {
      const el = $(`#${id}`); if (el) el.value = '';
    });
    const role = $('#formRole'); if (role) role.value = 'stagiaire';
  }

  openEditModal(id) {
    const u = this.users.find(x => x.id === id);
    if (!u) return;
    this.editingUserId = id;
    $('#formCivilite').value = u.civilite   || '';
    $('#formNom').value      = u.nom        || '';
    $('#formPrenom').value   = u.prenom     || '';
    $('#formEmail').value    = u.adresse_mail || '';
    $('#formCohorte').value  = u.cohorte    || '';
    $('#formRole').value     = u.role       || 'stagiaire';
    this.openModal(true);
  }

  async handleSubmit() {
    const civ   = $('#formCivilite').value;
    const nom   = $('#formNom').value.trim();
    const prenom= $('#formPrenom').value.trim();
    const email = $('#formEmail').value.trim();
    const coh   = $('#formCohorte').value;
    const role  = $('#formRole').value;

    if (!civ || !nom || !prenom || !email || !coh) {
      toast.warning('Remplissez tous les champs obligatoires.');
      return;
    }

    try {
      if (this.editingUserId) {
        await storageService.updateUser(this.editingUserId, {
          civilite: civ, nom, prenom, adresse_mail: email, cohorte: coh, role
        });
        toast.success('Utilisateur modifié.');
      } else {
        await authService.createSingleUser({ civilite: civ, nom, prenom, adresse_mail: email, cohorte: coh, role });
        toast.success('Utilisateur créé. Il devra activer son compte.');
      }
      this.closeModal();
      await this.loadUsers();
    } catch (e) { handleError(e, 'Enregistrement'); }
  }

  async deleteUser(id) {
    const u = this.users.find(x => x.id === id);
    if (!u) return;
    if (!confirm(`Supprimer ${u.prenom} ${u.nom} ?`)) return;
    try {
      await storageService.deleteUser(id);
      toast.success('Utilisateur supprimé.');
      await this.loadUsers();
    } catch (e) { handleError(e, 'Suppression'); }
  }

  // ── Modal CSV ──

  openCsvModal() {
    $('#modalBackdrop')?.classList.add('active');
    $('#csvModal')?.classList.add('active');
    this.csvData = [];
    this.resetCsvUI();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  closeCsvModal() {
    $('#modalBackdrop')?.classList.remove('active');
    $('#csvModal')?.classList.remove('active');
    this.csvData = [];
    this.resetCsvUI();
  }

  resetCsvUI() {
    const p = $('#csvPreview'); if (p) { p.style.display = 'none'; p.innerHTML = ''; }
    const e = $('#csvError');   if (e) e.style.display = 'none';
    const s = $('#csvSuccess'); if (s) s.style.display = 'none';
    const b = $('#csvSubmitBtn'); if (b) b.disabled = true;
    const c = $('#csvCount'); if (c) c.textContent = '0';
  }

  parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) throw new Error('Le fichier doit contenir un en-tête et au moins une ligne.');

    const header = lines[0].split(/[,;]/).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    const required = ['civilite','nom','prenom','adresse_mail','cohorte','role'];
    const missing = required.filter(r => !header.includes(r));
    if (missing.length) throw new Error(`Colonnes manquantes : ${missing.join(', ')}`);

    const validCohortes = Object.keys(COHORTES);
    const validRoles    = ['admin','formateur','stagiaire'];
    const validCiv      = ['M','Mme'];

    return lines.slice(1).filter(l => l.trim()).map((line, i) => {
      const vals = line.split(/[,;]/).map(v => v.trim().replace(/^["']|["']$/g, ''));
      const row  = {};
      header.forEach((h, j) => { row[h] = vals[j] || ''; });
      row._errors = [];
      if (!validCiv.includes(row.civilite))                        row._errors.push('civilité invalide');
      if (!row.nom)                                                 row._errors.push('nom vide');
      if (!row.prenom)                                              row._errors.push('prénom vide');
      if (!row.adresse_mail || !row.adresse_mail.includes('@'))     row._errors.push('email invalide');
      if (!validCohortes.includes((row.cohorte||'').toUpperCase())) row._errors.push('cohorte invalide');
      if (!validRoles.includes((row.role||'').toLowerCase()))       row._errors.push('rôle invalide');
      row.cohorte = (row.cohorte || '').toUpperCase();
      row.role    = (row.role || 'stagiaire').toLowerCase();
      return row;
    });
  }

  renderCsvPreview(data) {
    const preview    = $('#csvPreview');
    if (!preview) return;

    const validCount = data.filter(r => !r._errors.length).length;
    const errorCount = data.filter(r =>  r._errors.length).length;

    let html = '<table><thead><tr><th>#</th><th>Civ.</th><th>Nom</th><th>Prénom</th><th>Email</th><th>Cohorte</th><th>Rôle</th><th>Statut</th></tr></thead><tbody>';
    data.forEach((r, i) => {
      const ok = !r._errors.length;
      html += `<tr class="${ok ? '' : 'error'}">
        <td>${i + 1}</td>
        <td>${r.civilite}</td><td>${r.nom}</td><td>${r.prenom}</td>
        <td>${r.adresse_mail}</td><td>${r.cohorte}</td><td>${r.role}</td>
        <td>${ok
          ? '<span style="color:var(--text-success)">✓ OK</span>'
          : `<span style="color:var(--text-danger)">${r._errors.join(', ')}</span>`
        }</td>
      </tr>`;
    });
    html += '</tbody></table>';

    preview.innerHTML = html;
    preview.style.display = 'block';

    const btn   = $('#csvSubmitBtn');
    const count = $('#csvCount');
    if (btn)   btn.disabled = validCount === 0;
    if (count) count.textContent = validCount;

    if (errorCount > 0) {
      const err = $('#csvError');
      if (err) { err.textContent = `${errorCount} ligne(s) avec erreur(s) — elles seront ignorées.`; err.style.display = 'block'; }
    }

    this.csvData = data.filter(r => !r._errors.length);
  }

  async handleCsvImport() {
    if (!this.csvData.length) return;
    const btn = $('#csvSubmitBtn');
    btn.disabled = true;
    btn.classList.add('btn--loading');

    try {
      const result = await authService.importUsers(this.csvData);
      const suc    = $('#csvSuccess');
      const msg    = `${result.inserted} importé(s) • ${result.skipped} ignoré(s) (déjà existant) • ${result.errors.length} erreur(s).`;
      if (suc) { suc.textContent = msg; suc.style.display = 'block'; }
      toast.success(`${result.inserted} utilisateurs importés.`);
      setTimeout(() => { this.closeCsvModal(); this.loadUsers(); }, 2000);
    } catch (e) {
      handleError(e, 'Import CSV');
      btn.disabled = false;
      btn.classList.remove('btn--loading');
    }
  }

  handleCsvFile(file) {
    if (!file.name.match(/\.(csv|txt)$/i)) {
      toast.error('Format non supporté. Utilisez .csv ou .txt');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = this.parseCSV(e.target.result);
        this.renderCsvPreview(data);
      } catch (err) {
        const errEl = $('#csvError');
        if (errEl) { errEl.textContent = err.message; errEl.style.display = 'block'; }
      }
    };
    reader.readAsText(file, 'UTF-8');
  }

  // ── Événements ──

  attachEvents() {
    // Logout + menu mobile
    $('#logoutBtn')?.addEventListener('click', async () => { await authService.logout(); redirectTo('../index.html'); });
    const mt = $('#menuToggle'), sb = $('#sidebar'), ov = $('#sidebarOverlay');
    if (mt && sb) {
      mt.addEventListener('click', () => { sb.classList.toggle('open'); ov?.classList.toggle('active'); });
      ov?.addEventListener('click', () => { sb.classList.remove('open'); ov.classList.remove('active'); });
    }

    // Filtres
    $('#filterCohorte')?.addEventListener('change', () => this.applyFilters());
    $('#filterRole')?.addEventListener('change',    () => this.applyFilters());

    // Modal utilisateur
    $('#addUserBtn')?.addEventListener('click',  () => this.openModal(false));
    $('#modalClose')?.addEventListener('click',  () => this.closeModal());
    $('#modalCancel')?.addEventListener('click', () => this.closeModal());
    $('#modalSubmit')?.addEventListener('click', () => this.handleSubmit());
    $('#modalBackdrop')?.addEventListener('click', () => { this.closeModal(); this.closeCsvModal(); });

    // Modal CSV
    $('#importCsvBtn')?.addEventListener('click',  () => this.openCsvModal());
    $('#csvModalClose')?.addEventListener('click',  () => this.closeCsvModal());
    $('#csvModalCancel')?.addEventListener('click', () => this.closeCsvModal());
    $('#csvSubmitBtn')?.addEventListener('click',   () => this.handleCsvImport());

    // Dropzone CSV
    const dz = $('#csvDropzone');
    const fi = $('#csvFileInput');
    if (dz && fi) {
      dz.addEventListener('click', () => fi.click());
      dz.addEventListener('dragover',  e => { e.preventDefault(); dz.classList.add('dragover'); });
      dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
      dz.addEventListener('drop', e => {
        e.preventDefault(); dz.classList.remove('dragover');
        const f = e.dataTransfer.files[0]; if (f) this.handleCsvFile(f);
      });
      fi.addEventListener('change', () => { const f = fi.files[0]; if (f) this.handleCsvFile(f); });
    }
  }
}

new AdminPage();
