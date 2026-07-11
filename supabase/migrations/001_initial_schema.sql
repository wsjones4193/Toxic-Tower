-- ============================================================
-- The Toxic Tower Fantasy Football — Initial Schema
-- All tables prefixed with tt_ to avoid conflicts in shared Supabase projects
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- tt_TAGS
-- ============================================================
CREATE TABLE tt_tags (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- tt_ARTICLES
-- ============================================================
CREATE TABLE tt_articles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  excerpt             TEXT,
  content             TEXT NOT NULL DEFAULT '',
  featured_image_url  TEXT,
  published           BOOLEAN NOT NULL DEFAULT FALSE,
  published_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tt_articles_published_at ON tt_articles (published_at DESC) WHERE published = TRUE;
CREATE INDEX idx_tt_articles_slug ON tt_articles (slug);

-- ============================================================
-- tt_ARTICLE_TAGS (junction)
-- ============================================================
CREATE TABLE tt_article_tags (
  article_id  UUID NOT NULL REFERENCES tt_articles(id) ON DELETE CASCADE,
  tag_id      UUID NOT NULL REFERENCES tt_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE INDEX idx_tt_article_tags_tag_id ON tt_article_tags (tag_id);

-- ============================================================
-- tt_PLAYERS
-- ============================================================
CREATE TABLE tt_players (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  position      TEXT NOT NULL CHECK (position IN ('QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DST')),
  team          TEXT NOT NULL DEFAULT '',
  bye_week      INTEGER,
  rank          INTEGER NOT NULL DEFAULT 999,
  tier          INTEGER NOT NULL DEFAULT 1,
  underdog_id   TEXT,
  public_note   TEXT,
  private_note  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tt_players_position ON tt_players (position);
CREATE INDEX idx_tt_players_rank ON tt_players (rank);

-- ============================================================
-- tt_RANKING_LISTS
-- ============================================================
CREATE TABLE tt_ranking_lists (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position    TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- tt_RANKING_PLAYERS (live/current rankings)
-- ============================================================
CREATE TABLE tt_ranking_players (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ranking_list_id  UUID NOT NULL REFERENCES tt_ranking_lists(id) ON DELETE CASCADE,
  player_id        UUID NOT NULL REFERENCES tt_players(id) ON DELETE CASCADE,
  rank             INTEGER NOT NULL,
  tier             INTEGER NOT NULL DEFAULT 1,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ranking_list_id, player_id)
);

CREATE INDEX idx_tt_ranking_players_list ON tt_ranking_players (ranking_list_id, rank);

-- ============================================================
-- tt_RANKING_VERSIONS (snapshots)
-- ============================================================
CREATE TABLE tt_ranking_versions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ranking_list_id  UUID NOT NULL REFERENCES tt_ranking_lists(id) ON DELETE CASCADE,
  version_number   INTEGER NOT NULL,
  change_summary   TEXT,
  admin_user       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (ranking_list_id, version_number)
);

CREATE INDEX idx_tt_ranking_versions_list ON tt_ranking_versions (ranking_list_id, created_at DESC);

-- ============================================================
-- tt_RANKING_VERSION_PLAYERS (snapshot players)
-- ============================================================
CREATE TABLE tt_ranking_version_players (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ranking_version_id  UUID NOT NULL REFERENCES tt_ranking_versions(id) ON DELETE CASCADE,
  player_id           UUID NOT NULL REFERENCES tt_players(id) ON DELETE CASCADE,
  rank                INTEGER NOT NULL,
  tier                INTEGER NOT NULL DEFAULT 1,
  previous_rank       INTEGER,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tt_rvp_version ON tt_ranking_version_players (ranking_version_id);

-- ============================================================
-- SEED DEFAULT TAGS
-- ============================================================
INSERT INTO tt_tags (name, slug) VALUES
  ('Best Ball',   'best-ball'),
  ('Dynasty',     'dynasty'),
  ('Redraft',     'redraft'),
  ('DFS',         'dfs'),
  ('NFL Draft',   'nfl-draft'),
  ('Rankings',    'rankings'),
  ('Injuries',    'injuries'),
  ('Strategy',    'strategy');

-- ============================================================
-- SEED DEFAULT RANKING LISTS
-- ============================================================
INSERT INTO tt_ranking_lists (position, name) VALUES
  ('OVERALL', 'Overall Rankings'),
  ('QB',      'QB Rankings'),
  ('RB',      'RB Rankings'),
  ('WR',      'WR Rankings'),
  ('TE',      'TE Rankings'),
  ('FLEX',    'FLEX Rankings');

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE tt_tags                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tt_articles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE tt_article_tags            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tt_players                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tt_ranking_lists           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tt_ranking_players         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tt_ranking_versions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tt_ranking_version_players ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "TT: Public can read tags"
  ON tt_tags FOR SELECT USING (TRUE);

CREATE POLICY "TT: Public can read published articles"
  ON tt_articles FOR SELECT USING (published = TRUE);

CREATE POLICY "TT: Public can read article_tags"
  ON tt_article_tags FOR SELECT USING (TRUE);

CREATE POLICY "TT: Public can read players"
  ON tt_players FOR SELECT USING (TRUE);

CREATE POLICY "TT: Public can read ranking_lists"
  ON tt_ranking_lists FOR SELECT USING (TRUE);

CREATE POLICY "TT: Public can read ranking_players"
  ON tt_ranking_players FOR SELECT USING (TRUE);

CREATE POLICY "TT: Public can read ranking_versions"
  ON tt_ranking_versions FOR SELECT USING (TRUE);

CREATE POLICY "TT: Public can read ranking_version_players"
  ON tt_ranking_version_players FOR SELECT USING (TRUE);

-- Service role (admin) — bypass RLS via service key
-- The service_role key bypasses all RLS policies by default in Supabase.
-- Admin writes happen server-side using the service_role key (createAdminClient).

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
-- Run these in the Supabase dashboard SQL editor or Storage UI:
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('tt-media', 'tt-media', TRUE);
--
-- CREATE POLICY "TT: Public read media"
--   ON storage.objects FOR SELECT USING (bucket_id = 'tt-media');
--
-- CREATE POLICY "TT: Service role can manage media"
--   ON storage.objects FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- (safe to run even if function already exists from another app)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tt_articles_updated_at
  BEFORE UPDATE ON tt_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tt_players_updated_at
  BEFORE UPDATE ON tt_players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tt_ranking_lists_updated_at
  BEFORE UPDATE ON tt_ranking_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tt_ranking_players_updated_at
  BEFORE UPDATE ON tt_ranking_players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
