-- ============================================================
-- Branch ownership repair (MySQL 8, safe to re-run).
-- Exams and results used to be saved without their branch (so they all said
-- branch 1). Give each exam its class's branch and each result its student's
-- branch. Rows that are already right are not touched.
-- ============================================================

UPDATE Exams e
  JOIN Classes c ON c.ClassID = e.ClassID
   SET e.branch_id = c.branch_id
 WHERE e.branch_id <> c.branch_id;

UPDATE Results r
  JOIN Students s ON s.StudentID = r.StudentID
   SET r.branch_id = s.branch_id
 WHERE r.branch_id <> s.branch_id;
