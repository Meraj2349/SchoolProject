-- ============================================================
-- Seed: Standard Classes and Sections for All Branches
-- Run once: mysql -u root -p School_Management < server/Sql/seed_standard_classes.sql
--
-- Creates 11 standard classes (Nursery, 1-10) x 3 sections
-- (Better, Good, General) for every branch in the Branches table.
-- Uses INSERT IGNORE so re-running is safe (idempotent).
-- Also replaces ClassNames with the authoritative 11-entry set.
-- ============================================================

-- Step 1: Replace ClassNames with the required 11 standard entries
DELETE FROM ClassNames;

INSERT INTO ClassNames (name, sort_order) VALUES
  ('Nursery',  1),
  ('1',        2),
  ('2',        3),
  ('3',        4),
  ('4',        5),
  ('5',        6),
  ('6',        7),
  ('7',        8),
  ('8',        9),
  ('9',        10),
  ('10',       11);

-- Step 2: Seed Classes table for every branch
-- INSERT IGNORE relies on the unique index uq_class_section_branch (ClassName, Section, branch_id)

DROP PROCEDURE IF EXISTS seed_standard_classes;

DELIMITER //
CREATE PROCEDURE seed_standard_classes()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE bid INT;
  DECLARE cur CURSOR FOR SELECT id FROM Branches;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  OPEN cur;
  branch_loop: LOOP
    FETCH cur INTO bid;
    IF done THEN
      LEAVE branch_loop;
    END IF;

    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('Nursery', 'Better',  bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('Nursery', 'Good',    bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('Nursery', 'General', bid);

    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('1', 'Better',  bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('1', 'Good',    bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('1', 'General', bid);

    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('2', 'Better',  bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('2', 'Good',    bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('2', 'General', bid);

    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('3', 'Better',  bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('3', 'Good',    bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('3', 'General', bid);

    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('4', 'Better',  bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('4', 'Good',    bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('4', 'General', bid);

    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('5', 'Better',  bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('5', 'Good',    bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('5', 'General', bid);

    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('6', 'Better',  bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('6', 'Good',    bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('6', 'General', bid);

    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('7', 'Better',  bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('7', 'Good',    bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('7', 'General', bid);

    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('8', 'Better',  bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('8', 'Good',    bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('8', 'General', bid);

    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('9', 'Better',  bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('9', 'Good',    bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('9', 'General', bid);

    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('10', 'Better',  bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('10', 'Good',    bid);
    INSERT IGNORE INTO Classes (ClassName, Section, branch_id) VALUES ('10', 'General', bid);

  END LOOP;
  CLOSE cur;
END //
DELIMITER ;

CALL seed_standard_classes();
DROP PROCEDURE IF EXISTS seed_standard_classes;
