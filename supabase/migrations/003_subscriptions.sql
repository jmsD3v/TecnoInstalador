-- ─────────────────────────────────────────────
-- Subscriptions table
-- ─────────────────────────────────────────────

CREATE TABLE subscriptions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id        uuid NOT NULL REFERENCES installers(id) ON DELETE CASCADE,
  mp_preapproval_id   text NOT NULL UNIQUE,
  mp_plan_id          text NOT NULL,
  plan                text NOT NULL CHECK (plan IN ('PRO', 'PREMIUM')),
  billing_period      text NOT NULL CHECK (billing_period IN ('monthly', 'annual')),
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'authorized', 'paused', 'cancelled')),
  next_payment_date   timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Add columns to installers
ALTER TABLE installers
  ADD COLUMN IF NOT EXISTS subscription_id uuid REFERENCES subscriptions(id),
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

-- RLS for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_owner_read" ON subscriptions
  FOR SELECT USING (
    installer_id IN (SELECT id FROM installers WHERE user_id = auth.uid())
  );

CREATE POLICY "subscriptions_service_role_all" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at();
