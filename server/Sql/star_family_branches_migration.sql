SET NAMES utf8mb4;

-- ============================================================
-- Star Shiksha Paribar (স্টার শিক্ষা পরিবার): the family's branches.
--
-- Adds each branch only when no branch with its name is there yet, so it is
-- safe to run again. An existing branch is never updated or renamed: an
-- admin's edits stay. Branches are matched by NAME only, because addresses
-- name other branches' towns (Pakulla is in Mirzapur, the head office in
-- Delduar). The head office's name must never contain "Delduar".
--
-- Run: mysql -u <user> -p <database> < star_family_branches_migration.sql
-- ============================================================

INSERT INTO Branches (name_bn, name_en, address_bn, address_en, is_proposed)
SELECT 'স্টার শিক্ষা পরিবার, নাটিয়াপাড়া (প্রধান কার্যালয়)', 'Star Shiksha Paribar, Natiapara (Head Office)',
       'নাটিয়াপাড়া, দেলদুয়ার, টাঙ্গাইল', 'Natiapara, Delduar, Tangail', FALSE
  FROM DUAL
 WHERE NOT EXISTS (SELECT 1 FROM Branches WHERE name_en LIKE '%Natiapara%' OR name_bn LIKE '%নাটিয়াপাড়া%');

INSERT INTO Branches (name_bn, name_en, address_bn, address_en, is_proposed)
SELECT 'বাথুলী শাখা', 'Bathuli Branch',
       'বাথুলী, দেলদুয়ার, টাঙ্গাইল', 'Bathuli, Delduar, Tangail', FALSE
  FROM DUAL
 WHERE NOT EXISTS (SELECT 1 FROM Branches WHERE name_en LIKE '%Bathuli%' OR name_bn LIKE '%বাথুলী%');

INSERT INTO Branches (name_bn, name_en, address_bn, address_en, is_proposed)
SELECT 'পাকুল্যা শাখা', 'Pakulla Branch',
       'পাকুল্যা জমিদার বাড়ী, মির্জাপুর, টাঙ্গাইল', 'Pakulla Zamindar Bari, Mirzapur, Tangail', FALSE
  FROM DUAL
 WHERE NOT EXISTS (SELECT 1 FROM Branches WHERE name_en LIKE '%Pakull%' OR name_bn LIKE '%পাকুল্%');

INSERT INTO Branches (name_bn, name_en, address_bn, address_en, is_proposed)
SELECT 'মির্জাপুর শাখা', 'Mirzapur Branch',
       'সমবায় মার্কেট (২য় তলা), মির্জাপুর, টাঙ্গাইল', 'Samabay Market (2nd floor), Mirzapur, Tangail', FALSE
  FROM DUAL
 WHERE NOT EXISTS (SELECT 1 FROM Branches WHERE name_en LIKE '%Mirzapur%' OR name_bn LIKE '%মির্জাপুর%');

INSERT INTO Branches (name_bn, name_en, address_bn, address_en, is_proposed)
SELECT 'দেলদুয়ার শাখা', 'Delduar Branch',
       'উপজেলা গেইট সংলগ্ন, দেলদুয়ার, টাঙ্গাইল', 'Next to the Upazila gate, Delduar, Tangail', FALSE
  FROM DUAL
 WHERE NOT EXISTS (SELECT 1 FROM Branches WHERE name_en LIKE '%Delduar%' OR name_bn LIKE '%দেলদুয়ার%');

INSERT INTO Branches (name_bn, name_en, address_bn, address_en, is_proposed)
SELECT 'দুল্যা শাখা', 'Dulla Branch',
       'দুল্যা বাজার, দেলদুয়ার, টাঙ্গাইল', 'Dulla Bazar, Delduar, Tangail', FALSE
  FROM DUAL
 WHERE NOT EXISTS (SELECT 1 FROM Branches WHERE name_en LIKE '%Dulla%' OR name_bn LIKE '%দুল্যা%');
