-- Migration: Add archive tracking fields to kajian table
-- Created: 2026-02-09
-- Purpose: Enable soft delete by tracking archived kajian and deleted images

-- Add archivedAt field to track when kajian was archived
ALTER TABLE kajian ADD COLUMN archivedAt TEXT;

-- Add imageDeletedAt field to track when Cloudinary image was deleted
ALTER TABLE kajian ADD COLUMN imageDeletedAt TEXT;

-- Add index for efficient queries on archived kajian
CREATE INDEX IF NOT EXISTS idx_kajian_archived ON kajian(archivedAt);

-- Add index for date-based queries (used for finding old kajian)
CREATE INDEX IF NOT EXISTS idx_kajian_date ON kajian(date);
