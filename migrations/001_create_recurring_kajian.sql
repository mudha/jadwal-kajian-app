-- Migration: Add recurring_kajian table
-- Created: 2026-01-18

CREATE TABLE IF NOT EXISTS recurring_kajian (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Masjid & Location
  masjid TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  
  -- Kajian Details
  pemateri TEXT NOT NULL,
  pemateri2 TEXT,
  pemateri3 TEXT,
  tema TEXT,
  
  -- Recurring Pattern
  pattern TEXT NOT NULL CHECK(pattern IN ('weekly', 'biweekly', 'monthly', 'monthly_odd', 'monthly_even')),
  day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6),
  week_of_month INTEGER CHECK(week_of_month >= 1 AND week_of_month <= 4),
  
  -- Time & Contact
  waktu_mulai TEXT NOT NULL,
  waktu_selesai TEXT,
  cp TEXT,
  cp2 TEXT,
  cp3 TEXT,
  
  -- Location Details
  gmapsUrl TEXT,
  lat REAL,
  lng REAL,
  
  -- Media & Additional Info
  imageUrl TEXT,
  catatan TEXT,
  linkInfo TEXT,
  
  -- Flags
  khususAkhwat INTEGER DEFAULT 0,
  isOnline INTEGER DEFAULT 0,
  isKidsFriendly INTEGER DEFAULT 0,
  
  -- Metadata
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  createdBy TEXT,
  isActive INTEGER DEFAULT 1
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_recurring_kajian_active ON recurring_kajian(isActive);
CREATE INDEX IF NOT EXISTS idx_recurring_kajian_city ON recurring_kajian(city);
CREATE INDEX IF NOT EXISTS idx_recurring_kajian_pattern ON recurring_kajian(pattern);
