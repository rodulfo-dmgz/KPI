-- ═══════════════════════════════════════════════════════════════
-- DASHBOA_RD — Tables Test de Positionnement
-- ═══════════════════════════════════════════════════════════════

-- ── Table principale : résultats par stagiaire ────────────────────
CREATE TABLE IF NOT EXISTS public.tb_kpi_testpositionnement (
  id                    uuid        NOT NULL DEFAULT gen_random_uuid(),
  user_id               uuid        NOT NULL,
  cohorte               varchar(10) NULL,

  -- Timing
  started_at            timestamptz NOT NULL DEFAULT now(),
  completed_at          timestamptz NULL,
  duree_secondes        integer     NULL,   -- temps réel mis par le stagiaire

  -- Scores globaux
  score_total           integer     NOT NULL DEFAULT 0,  -- /25
  score_kpi             integer     NOT NULL DEFAULT 0,  -- /15
  score_tdb             integer     NOT NULL DEFAULT 0,  -- /10
  score_pct             numeric(5,2) NULL,               -- % global

  -- Niveau adaptatif calculé automatiquement
  -- < 50% → renforcement | 50-80% → standard | > 80% → avancé
  niveau_recommande     varchar(20) NULL,

  -- Forces et axes de progression (calculés côté client, stockés en JSON)
  points_forts          text[]      NULL DEFAULT '{}',   -- ex: ['Calculs de taux', 'KPI financiers']
  axes_progression      text[]      NULL DEFAULT '{}',   -- ex: ['Leading/Lagging', 'Balanced Scorecard']

  -- PDF
  pdf_generated         boolean     NOT NULL DEFAULT false,
  pdf_url               text        NULL,

  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NULL,

  CONSTRAINT tb_kpi_testpositionnement_pkey PRIMARY KEY (id),
  CONSTRAINT tb_kpi_testpositionnement_user_id_key UNIQUE (user_id),  -- 1 test par stagiaire
  CONSTRAINT tb_kpi_testpositionnement_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES tb_kpi_users(id) ON DELETE CASCADE,
  CONSTRAINT tb_kpi_testpositionnement_score_total_check
    CHECK (score_total >= 0 AND score_total <= 25),
  CONSTRAINT tb_kpi_testpositionnement_score_kpi_check
    CHECK (score_kpi >= 0 AND score_kpi <= 15),
  CONSTRAINT tb_kpi_testpositionnement_score_tdb_check
    CHECK (score_tdb >= 0 AND score_tdb <= 10),
  CONSTRAINT tb_kpi_testpositionnement_niveau_check CHECK (
    niveau_recommande IS NULL OR niveau_recommande = ANY (
      ARRAY['renforcement','standard','avance']
    )
  )
) TABLESPACE pg_default;

-- ── Table détail : 1 ligne par réponse (25 lignes par stagiaire) ──
CREATE TABLE IF NOT EXISTS public.tb_kpi_test_reponses (
  id                    uuid        NOT NULL DEFAULT gen_random_uuid(),
  test_id               uuid        NOT NULL,   -- FK → tb_kpi_testpositionnement.id
  user_id               uuid        NOT NULL,   -- dénormalisé pour requêtes rapides

  question_num          integer     NOT NULL,   -- 1 à 25
  section               varchar(5)  NOT NULL,   -- 'KPI' ou 'TDB'
  type_question         varchar(20) NOT NULL,   -- 'vrai_faux' | 'choix_unique' | 'cases_cocher' | 'calcul'

  -- Réponse du stagiaire (tableau pour cases à cocher)
  reponse_stagiaire     text[]      NOT NULL DEFAULT '{}',  -- ex: ['A'] ou ['A','B','D']
  reponse_correcte      text[]      NOT NULL DEFAULT '{}',  -- ex: ['B']

  est_correcte          boolean     NOT NULL DEFAULT false,
  points_obtenus        numeric(3,1) NOT NULL DEFAULT 0,    -- 0 ou 1 (0.5 possible si partiel)

  -- Pour l'affichage dans le PDF
  enonce_court          text        NULL,   -- version courte de la question
  explication           text        NULL,   -- explication pédagogique

  answered_at           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT tb_kpi_test_reponses_pkey PRIMARY KEY (id),
  CONSTRAINT tb_kpi_test_reponses_user_question_key
    UNIQUE (user_id, question_num),   -- 1 réponse par question par stagiaire
  CONSTRAINT tb_kpi_test_reponses_test_id_fkey
    FOREIGN KEY (test_id) REFERENCES tb_kpi_testpositionnement(id) ON DELETE CASCADE,
  CONSTRAINT tb_kpi_test_reponses_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES tb_kpi_users(id) ON DELETE CASCADE,
  CONSTRAINT tb_kpi_test_reponses_question_num_check
    CHECK (question_num >= 1 AND question_num <= 25),
  CONSTRAINT tb_kpi_test_reponses_section_check
    CHECK (section IN ('KPI','TDB')),
  CONSTRAINT tb_kpi_test_reponses_type_check
    CHECK (type_question IN ('vrai_faux','choix_unique','cases_cocher','calcul'))
) TABLESPACE pg_default;

-- ── Index pour les requêtes fréquentes ───────────────────────────
CREATE INDEX IF NOT EXISTS idx_testpositionnement_user
  ON tb_kpi_testpositionnement(user_id);
CREATE INDEX IF NOT EXISTS idx_testpositionnement_cohorte
  ON tb_kpi_testpositionnement(cohorte);
CREATE INDEX IF NOT EXISTS idx_test_reponses_test_id
  ON tb_kpi_test_reponses(test_id);
CREATE INDEX IF NOT EXISTS idx_test_reponses_user_id
  ON tb_kpi_test_reponses(user_id);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE tb_kpi_testpositionnement ENABLE ROW LEVEL SECURITY;
ALTER TABLE tb_kpi_test_reponses      ENABLE ROW LEVEL SECURITY;

-- Stagiaire : voir et modifier son propre test
CREATE POLICY "test_select_own" ON tb_kpi_testpositionnement
  FOR SELECT USING (
    user_id = (SELECT id FROM tb_kpi_users WHERE auth_id = auth.uid())
  );
CREATE POLICY "test_insert_own" ON tb_kpi_testpositionnement
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM tb_kpi_users WHERE auth_id = auth.uid())
  );
CREATE POLICY "test_update_own" ON tb_kpi_testpositionnement
  FOR UPDATE USING (
    user_id = (SELECT id FROM tb_kpi_users WHERE auth_id = auth.uid())
  );

CREATE POLICY "reponses_select_own" ON tb_kpi_test_reponses
  FOR SELECT USING (
    user_id = (SELECT id FROM tb_kpi_users WHERE auth_id = auth.uid())
  );
CREATE POLICY "reponses_insert_own" ON tb_kpi_test_reponses
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM tb_kpi_users WHERE auth_id = auth.uid())
  );

-- Admin/Formateur : tout voir
CREATE POLICY "test_admin_all" ON tb_kpi_testpositionnement
  FOR ALL USING (
    (SELECT role FROM tb_kpi_users WHERE auth_id = auth.uid()) IN ('admin','formateur')
  );
CREATE POLICY "reponses_admin_all" ON tb_kpi_test_reponses
  FOR ALL USING (
    (SELECT role FROM tb_kpi_users WHERE auth_id = auth.uid()) IN ('admin','formateur')
  );

-- ── Vue utile pour l'admin ────────────────────────────────────────
CREATE OR REPLACE VIEW v_test_positionnement_summary AS
SELECT
  u.prenom,
  u.nom,
  u.cohorte,
  t.score_total,
  t.score_kpi,
  t.score_tdb,
  t.score_pct,
  t.niveau_recommande,
  t.duree_secondes,
  t.completed_at,
  t.points_forts,
  t.axes_progression
FROM tb_kpi_testpositionnement t
JOIN tb_kpi_users u ON u.id = t.user_id
ORDER BY t.completed_at DESC;

COMMENT ON TABLE tb_kpi_testpositionnement IS
  'Test de positionnement KPI & Tableaux de bord — 25 questions, 1 test par stagiaire';
COMMENT ON TABLE tb_kpi_test_reponses IS
  'Détail des réponses au test de positionnement — 25 lignes par stagiaire';
