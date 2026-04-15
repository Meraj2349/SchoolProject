-- ============================================================
-- ClassNames Reference Table
-- Stores the standard class names shared across all branches.
-- Class names are global — sections differ per branch.
-- ============================================================

CREATE TABLE IF NOT EXISTS ClassNames (
  id       INT PRIMARY KEY AUTO_INCREMENT,
  name     VARCHAR(50) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
);

-- Standard class names (same for every branch)
INSERT IGNORE INTO ClassNames (name, sort_order) VALUES
  ('Play',     1),
  ('Nursery',  2),
  ('KG',       3),
  ('Class 1',  4),
  ('Class 2',  5),
  ('Class 3',  6),
  ('Class 4',  7),
  ('Class 5',  8),
  ('Class 6',  9),
  ('Class 7',  10),
  ('Class 8',  11),
  ('Class 9',  12),
  ('Class 10', 13);
