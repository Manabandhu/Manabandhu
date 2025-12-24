-- Q&A Module Tables

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('IMMIGRATION', 'INSURANCE', 'HOUSING', 'TRAVEL', 'TAX', 'GENERAL')),
    is_system_tag BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    tags JSONB NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ANSWERED', 'CLOSED')),
    views_count INTEGER NOT NULL DEFAULT 0,
    answers_count INTEGER NOT NULL DEFAULT 0,
    accepted_answer_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Answers table
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    author_user_id VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    upvotes INTEGER NOT NULL DEFAULT 0,
    downvotes INTEGER NOT NULL DEFAULT 0,
    is_accepted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Votes table
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('QUESTION', 'ANSWER')),
    target_id UUID NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('UPVOTE', 'DOWNVOTE')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(target_type, target_id, user_id)
);

-- QA Activities table (for home feed)
CREATE TABLE qa_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('QUESTION_POSTED', 'ANSWER_POSTED', 'ANSWER_ACCEPTED')),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    actor_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Reported Content table
CREATE TABLE reported_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(10) NOT NULL CHECK (content_type IN ('QUESTION', 'ANSWER')),
    content_id UUID NOT NULL,
    reported_by_user_id VARCHAR(255) NOT NULL,
    reason VARCHAR(20) NOT NULL CHECK (reason IN ('SPAM', 'MISINFORMATION', 'HARASSMENT')),
    status VARCHAR(10) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'REMOVED')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_questions_author ON questions(author_user_id);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX idx_questions_tags ON questions USING GIN(tags);

CREATE INDEX idx_answers_question ON answers(question_id);
CREATE INDEX idx_answers_author ON answers(author_user_id);
CREATE INDEX idx_answers_accepted ON answers(is_accepted) WHERE is_accepted = true;

CREATE INDEX idx_votes_target ON votes(target_type, target_id);
CREATE INDEX idx_votes_user ON votes(user_id);

CREATE INDEX idx_qa_activities_created_at ON qa_activities(created_at DESC);
CREATE INDEX idx_qa_activities_question ON qa_activities(question_id);

-- Insert system tags
INSERT INTO tags (name, category, is_system_tag) VALUES
('home_insurance', 'INSURANCE', true),
('health_insurance', 'INSURANCE', true),
('visa', 'IMMIGRATION', true),
('immigration', 'IMMIGRATION', true),
('f1', 'IMMIGRATION', true),
('opt', 'IMMIGRATION', true),
('stem_opt', 'IMMIGRATION', true),
('h1b', 'IMMIGRATION', true),
('h4', 'IMMIGRATION', true),
('i140', 'IMMIGRATION', true),
('b1', 'IMMIGRATION', true),
('b2', 'IMMIGRATION', true),
('travel', 'TRAVEL', true),
('tax', 'TAX', true),
('ssn', 'GENERAL', true),
('driving_license', 'GENERAL', true),
('housing', 'HOUSING', true),
('apartment', 'HOUSING', true),
('roommate', 'HOUSING', true),
('utilities', 'HOUSING', true);