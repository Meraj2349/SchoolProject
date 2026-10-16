-- The file holds Bangla text: read it as UTF-8 whatever the client default.
SET NAMES utf8mb4;

-- Md. Rashedul Islam is the Founding Director (প্রতিষ্ঠাতা পরিচালক) of
-- Star Shikkha Poribar, not its Chairman. Idempotent, MySQL 8.

-- New default for the profile row.
ALTER TABLE ChairmanProfile
  ALTER COLUMN title_en SET DEFAULT 'Founding Director',
  ALTER COLUMN title_bn SET DEFAULT 'প্রতিষ্ঠাতা পরিচালক';

-- The seeded title; a title an admin already changed is left alone.
UPDATE ChairmanProfile
SET title_en = 'Founding Director', title_bn = 'প্রতিষ্ঠাতা পরিচালক'
WHERE title_en = 'Chairman' AND title_bn = 'চেয়ারম্যান';
