-- Immigration News Tables
CREATE TABLE IF NOT EXISTS immigration_news_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    base_url VARCHAR(500) NOT NULL,
    type VARCHAR(20) NOT NULL,
    trust_score INTEGER NOT NULL DEFAULT 3,
    enabled BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS immigration_news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    summary TEXT,
    content TEXT,
    source_name VARCHAR(255) NOT NULL,
    source_url VARCHAR(500) NOT NULL,
    source_type VARCHAR(20) NOT NULL,
    published_at TIMESTAMP NOT NULL,
    ingested_at TIMESTAMP NOT NULL,
    visa_categories TEXT,
    countries_affected TEXT,
    tags TEXT,
    impact_level VARCHAR(20) NOT NULL,
    is_breaking BOOLEAN NOT NULL DEFAULT false,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verification_notes TEXT,
    language VARCHAR(10) NOT NULL DEFAULT 'EN',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS immigration_news_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES immigration_news_articles(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, user_id)
);

CREATE TABLE IF NOT EXISTS immigration_news_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES immigration_news_articles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_immigration_articles_status ON immigration_news_articles(status);
CREATE INDEX IF NOT EXISTS idx_immigration_articles_published ON immigration_news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_immigration_articles_breaking ON immigration_news_articles(is_breaking);
CREATE INDEX IF NOT EXISTS idx_immigration_articles_impact ON immigration_news_articles(impact_level);
CREATE INDEX IF NOT EXISTS idx_immigration_articles_source_type ON immigration_news_articles(source_type);
CREATE INDEX IF NOT EXISTS idx_immigration_bookmarks_user ON immigration_news_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_immigration_activity_created ON immigration_news_activity(created_at DESC);

-- Insert default news sources
INSERT INTO immigration_news_sources (name, base_url, type, trust_score, enabled) VALUES
('USCIS', 'https://www.uscis.gov', 'OFFICIAL', 5, true),
('Department of Homeland Security', 'https://www.dhs.gov', 'OFFICIAL', 5, true),
('Department of State', 'https://travel.state.gov', 'OFFICIAL', 5, true),
('Fragomen', 'https://www.fragomen.com', 'LAW_FIRM', 4, true),
('Murthy Law Firm', 'https://www.murthy.com', 'LAW_FIRM', 4, true),
('Reuters Immigration', 'https://www.reuters.com', 'NEWS_MEDIA', 3, true)
ON CONFLICT (name) DO NOTHING;