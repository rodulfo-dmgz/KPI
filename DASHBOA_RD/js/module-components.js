/**
 * DASHBOA_RD — Composants réutilisables pour les modules
 * ─────────────────────────────────────────────────────────────────
 * Vidéo YouTube premium + Ressources téléchargeables
 * Import dans chaque module : import { renderVideo, renderRessources } from '../../js/module-components.js';
 */

/**
 * Génère le HTML d'un lecteur YouTube premium avec lazy loading.
 *
 * @param {Object} config
 * @param {string} config.videoId       - ID YouTube (ex: "dQw4w9WgXcQ")
 * @param {string} config.titre         - Titre affiché sur le placeholder
 * @param {string} config.duree         - Durée affichée (ex: "8 min")
 * @param {string} config.description   - Description courte sous le player
 * @param {string} [config.thumbQuality] - 'maxresdefault' | 'hqdefault' (défaut: 'hqdefault')
 * @returns {string} HTML à injecter
 */
export function renderVideo({ videoId, titre, duree, description, thumbQuality = 'hqdefault' }) {
  if (!videoId) return '';

  const thumbUrl = `https://img.youtube.com/vi/${videoId}/${thumbQuality}.jpg`;
  const ytUrl    = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&cc_load_policy=1`;

  return `
    <div class="video-section" id="video-${videoId}">
      <div class="video-placeholder" onclick="loadYouTubeVideo('${videoId}', '${ytUrl}')"
        role="button" tabindex="0" aria-label="Lancer la vidéo : ${titre}"
        onkeydown="if(event.key==='Enter'||event.key===' ')loadYouTubeVideo('${videoId}','${ytUrl}')">
        <img src="${thumbUrl}"
          alt="Miniature : ${titre}"
          class="video-placeholder__thumb"
          onerror="this.style.display='none'">
        <div class="video-placeholder__overlay">
          <div class="video-placeholder__play" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <p class="video-placeholder__title">${titre}</p>
          ${duree ? `<span class="video-placeholder__duration">▶ ${duree}</span>` : ''}
        </div>
      </div>
      <div class="video-meta">
        <div class="video-meta__info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${duree ? `<span>${duree}</span>` : ''}
          ${description ? `<span style="color:var(--border-default);">|</span><span>${description}</span>` : ''}
        </div>
        <div class="video-meta__actions">
          <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener"
            class="btn btn-ghost btn-sm" aria-label="Ouvrir sur YouTube">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;color:#ff0000;">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Ouvrir sur YouTube
          </a>
        </div>
      </div>
    </div>`;
}

/**
 * Charge le player YouTube dans le placeholder (lazy).
 * Appelé au clic sur le placeholder.
 */
window.loadYouTubeVideo = function(videoId, ytUrl) {
  const placeholder = document.getElementById(`video-${videoId}`);
  if (!placeholder) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'video-wrapper';

  const iframe = document.createElement('iframe');
  iframe.src              = ytUrl;
  iframe.title            = 'Vidéo de formation DASHBOA_RD';
  iframe.allow            = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen  = true;
  iframe.loading          = 'lazy';

  wrapper.appendChild(iframe);

  // Remplacer le placeholder par le player
  const ph = placeholder.querySelector('.video-placeholder');
  if (ph) ph.replaceWith(wrapper);

  if (typeof lucide !== 'undefined') lucide.createIcons({ root: placeholder });
};

// ─────────────────────────────────────────────────────────────────

/**
 * Génère le HTML de la section ressources téléchargeables.
 *
 * @param {Array} ressources - tableau d'objets ressource
 * Chaque ressource :
 * {
 *   nom:      string     - Nom affiché
 *   type:     string     - 'pdf' | 'xlsx' | 'pptx' | 'docx' | 'zip' | 'link' | 'video'
 *   url:      string     - URL de téléchargement ou lien externe (null = bientôt)
 *   taille:   string     - ex: '2,4 Mo' (optionnel)
 *   desc:     string     - description courte (optionnel)
 * }
 * @returns {string} HTML
 */
export function renderRessources(ressources = []) {
  if (!ressources.length) return '';

  const ICONS = {
    pdf:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    xlsx:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
    pptx:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
    docx:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    zip:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    link:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
  };

  const DL_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
  const EXT_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

  const cards = ressources.map(r => {
    const isLink    = r.type === 'link';
    const isComming = !r.url;
    const icon      = ICONS[r.type] || ICONS.link;
    const tag       = isLink ? 'a' : (r.url ? 'a' : 'div');
    const attrs     = r.url
      ? `href="${r.url}" ${isLink ? 'target="_blank" rel="noopener"' : 'download'}`
      : '';

    return `
      <${tag} class="ressource-card ressource-card--${r.type}${isComming ? ' ressource-card--coming' : ''}"
        ${attrs} aria-label="${isComming ? 'Bientôt disponible : ' : ''}${r.nom}">
        <div class="ressource-card__icon" aria-hidden="true">${icon}</div>
        <div class="ressource-card__body">
          <div class="ressource-card__name">${r.nom}</div>
          <div class="ressource-card__meta">
            <span style="text-transform:uppercase;font-weight:700;letter-spacing:0.05em;">${r.type.toUpperCase()}</span>
            ${r.taille ? `<span>·</span><span>${r.taille}</span>` : ''}
            ${r.desc   ? `<span>·</span><span>${r.desc}</span>`   : ''}
          </div>
        </div>
        ${!isComming ? `<div class="ressource-card__dl" aria-hidden="true">${isLink ? EXT_ICON : DL_ICON}</div>` : ''}
        ${isComming  ? `<span class="ressource-badge-soon">Bientôt</span>` : ''}
      </${tag}>`;
  }).join('');

  return `<div class="ressources-grid">${cards}</div>`;
}
