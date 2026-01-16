-- Migration: Add contributor applications system
-- Run this script to add support for contributor registration

-- Create admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'ADMIN',
  assignedRegion TEXT,
  fullName TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create contributor_applications table
CREATE TABLE IF NOT EXISTS contributor_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  fullName TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT,
  phoneNumber TEXT,
  motivation TEXT,
  status TEXT DEFAULT 'pending',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewedAt DATETIME,
  reviewedBy TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contributor_status ON contributor_applications(status);
CREATE INDEX IF NOT EXISTS idx_contributor_email ON contributor_applications(email);
CREATE INDEX IF NOT EXISTS idx_contributor_created ON contributor_applications(createdAt);
CREATE INDEX IF NOT EXISTS idx_admin_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admin_region ON admins(assignedRegion);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contributor_status ON contributor_applications(status);
CREATE INDEX IF NOT EXISTS idx_contributor_email ON contributor_applications(email);
CREATE INDEX IF NOT EXISTS idx_contributor_created ON contributor_applications(createdAt);
