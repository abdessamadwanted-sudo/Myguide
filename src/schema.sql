-- Supplement Intelligence — schéma PostgreSQL (MVP : Database, Détails, Comparaison)
-- Les modules Authenticity / Tracker / Advisor sont prévus (tables marquées PLANNED).

CREATE TYPE supplement_kind AS ENUM ('nutriment_essentiel','supplément_performance','protéine_alimentaire','plante');
CREATE TYPE evidence_level  AS ENUM ('forte','modérée','limitée','insuffisante');
CREATE TYPE cert_status     AS ENUM ('non_déclarée','déclarée_non_vérifiée','vérifiée_source_officielle');

-- Fiche scientifique d'un ingrédient
CREATE TABLE supplement (
  id               TEXT PRIMARY KEY CHECK (id ~ '^[a-z0-9-]+$'),
  name             TEXT NOT NULL,
  name_ar          TEXT,
  category         TEXT NOT NULL,
  kind             supplement_kind NOT NULL,
  intended_use     TEXT,
  mechanism        TEXT,
  evidence_level   evidence_level NOT NULL,
  evidence_note    TEXT,
  studied_intake   TEXT,
  upper_limit      TEXT,
  timing           TEXT,
  contamination    TEXT,
  anti_doping      TEXT,
  clinical_check   TEXT,
  reviewed_on      DATE NOT NULL,
  is_example       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE supplement_synonym (
  supplement_id TEXT REFERENCES supplement(id) ON DELETE CASCADE,
  synonym       TEXT NOT NULL,
  PRIMARY KEY (supplement_id, synonym)
);

CREATE TABLE supplement_form (
  id            SERIAL PRIMARY KEY,
  supplement_id TEXT REFERENCES supplement(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,       -- ex. Glycinate, Citrate, Oxyde
  note          TEXT
);

-- Listes (bénéfices, allégations non prouvées, effets, contre-indications, interactions, allergènes, groupes)
CREATE TABLE supplement_fact (
  id            SERIAL PRIMARY KEY,
  supplement_id TEXT REFERENCES supplement(id) ON DELETE CASCADE,
  fact_type     TEXT NOT NULL CHECK (fact_type IN
                 ('benefit','unproven','may_benefit','avoid','side_effect','contraindication','interaction','allergen')),
  text          TEXT NOT NULL
);

CREATE TABLE source (
  id            SERIAL PRIMARY KEY,
  supplement_id TEXT REFERENCES supplement(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  url           TEXT NOT NULL CHECK (url ~ '^https://'),
  accessed_on   DATE
);

-- Produit commercial
CREATE TABLE product (
  id                     TEXT PRIMARY KEY,
  ingredient_id          TEXT REFERENCES supplement(id),
  brand                  TEXT NOT NULL,
  name                   TEXT NOT NULL,
  gtin                   TEXT CHECK (gtin ~ '^[0-9]{8}$|^[0-9]{12,14}$'),
  price_mad              NUMERIC(10,2) CHECK (price_mad > 0),
  net_weight_g           NUMERIC(10,2) CHECK (net_weight_g > 0),
  serving_g              NUMERIC(8,2)  CHECK (serving_g > 0),
  protein_per_serving_g  NUMERIC(8,2),
  creatine_per_serving_g NUMERIC(8,2),
  sugar_per_serving_g    NUMERIC(8,2),
  kcal_per_serving       NUMERIC(8,2),
  ingredients_text       TEXT,
  proprietary_blend      BOOLEAN NOT NULL DEFAULT FALSE,
  gmp_claim              BOOLEAN NOT NULL DEFAULT FALSE,   -- GMP ≠ test indépendant de chaque lot
  coa_available          BOOLEAN NOT NULL DEFAULT FALSE,
  cert_program           TEXT,
  cert_status            cert_status NOT NULL DEFAULT 'non_déclarée',
  cert_verified_url      TEXT,                              -- lien vers la base officielle (NSF / Informed Sport)
  seller                 TEXT,
  seller_authorized      BOOLEAN,                           -- NULL = inconnu
  is_example             BOOLEAN NOT NULL DEFAULT TRUE,
  CHECK (serving_g <= net_weight_g),
  CHECK (protein_per_serving_g IS NULL OR protein_per_serving_g <= serving_g),
  CHECK (creatine_per_serving_g IS NULL OR creatine_per_serving_g <= serving_g),
  CHECK (cert_status <> 'vérifiée_source_officielle' OR cert_verified_url IS NOT NULL)
);

CREATE TABLE product_allergen (
  product_id TEXT REFERENCES product(id) ON DELETE CASCADE,
  allergen   TEXT NOT NULL,
  PRIMARY KEY (product_id, allergen)
);

-- Vue de comparaison : NULL quand l'information manque
CREATE VIEW product_comparison AS
SELECT p.*,
  (p.net_weight_g / p.serving_g)                                   AS servings,
  p.price_mad / NULLIF(p.net_weight_g / p.serving_g, 0)            AS price_per_serving,
  100.0 * p.protein_per_serving_g / p.serving_g                    AS protein_pct,
  (p.price_mad / NULLIF(p.net_weight_g / p.serving_g, 0))
     / NULLIF(p.protein_per_serving_g, 0) * 25                     AS price_per_25g_protein,
  p.price_mad / NULLIF(p.creatine_per_serving_g * p.net_weight_g / p.serving_g, 0) AS price_per_g_creatine
FROM product p;

-- PLANNED : authenticity_check, supplement_log, user_supplement_profile, interaction_alert
