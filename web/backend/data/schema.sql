-- FinTrack Database Schema (Demo-Friendly, Persistence-First)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) USERS
-- One row per person in your demo/system.
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    pan TEXT,
    mobile TEXT UNIQUE,
    email TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2) CATEGORIES
-- Keep a shared default catalog and optional user-scoped custom categories.
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    budget_limit NUMERIC(12,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_unique_name_per_user
ON categories(COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid), LOWER(name));

-- 3) CONSENTS
-- Tracks consent requests for the AA simulation flow.
CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fi_types TEXT[] NOT NULL,
    status TEXT NOT NULL DEFAULT 'APPROVED',
    consent_handle UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4) DATA SESSIONS
-- Tracks generated/fetched dataset sessions.
CREATE TABLE IF NOT EXISTS data_sessions (
    session_id UUID PRIMARY KEY,
    consent_id UUID REFERENCES consents(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fi_types TEXT[] NOT NULL,
    status TEXT NOT NULL DEFAULT 'READY',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5) FINANCIAL RECORDS (RAW FI PAYLOAD)
-- Stores generated FI payloads exactly as returned by the mock generator.
CREATE TABLE IF NOT EXISTS financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES data_sessions(session_id) ON DELETE SET NULL,
    fi_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_records_user_fi
ON financial_records(user_id, fi_type, created_at DESC);

-- 6) ACCOUNTS (NORMALIZED)
-- Bank accounts and cards extracted from FI payloads.
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fi_type TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_subtype TEXT,
    masked_identifier TEXT,
    current_balance NUMERIC(14,2),
    credit_limit NUMERIC(14,2),
    outstanding_amount NUMERIC(14,2),
    currency TEXT DEFAULT 'INR',
    status TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_user
ON accounts(user_id, fi_type);

-- 7) TRANSACTIONS (NORMALIZED)
-- Full transactional history used for dashboard and LLM context.
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    txn_ref TEXT,
    txn_type TEXT NOT NULL CHECK (txn_type IN ('CREDIT', 'DEBIT')),
    mode TEXT,
    amount NUMERIC(14,2) NOT NULL,
    running_balance NUMERIC(14,2),
    txn_timestamp TIMESTAMPTZ NOT NULL,
    value_date DATE,
    narration TEXT,
    merchant_name TEXT,
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_time
ON transactions(user_id, txn_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_type
ON transactions(user_id, txn_type);

-- 8) USER INFERRED INSIGHTS
-- Pre-computed dashboard + LLM context from normalized transactions.
CREATE TABLE IF NOT EXISTS user_inferred_insights (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    inference_version INTEGER NOT NULL DEFAULT 1,
    insights JSONB NOT NULL,
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
