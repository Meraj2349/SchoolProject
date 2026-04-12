-- Migration: add language preference to Admin table
-- Run once: mysql -u root -p School_Management < server/Sql/add_language_to_admin.sql
ALTER TABLE Admin
ADD COLUMN IF NOT EXISTS Language VARCHAR(2) NOT NULL DEFAULT 'bn' COMMENT 'UI language preference: "bn" (Bangla, default) or "en" (English)';