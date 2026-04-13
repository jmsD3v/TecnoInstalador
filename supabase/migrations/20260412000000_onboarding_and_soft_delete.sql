-- Add onboarding_completed flag
ALTER TABLE installers ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Mark existing installers as already onboarded (they registered before this feature)
UPDATE installers SET onboarding_completed = true;

-- Soft delete for reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Performance indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_installers_plan ON installers(plan);
CREATE INDEX IF NOT EXISTS idx_installers_is_active ON installers(is_active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_reviews_is_public ON reviews(is_public) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_deleted_at ON reviews(deleted_at);
