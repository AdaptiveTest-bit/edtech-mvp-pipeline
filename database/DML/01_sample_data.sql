-- ============================================================
-- Sample Data DML Script for EdTech MVP
-- ============================================================
-- This script inserts realistic sample data into all tables
-- Follow the schema: users → curriculum → analytics
-- 
-- To run (after clearing old data):
-- psql -U postgres -d edtech_mvp -c "TRUNCATE TABLE analytics.daily_analytics CASCADE; TRUNCATE TABLE analytics.student_progress CASCADE; TRUNCATE TABLE analytics.quiz_submissions CASCADE; TRUNCATE TABLE analytics.student_mastery CASCADE; TRUNCATE TABLE analytics.attempts CASCADE; TRUNCATE TABLE users.student_parent_link CASCADE; TRUNCATE TABLE users.students CASCADE; TRUNCATE TABLE users.parents CASCADE;"
-- psql -U postgres -d edtech_mvp -f database/DML/01_sample_data.sql
-- ============================================================

-- ============================================================
-- 1. INSERT SAMPLE USERS (Students & Parents)
-- ============================================================

-- Use CTE to capture student IDs and ensure proper foreign key relationships
WITH new_students AS (
  INSERT INTO users.students (user_id, email, name, grade_level, total_xp, current_streak, best_streak, avatar_url, created_at, updated_at) 
  VALUES 
    (gen_random_uuid(), 'alice@example.com', 'Alice Johnson', 5, 150, 3, 7, 'https://example.com/avatars/alice.jpg', NOW(), NOW()),
    (gen_random_uuid(), 'bob@example.com', 'Bob Smith', 5, 280, 5, 12, 'https://example.com/avatars/bob.jpg', NOW(), NOW()),
    (gen_random_uuid(), 'charlie@example.com', 'Charlie Brown', 6, 95, 2, 4, 'https://example.com/avatars/charlie.jpg', NOW(), NOW()),
    (gen_random_uuid(), 'diana@example.com', 'Diana Prince', 5, 320, 8, 15, 'https://example.com/avatars/diana.jpg', NOW(), NOW()),
    (gen_random_uuid(), 'evan@example.com', 'Evan Davis', 6, 45, 1, 2, 'https://example.com/avatars/evan.jpg', NOW(), NOW())
  RETURNING id
)
SELECT * FROM new_students;

WITH new_parents AS (
  INSERT INTO users.parents (user_id, email, name, phone, created_at, updated_at) 
  VALUES 
    (gen_random_uuid(), 'parent.alice@example.com', 'John Johnson', '555-0101', NOW(), NOW()),
    (gen_random_uuid(), 'parent.bob@example.com', 'Jane Smith', '555-0102', NOW(), NOW()),
    (gen_random_uuid(), 'parent.charlie@example.com', 'David Brown', '555-0103', NOW(), NOW()),
    (gen_random_uuid(), 'parent.diana@example.com', 'Wonder Woman', '555-0104', NOW(), NOW())
  RETURNING id
)
SELECT * FROM new_parents;

-- Link students to parents (many-to-many relationships)
-- Note: IDs will be 1-5 for students and 1-4 for parents (auto-increment)
INSERT INTO users.student_parent_link (student_id, parent_id, created_at) 
VALUES 
  (1, 1, NOW()),  -- Alice to John Johnson
  (2, 2, NOW()),  -- Bob to Jane Smith
  (3, 3, NOW()),  -- Charlie to David Brown
  (4, 4, NOW()),  -- Diana to Wonder Woman
  (4, 1, NOW()),  -- Diana also linked to John Johnson (shared custody)
  (5, 2, NOW()); -- Evan to Jane Smith

-- ============================================================
-- 2. INSERT SAMPLE CURRICULUM (4-LEVEL HIERARCHY)
-- ============================================================

-- CHAPTERS (Level 1)
INSERT INTO curriculum.chapters (name, sequence_order, unit_tag) 
VALUES 
  ('Arithmetic Fundamentals', 1, 'BASIC_MATH'),
  ('Fractions and Decimals', 2, 'FRACTIONS'),
  ('Geometry Basics', 3, 'GEOMETRY'),
  ('Algebra Introduction', 4, 'ALGEBRA'),
  ('Data and Statistics', 5, 'STATISTICS');

-- TOPICS (Level 2)
INSERT INTO curriculum.topics (chapter_id, name, description) 
VALUES 
  -- Arithmetic Fundamentals (chapter 1)
  (1, 'Addition', 'Basic addition with single and double digit numbers'),
  (1, 'Subtraction', 'Basic subtraction with borrowing'),
  (1, 'Multiplication', 'Times tables and multiplication strategies'),
  (1, 'Division', 'Basic division and remainders'),
  
  -- Fractions and Decimals (chapter 2)
  (2, 'Proper Fractions', 'Fractions where numerator < denominator'),
  (2, 'Improper Fractions', 'Fractions where numerator >= denominator'),
  (2, 'Decimal Basics', 'Understanding place value in decimals'),
  
  -- Geometry Basics (chapter 3)
  (3, 'Angles', 'Types and measurement of angles'),
  (3, 'Shapes', 'Properties of 2D shapes'),
  (3, 'Perimeter and Area', 'Calculating perimeter and area'),
  
  -- Algebra Introduction (chapter 4)
  (4, 'Variables and Expressions', 'Understanding variables and algebraic expressions'),
  (4, 'Simple Equations', 'Solving basic linear equations'),
  
  -- Data and Statistics (chapter 5)
  (5, 'Data Collection', 'Methods of collecting data'),
  (5, 'Data Representation', 'Graphs, charts, and tables');

-- CONCEPTS (Level 3)
INSERT INTO curriculum.concepts (topic_id, name, misconception_guide) 
VALUES 
  -- Addition (topic 1)
  (1, 'Single Digit Addition', 'Students sometimes count on fingers when they should memorize facts'),
  (1, 'Double Digit Addition with Regrouping', 'Remind students to align place values and carry correctly'),
  
  -- Subtraction (topic 2)
  (2, 'Simple Subtraction', 'Ensure students understand taking away, not just inverse of addition'),
  (2, 'Subtraction with Borrowing', 'Common mistake: not borrowing from tens place correctly'),
  
  -- Multiplication (topic 3)
  (3, 'Times Tables 1-5', 'Memorization is key; relate to repeated addition initially'),
  (3, 'Times Tables 6-12', 'Use patterns and commutative property to ease learning'),
  (3, 'Multiplication by 10 and 100', 'Many students think you just add zeros, not multiply'),
  
  -- Division (topic 4)
  (4, 'Division as Sharing', 'Division means sharing equally'),
  (4, 'Division with Remainders', 'Common mistake: ignoring remainders or interpreting them incorrectly'),
  
  -- Proper Fractions (topic 5)
  (5, 'Identifying Proper Fractions', 'Students confuse which number is numerator vs denominator'),
  (5, 'Comparing Proper Fractions', 'Remind: larger denominator = smaller pieces'),
  
  -- Improper Fractions (topic 6)
  (6, 'Converting Improper to Mixed', 'Students forget to show remainder as fraction part'),
  
  -- Decimal Basics (topic 7)
  (7, 'Tenths and Hundredths', 'Place value: 0.1 is NOT the same as 0.01'),
  
  -- Angles (topic 8)
  (8, 'Types of Angles', 'Help students visualize: acute (<90°), right (=90°), obtuse (>90°), straight (180°)'),
  (8, 'Measuring Angles', 'Common error: reading protractor incorrectly - use correct scale'),
  
  -- Shapes (topic 9)
  (9, 'Triangles', 'Sum of angles always equals 180°'),
  (9, 'Quadrilaterals', 'Sum of angles always equals 360°'),
  
  -- Perimeter and Area (topic 10)
  (10, 'Perimeter Calculation', 'Add all sides; units are linear (m, cm)'),
  (10, 'Area Calculation', 'Multiply dimensions; units are squared (m², cm²)'),
  
  -- Variables and Expressions (topic 11)
  (11, 'Writing Expressions', 'Convert words to algebraic notation'),
  (11, 'Evaluating Expressions', 'Substitute values and follow order of operations'),
  
  -- Simple Equations (topic 12)
  (12, 'One-Step Equations', 'Use inverse operations to solve'),
  
  -- Data Collection (topic 13)
  (13, 'Survey Design', 'Well-designed questions avoid bias'),
  
  -- Data Representation (topic 14)
  (14, 'Bar Charts', 'Each bar represents a category''s frequency'),
  (14, 'Pie Charts', 'Whole pie = 100% or 360°');

-- ============================================================
-- 3. INSERT SAMPLE QUESTIONS (Level 4)
-- ============================================================

-- QUESTIONS FOR: Single Digit Addition (concept 1)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (1, '{"text": "What is 2 + 3?", "options": {"A": "4", "B": "5", "C": "6", "D": "7"}, "hint": "Count on your fingers: 1, 2, 3, 4, 5"}', 1, 'B', 'When we add 2 and 3 together, we get 5. This is a basic addition fact that should be memorized.'),
  (1, '{"text": "What is 5 + 4?", "options": {"A": "8", "B": "9", "C": "10", "D": "11"}, "hint": "Start at 5 and count up 4 more: 6, 7, 8, 9"}', 1, 'B', '5 + 4 = 9. Count on from 5: 6, 7, 8, 9.'),
  (1, '{"text": "What is 7 + 2?", "options": {"A": "8", "B": "9", "C": "10", "D": "11"}, "hint": "Start at 7"}', 1, 'B', '7 + 2 = 9. Seven plus two equals nine.'),
  (1, '{"text": "What is 6 + 3?", "options": {"A": "8", "B": "9", "C": "10", "D": "11"}, "hint": "Count from 6"}', 1, 'B', '6 + 3 = 9. These are fundamental addition facts.');

-- QUESTIONS FOR: Double Digit Addition with Regrouping (concept 2)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (2, '{"text": "What is 15 + 17?", "options": {"A": "30", "B": "31", "C": "32", "D": "33"}, "hint": "Add the ones: 5+7=12. Add the tens: 1+1=2. So 20+12=32"}', 2, 'C', '15 + 17 = 32. First add the ones: 5 + 7 = 12 (write 2, carry 1). Then add tens: 1 + 1 + 1 = 3. Answer: 32.'),
  (2, '{"text": "What is 28 + 14?", "options": {"A": "40", "B": "41", "C": "42", "D": "43"}, "hint": "8 + 4 = 12, carry the 1"}', 2, 'C', '28 + 14 = 42. Align place values: ones (8+4=12), tens (2+1+1=4).'),
  (2, '{"text": "What is 36 + 25?", "options": {"A": "59", "B": "60", "C": "61", "D": "62"}, "hint": "6 + 5 = 11 in the ones place"}', 2, 'C', '36 + 25 = 61. Ones: 6 + 5 = 11 (write 1, carry 1). Tens: 3 + 2 + 1 = 6. Answer: 61.');

-- QUESTIONS FOR: Simple Subtraction (concept 3)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (3, '{"text": "What is 8 - 3?", "options": {"A": "4", "B": "5", "C": "6", "D": "7"}, "hint": "Start at 8 and count backward: 7, 6, 5"}', 1, 'B', 'When we take away 3 from 8, we have 5 left. 8 - 3 = 5.'),
  (3, '{"text": "What is 10 - 4?", "options": {"A": "5", "B": "6", "C": "7", "D": "8"}, "hint": "Count back from 10"}', 1, 'B', '10 - 4 = 6. Remove 4 from 10 leaves 6.');

-- QUESTIONS FOR: Subtraction with Borrowing (concept 4)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (4, '{"text": "What is 32 - 15?", "options": {"A": "15", "B": "16", "C": "17", "D": "18"}, "hint": "Cannot subtract 5 from 2, so borrow from tens place"}', 2, 'C', '32 - 15 = 17. Since 2 < 5, borrow 1 from tens (30→20, 2→12). Now: 12 - 5 = 7, 20 - 10 = 10. Total: 17.'),
  (4, '{"text": "What is 41 - 18?", "options": {"A": "22", "B": "23", "C": "24", "D": "25"}, "hint": "Borrow from the tens place"}', 2, 'B', '41 - 18 = 23. Borrow 1 ten: 11 - 8 = 3, 30 - 10 = 20. Answer: 23.');

-- QUESTIONS FOR: Times Tables 1-5 (concept 5)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (5, '{"text": "What is 3 × 4?", "options": {"A": "10", "B": "11", "C": "12", "D": "13"}, "hint": "3 groups of 4: 4 + 4 + 4"}', 1, 'C', '3 × 4 = 12. Multiplication is repeated addition: 4 + 4 + 4 = 12.'),
  (5, '{"text": "What is 5 × 5?", "options": {"A": "20", "B": "24", "C": "25", "D": "26"}, "hint": "5 fives"}', 1, 'C', '5 × 5 = 25. Five times five equals twenty-five.'),
  (5, '{"text": "What is 2 × 7?", "options": {"A": "12", "B": "13", "C": "14", "D": "15"}, "hint": "7 + 7"}', 1, 'C', '2 × 7 = 14. Two sevens is fourteen.');

-- QUESTIONS FOR: Times Tables 6-12 (concept 6)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (6, '{"text": "What is 6 × 7?", "options": {"A": "40", "B": "41", "C": "42", "D": "43"}, "hint": "Use the pattern: 6 × 6 = 36, then add 6"}', 2, 'C', '6 × 7 = 42. Remember: 6 × 6 = 36, so 6 × 7 = 36 + 6 = 42.'),
  (6, '{"text": "What is 8 × 9?", "options": {"A": "70", "B": "71", "C": "72", "D": "73"}, "hint": "Think of 8 × 10 - 8"}', 2, 'C', '8 × 9 = 72. Use the trick: 8 × 10 = 80, so 8 × 9 = 80 - 8 = 72.');

-- QUESTIONS FOR: Multiplication by 10 and 100 (concept 7)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (7, '{"text": "What is 5 × 10?", "options": {"A": "15", "B": "50", "C": "500", "D": "5"}, "hint": "NOT adding zeros: multiply means repeated addition or groups"}', 2, 'B', '5 × 10 = 50. When multiplying by 10, move the decimal point one place right (or add one zero). 5 becomes 50.'),
  (7, '{"text": "What is 23 × 100?", "options": {"A": "230", "B": "2300", "C": "23000", "D": "203"}, "hint": "Move decimal point TWO places right"}', 2, 'B', '23 × 100 = 2300. Multiply by 100 means move decimal 2 places right or add two zeros. 23 becomes 2300.');

-- QUESTIONS FOR: Division as Sharing (concept 8)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (8, '{"text": "If we share 12 apples among 3 friends equally, how many does each friend get?", "options": {"A": "3", "B": "4", "C": "5", "D": "6"}, "hint": "12 ÷ 3 means divide 12 into 3 equal groups"}', 1, 'B', '12 ÷ 3 = 4. Division means sharing or grouping. 12 apples shared among 3 friends = 4 apples each.'),
  (8, '{"text": "What is 20 ÷ 4?", "options": {"A": "4", "B": "5", "C": "6", "D": "7"}, "hint": "How many 4s fit into 20?"}', 1, 'B', '20 ÷ 4 = 5. Think: how many 4s go into 20? Answer: five 4s.');

-- QUESTIONS FOR: Division with Remainders (concept 9)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (9, '{"text": "What is 17 ÷ 5?", "options": {"A": "3", "B": "3 R 2", "C": "4", "D": "4 R 2"}, "hint": "5 × 3 = 15, leaves 2 remaining"}', 2, 'B', '17 ÷ 5 = 3 R 2. Five goes into 17 three times (5 × 3 = 15), with 2 left over. So: 3 remainder 2.'),
  (9, '{"text": "What is 26 ÷ 4?", "options": {"A": "6", "B": "6 R 2", "C": "7", "D": "7 R 2"}, "hint": "4 × 6 = 24"}', 2, 'B', '26 ÷ 4 = 6 R 2. Four goes into 26 six times (4 × 6 = 24), with 2 remaining. Write: 6 remainder 2.');

-- QUESTIONS FOR: Identifying Proper Fractions (concept 10)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (10, '{"text": "Which is a proper fraction?", "options": {"A": "5/3", "B": "3/2", "C": "2/3", "D": "4/3"}, "hint": "Proper fraction: numerator < denominator"}', 2, 'C', 'A proper fraction has numerator < denominator. 2/3 is proper because 2 < 3. The others are improper (≥ 1).'),
  (10, '{"text": "Which fraction equals LESS than 1?", "options": {"A": "7/5", "B": "5/4", "C": "3/5", "D": "6/4"}, "hint": "Top number must be smaller than bottom"}', 1, 'C', '3/5 is less than 1 because 3 < 5. The others are greater than 1.');

-- QUESTIONS FOR: Comparing Proper Fractions (concept 11)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (11, '{"text": "Which is LARGER: 1/2 or 1/4?", "options": {"A": "1/4", "B": "1/2", "C": "They are equal", "D": "Cannot compare"}, "hint": "Bigger denominator = smaller pieces"}', 2, 'B', '1/2 > 1/4. Imagine cutting a pie: half a pie is bigger than a quarter of a pie. Smaller denominator = bigger piece.'),
  (11, '{"text": "Which is SMALLER: 2/3 or 3/4?", "options": {"A": "2/3", "B": "3/4", "C": "Equal", "D": "Unknown"}, "hint": "Common denominator: 12ths"}', 2, 'A', '2/3 < 3/4. Convert to same denominator: 2/3 = 8/12, 3/4 = 9/12. Since 8/12 < 9/12, then 2/3 < 3/4.');

-- QUESTIONS FOR: Angle Types (concept 14)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (14, '{"text": "What is a 90-degree angle called?", "options": {"A": "Acute angle", "B": "Obtuse angle", "C": "Right angle", "D": "Straight angle"}, "hint": "Think of a corner of a square"}', 1, 'C', 'A 90-degree angle is called a RIGHT angle. It looks like the corner of a square or the plus sign.'),
  (14, '{"text": "An angle of 45 degrees is?", "options": {"A": "Right", "B": "Acute", "C": "Obtuse", "D": "Straight"}, "hint": "Less than 90 degrees"}', 1, 'B', 'An angle less than 90 degrees is ACUTE. 45° is acute because 45 < 90.');

-- QUESTIONS FOR: Measuring Angles (concept 15)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (15, '{"text": "A straight line forms an angle of how many degrees?", "options": {"A": "90°", "B": "180°", "C": "360°", "D": "120°"}, "hint": "A straight line is perfectly flat"}', 1, 'B', 'A straight angle = 180°. It forms a completely straight line.');

-- QUESTIONS FOR: Triangles (concept 16)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (16, '{"text": "What is the sum of all angles in ANY triangle?", "options": {"A": "90°", "B": "180°", "C": "270°", "D": "360°"}, "hint": "Rule for all triangles"}', 1, 'B', 'The sum of all three angles in any triangle is always 180°. This is a fundamental geometry rule.');

-- QUESTIONS FOR: Quadrilaterals (concept 17)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (17, '{"text": "What is the sum of all angles in a quadrilateral (4-sided shape)?", "options": {"A": "180°", "B": "270°", "C": "360°", "D": "450°"}, "hint": "A square has 4 right angles"}', 2, 'C', 'The sum of all four angles in any quadrilateral is always 360°. A square has 4 × 90° = 360°.');

-- QUESTIONS FOR: Perimeter Calculation (concept 18)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (18, '{"text": "What is the perimeter of a rectangle with length 5m and width 3m?", "options": {"A": "8m", "B": "15m", "C": "16m", "D": "25m"}, "hint": "Perimeter = add all sides"}', 1, 'C', 'Perimeter = 2×length + 2×width = 2(5) + 2(3) = 10 + 6 = 16m. Or: 5 + 3 + 5 + 3 = 16m.');

-- QUESTIONS FOR: Area Calculation (concept 19)
INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) 
VALUES 
  (19, '{"text": "What is the area of a rectangle with length 4cm and width 6cm?", "options": {"A": "10cm²", "B": "20cm²", "C": "24cm²", "D": "30cm²"}, "hint": "Area = length × width"}', 1, 'C', 'Area = length × width = 4cm × 6cm = 24cm². Note the unit is squared (cm²).');

-- ============================================================
-- 4. INSERT SAMPLE ATTEMPTS (Student Quiz Attempts)
-- ============================================================

INSERT INTO analytics.attempts (user_id, question_id, is_correct, time_taken_seconds, selected_option, attempted_at) 
VALUES 
  (1, 1, TRUE, 8, 'B', NOW() - INTERVAL '2 days'),
  (1, 2, TRUE, 12, 'B', NOW() - INTERVAL '2 days'),
  (1, 3, FALSE, 15, 'C', NOW() - INTERVAL '1 day'),
  (1, 1, TRUE, 5, 'B', NOW() - INTERVAL '6 hours'),
  
  (2, 1, TRUE, 6, 'B', NOW() - INTERVAL '3 days'),
  (2, 2, TRUE, 10, 'B', NOW() - INTERVAL '3 days'),
  (2, 4, TRUE, 7, 'B', NOW() - INTERVAL '2 days'),
  (2, 5, TRUE, 9, 'C', NOW() - INTERVAL '1 day'),
  
  (3, 1, FALSE, 20, 'A', NOW() - INTERVAL '1 day'),
  (3, 2, FALSE, 18, 'D', NOW() - INTERVAL '12 hours'),
  
  (4, 1, TRUE, 4, 'B', NOW() - INTERVAL '2 days'),
  (4, 2, TRUE, 6, 'B', NOW() - INTERVAL '2 days'),
  (4, 4, TRUE, 8, 'B', NOW() - INTERVAL '1 day'),
  (4, 5, TRUE, 7, 'C', NOW() - INTERVAL '18 hours'),
  (4, 8, TRUE, 11, 'B', NOW() - INTERVAL '6 hours');

-- ============================================================
-- 5. INSERT SAMPLE STUDENT MASTERY (Leitner Box & EMA)
-- ============================================================

INSERT INTO analytics.student_mastery (user_id, concept_id, mastery_score, leitner_box, next_review_date, last_practiced_at) 
VALUES 
  (1, 1, 0.75, 2, NOW() + INTERVAL '3 days', NOW() - INTERVAL '6 hours'),    -- Alice on addition
  (1, 2, 0.45, 1, NOW() + INTERVAL '1 day', NOW() - INTERVAL '1 day'),        -- Alice on double-digit addition
  
  (2, 1, 0.90, 3, NOW() + INTERVAL '7 days', NOW() - INTERVAL '18 hours'),    -- Bob on addition
  (2, 2, 0.72, 2, NOW() + INTERVAL '3 days', NOW() - INTERVAL '1 day'),       -- Bob on double-digit addition
  (2, 5, 0.60, 2, NOW() + INTERVAL '3 days', NOW() - INTERVAL '2 days'),      -- Bob on times tables
  
  (3, 1, 0.30, 1, NOW() + INTERVAL '1 day', NOW() - INTERVAL '12 hours'),     -- Charlie on addition
  
  (4, 1, 0.95, 4, NOW() + INTERVAL '14 days', NOW() - INTERVAL '6 hours'),    -- Diana on addition (mastered!)
  (4, 2, 0.88, 3, NOW() + INTERVAL '7 days', NOW() - INTERVAL '18 hours'),    -- Diana on double-digit addition
  (4, 5, 0.81, 2, NOW() + INTERVAL '3 days', NOW() - INTERVAL '1 day'),       -- Diana on times tables
  (4, 8, 0.70, 2, NOW() + INTERVAL '3 days', NOW() - INTERVAL '6 hours');     -- Diana on division

-- ============================================================
-- 6. INSERT SAMPLE QUIZ SUBMISSIONS
-- ============================================================

INSERT INTO analytics.quiz_submissions (user_id, question_id, is_correct, time_taken_seconds, selected_option, xp_earned, submitted_at) 
VALUES 
  (1, 1, TRUE, 8, 'B', 10, NOW() - INTERVAL '2 days'),
  (1, 2, TRUE, 12, 'B', 10, NOW() - INTERVAL '2 days'),
  (1, 3, FALSE, 15, 'C', 0, NOW() - INTERVAL '1 day'),
  (1, 1, TRUE, 5, 'B', 10, NOW() - INTERVAL '6 hours'),
  
  (2, 1, TRUE, 6, 'B', 10, NOW() - INTERVAL '3 days'),
  (2, 2, TRUE, 10, 'B', 10, NOW() - INTERVAL '3 days'),
  (2, 4, TRUE, 7, 'B', 10, NOW() - INTERVAL '2 days'),
  (2, 5, TRUE, 9, 'C', 10, NOW() - INTERVAL '1 day'),
  
  (3, 1, FALSE, 20, 'A', 0, NOW() - INTERVAL '1 day'),
  (3, 2, FALSE, 18, 'D', 0, NOW() - INTERVAL '12 hours'),
  
  (4, 1, TRUE, 4, 'B', 10, NOW() - INTERVAL '2 days'),
  (4, 2, TRUE, 6, 'B', 10, NOW() - INTERVAL '2 days'),
  (4, 4, TRUE, 8, 'B', 10, NOW() - INTERVAL '1 day'),
  (4, 5, TRUE, 7, 'C', 10, NOW() - INTERVAL '18 hours'),
  (4, 8, TRUE, 11, 'B', 10, NOW() - INTERVAL '6 hours');

-- ============================================================
-- 7. INSERT SAMPLE STUDENT PROGRESS (Chapter Mastery)
-- ============================================================

INSERT INTO analytics.student_progress (user_id, chapter_id, mastery_score, questions_completed, questions_correct, last_answered_at, created_at, updated_at) 
VALUES 
  (1, 1, 60.0, 4, 3, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '2 days', NOW() - INTERVAL '6 hours'),     -- Alice on Arithmetic
  
  (2, 1, 80.0, 4, 4, NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),         -- Bob on Arithmetic
  (2, 2, 60.0, 1, 1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),         -- Bob on Fractions
  
  (3, 1, 25.0, 2, 0, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours'),    -- Charlie on Arithmetic
  
  (4, 1, 95.0, 4, 4, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '2 days', NOW() - INTERVAL '6 hours'),     -- Diana on Arithmetic
  (4, 2, 88.0, 2, 2, NOW() - INTERVAL '18 hours', NOW() - INTERVAL '2 days', NOW() - INTERVAL '18 hours');   -- Diana on Fractions

-- ============================================================
-- 8. INSERT SAMPLE DAILY ANALYTICS
-- ============================================================

INSERT INTO analytics.daily_analytics (user_id, analytics_date, questions_answered, questions_correct, xp_earned, time_spent_minutes, streak_count, created_at, updated_at) 
VALUES 
  (1, CURRENT_DATE, 2, 1, 10, 15, 1, NOW(), NOW()),
  (1, CURRENT_DATE - INTERVAL '1 day', 2, 2, 20, 20, 2, NOW(), NOW()),
  (1, CURRENT_DATE - INTERVAL '2 days', 2, 2, 20, 22, 3, NOW(), NOW()),
  
  (2, CURRENT_DATE, 1, 1, 10, 8, 5, NOW(), NOW()),
  (2, CURRENT_DATE - INTERVAL '1 day', 1, 1, 10, 9, 4, NOW(), NOW()),
  (2, CURRENT_DATE - INTERVAL '2 days', 2, 2, 20, 16, 3, NOW(), NOW()),
  
  (3, CURRENT_DATE, 2, 0, 0, 25, 0, NOW(), NOW()),
  (3, CURRENT_DATE - INTERVAL '1 day', 0, 0, 0, 0, 0, NOW(), NOW()),
  
  (4, CURRENT_DATE, 1, 1, 10, 10, 8, NOW(), NOW()),
  (4, CURRENT_DATE - INTERVAL '1 day', 1, 1, 10, 11, 7, NOW(), NOW()),
  (4, CURRENT_DATE - INTERVAL '2 days', 2, 2, 20, 15, 6, NOW(), NOW());

-- ============================================================
-- 9. VERIFICATION QUERIES
-- ============================================================

-- Display counts to verify data inserted
SELECT 
  'Students' as table_name, COUNT(*) as count FROM users.students
UNION ALL
SELECT 'Parents', COUNT(*) FROM users.parents
UNION ALL
SELECT 'StudentParentLinks', COUNT(*) FROM users.student_parent_link
UNION ALL
SELECT 'Chapters', COUNT(*) FROM curriculum.chapters
UNION ALL
SELECT 'Topics', COUNT(*) FROM curriculum.topics
UNION ALL
SELECT 'Concepts', COUNT(*) FROM curriculum.concepts
UNION ALL
SELECT 'Questions', COUNT(*) FROM curriculum.questions
UNION ALL
SELECT 'Attempts', COUNT(*) FROM analytics.attempts
UNION ALL
SELECT 'StudentMastery', COUNT(*) FROM analytics.student_mastery
UNION ALL
SELECT 'QuizSubmissions', COUNT(*) FROM analytics.quiz_submissions
UNION ALL
SELECT 'StudentProgress', COUNT(*) FROM analytics.student_progress
UNION ALL
SELECT 'DailyAnalytics', COUNT(*) FROM analytics.daily_analytics
ORDER BY table_name;

-- ============================================================
-- Sample query to retrieve a question for a student
-- ============================================================

SELECT 
  q.id,
  q.concept_id,
  c.name as concept_name,
  q.content,
  q.difficulty_level,
  q.correct_option_key,
  q.explanation
FROM curriculum.questions q
JOIN curriculum.concepts c ON q.concept_id = c.id
WHERE q.concept_id = 1
LIMIT 1;

-- ============================================================
-- Sample query to get student progress
-- ============================================================

SELECT 
  s.id,
  s.name,
  s.total_xp,
  s.current_streak,
  ch.name as chapter_name,
  sp.mastery_score,
  sp.questions_completed,
  sp.questions_correct
FROM users.students s
LEFT JOIN analytics.student_progress sp ON s.id = sp.user_id
LEFT JOIN curriculum.chapters ch ON sp.chapter_id = ch.id
WHERE s.id = 1
ORDER BY ch.id;

-- ============================================================
-- End of DML Script
-- ============================================================
