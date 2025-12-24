-- USCIS Case Tracker Tables
CREATE TABLE IF NOT EXISTS uscis_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    receipt_number VARCHAR(13) NOT NULL,
    form_type VARCHAR(10) NOT NULL,
    service_center VARCHAR(10) NOT NULL,
    case_status VARCHAR(500),
    case_status_code VARCHAR(50),
    status_description TEXT,
    last_status_date DATE,
    received_date DATE,
    last_checked_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, receipt_number)
);

CREATE TABLE IF NOT EXISTS uscis_case_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uscis_case_id UUID NOT NULL REFERENCES uscis_cases(id) ON DELETE CASCADE,
    status_title VARCHAR(500) NOT NULL,
    status_description TEXT,
    status_date DATE NOT NULL,
    raw_response_snapshot TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uscis_case_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uscis_case_id UUID NOT NULL REFERENCES uscis_cases(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    metadata TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_uscis_cases_user_id ON uscis_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_uscis_cases_active ON uscis_cases(is_active);
CREATE INDEX IF NOT EXISTS idx_uscis_case_history_case_id ON uscis_case_history(uscis_case_id);
CREATE INDEX IF NOT EXISTS idx_uscis_case_activity_user_id ON uscis_case_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_uscis_case_activity_created_at ON uscis_case_activity(created_at DESC);