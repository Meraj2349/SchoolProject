-- Data fix for existing databases (idempotent, MySQL 8):
-- 1. The sample news item from database.sql named another school
--    (Sylhet Cantonment Public School); it now names Star Academic School.
-- 2. The Mirzapur branch was seeded as "Mirjapur"; use the official spelling.
-- Rows an admin has already edited no longer match and are left alone.

UPDATE News
SET title_en = 'Nobin Boron Program held at Star Academic School',
    title_bn = 'স্টার একাডেমিক স্কুলে নবীন বরণ অনুষ্ঠান'
WHERE title_en = 'Nobin Boron Program held in Sylhet Cantonment Public School';

UPDATE Branches
SET name_en = REPLACE(name_en, 'Mirjapur', 'Mirzapur'),
    address_en = REPLACE(address_en, 'Mirjapur', 'Mirzapur')
WHERE name_en LIKE '%Mirjapur%' OR address_en LIKE '%Mirjapur%';

UPDATE Students
SET Address = REPLACE(Address, 'Mirjapur', 'Mirzapur')
WHERE Address LIKE '%Mirjapur%';
