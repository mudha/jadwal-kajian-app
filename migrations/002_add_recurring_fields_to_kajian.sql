-- Migration: Add recurring relationship fields to kajian table
-- Created: 2026-01-18

ALTER TABLE kajian ADD COLUMN recurring_kajian_id INTEGER;
ALTER TABLE kajian ADD COLUMN is_recurring_instance INTEGER DEFAULT 0;
ALTER TABLE kajian ADD COLUMN is_canceled INTEGER DEFAULT 0;
ALTER TABLE kajian ADD COLUMN cancellation_reason TEXT;

-- Add indexes for filtering
CREATE INDEX IF NOT EXISTS idx_kajian_recurring_id ON kajian(recurring_kajian_id);
CREATE INDEX IF NOT EXISTS idx_kajian_is_recurring ON kajian(is_recurring_instance);
CREATE INDEX IF NOT EXISTS idx_kajian_is_canceled ON kajian(is_canceled);
