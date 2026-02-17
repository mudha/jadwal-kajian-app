-- Migration: Add holiday_periods table for recurring kajian holidays
-- Created: 2026-02-18

CREATE TABLE IF NOT EXISTS holiday_periods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,  -- Format: YYYY-MM-DD
  end_date TEXT NOT NULL,    -- Format: YYYY-MM-DD
  description TEXT,
  isActive INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_holiday_periods_active ON holiday_periods(isActive);
CREATE INDEX IF NOT EXISTS idx_holiday_periods_dates ON holiday_periods(start_date, end_date);

-- Insert default holiday period for Ramadhan - Syawal 1447 H
INSERT INTO holiday_periods (name, start_date, end_date, description) 
VALUES (
  'Ramadhan - Syawal 1447 H', 
  '2026-02-18', 
  '2026-04-04',
  'Libur kajian rutin selama Ramadhan hingga pertengahan Syawal 1447 H'
);
