INSERT INTO curriculum.chapters (name, sequence_order, unit_tag) VALUES
('The Fish Tale', 1, 'NUM_SYS'),
('Shapes and Angles', 2, 'GEOMETRY');

INSERT INTO curriculum.topics (chapter_id, name, description) VALUES
(1, 'Reading/Writing Large Numbers', 'Focus on reading and writing large numbers in words and digits'),
(1, 'Understanding Place Value', 'Understanding the value of digits based on their place'),
(2, 'Identifying Types of Angles', 'Recognizing acute, right, obtuse, straight, and reflex angles'),
(2, 'Measuring Angles with Protractor', 'Using a protractor to measure angles in degrees');

INSERT INTO curriculum.concepts (topic_id, name, misconception_guide) VALUES
(1, 'Reading Large Numbers', 'Practice grouping digits into sets of three'),
(1, 'Writing Numbers in Words', 'Focus on place names (thousands, lakhs, etc.)'),
(2, 'Identifying Place Value', 'Use place value charts to locate each digit''s position'),
(2, 'Comparing Place Values', 'Compare digits starting from the highest place value'),
(3, 'Acute vs Obtuse Angles', 'Check if the angle is less or greater than 90°'),
(3, 'Right, Straight, and Reflex Angles', 'Remember standard measures: 90°, 180°, and >180°'),
(4, 'Using a Protractor', 'Ensure the baseline is aligned and measure using correct scale'),
(4, 'Reading Angle Measurement', 'Read the degree marking where the second ray crosses');

INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) VALUES
(1, '{"text": "Read the number 907532 in words.", "options": {"A": "Nine lakh seven thousand five hundred thirty-two", "B": "Nine lakh seventy thousand five hundred thirty-two", "C": "Nine lakh five hundred thirty-two", "D": "Seven lakh nine thousand five hundred thirty-two"}}', 2, 'A', '907532 = 9,07,532 (nine lakh, seven thousand, five hundred thirty-two)'),
(1, '{"text": "Which number is written as six lakh thirty-four thousand one hundred twenty-five?", "options": {"A": "634125", "B": "630145", "C": "639415", "D": "634501"}}', 2, 'A', 'Six lakh thirty-four thousand one hundred twenty-five = 634125');

INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) VALUES
(2, '{"text": "Write the number 702015 in words.", "options": {"A": "Seven lakh two thousand fifteen", "B": "Seven lakh twenty thousand fifteen", "C": "Seven thousand fifteen", "D": "Seven lakh two thousand one hundred five"}}', 2, 'A', '702015 = seven lakh, two thousand, fifteen'),
(2, '{"text": "Which number is written as eight lakh forty thousand six hundred twelve?", "options": {"A": "804612", "B": "840612", "C": "846012", "D": "806412"}}', 2, 'B', 'Eight lakh forty thousand six hundred twelve = 840612');

INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) VALUES
(3, '{"text": "In the number 45678, which digit is in the tens place?", "options": {"A": "7", "B": "8", "C": "6", "D": "5"}}', 1, 'A', 'In 45678, the digit 7 is in the tens place'),
(3, '{"text": "What is the place value of 7 in 47125?", "options": {"A": "7000", "B": "700", "C": "70000", "D": "70"}}', 2, 'A', '7 is in the thousands place, so its value is 7000');

INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) VALUES
(4, '{"text": "In 56783, which digit has a greater place value, 6 or 7?", "options": {"A": "6", "B": "7", "C": "They have equal place value", "D": "None of these"}}', 2, 'A', '6 is in the thousands place (6000) and 7 is in the hundreds place (700), so 6 has greater place value'),
(4, '{"text": "Which digit has the greater place value in 98324: 8 or 3?", "options": {"A": "8", "B": "3", "C": "9", "D": "They are the same"}}', 2, 'A', '8 is in the thousands place (8000) and 3 is in the hundreds place (300), so 8 has greater place value');

INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) VALUES
(5, '{"text": "What is an angle that measures 60 degrees called?", "options": {"A": "Acute angle", "B": "Obtuse angle", "C": "Right angle", "D": "Straight angle"}}', 1, 'A', 'An angle less than 90° is an acute angle'),
(5, '{"text": "What is an angle that measures 120 degrees called?", "options": {"A": "Acute angle", "B": "Obtuse angle", "C": "Right angle", "D": "Straight angle"}}', 1, 'B', 'An angle between 90° and 180° is an obtuse angle');

INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) VALUES
(6, '{"text": "What is an angle of 90 degrees called?", "options": {"A": "Right angle", "B": "Straight angle", "C": "Acute angle", "D": "Obtuse angle"}}', 1, 'A', 'An angle of 90° is called a right angle'),
(6, '{"text": "What is an angle of 180 degrees called?", "options": {"A": "Straight angle", "B": "Right angle", "C": "Obtuse angle", "D": "Acute angle"}}', 1, 'A', 'An angle of 180° is called a straight angle');

INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) VALUES
(7, '{"text": "Which instrument is used to measure angles?", "options": {"A": "Ruler", "B": "Protractor", "C": "Compass", "D": "Set square"}}', 1, 'B', 'A protractor is used to measure angles'),
(7, '{"text": "Tina wants to measure an angle on her worksheet. Which tool should she use?", "options": {"A": "Ruler", "B": "Protractor", "C": "Compass", "D": "Pencil"}}', 1, 'B', 'Tina should use a protractor to measure the angle');

INSERT INTO curriculum.questions (concept_id, content, difficulty_level, correct_option_key, explanation) VALUES
(8, '{"text": "Using a protractor, an angle measures 135 degrees. What type of angle is it?", "options": {"A": "Acute angle", "B": "Right angle", "C": "Obtuse angle", "D": "Straight angle"}}', 2, 'C', 'An angle measuring 135° is between 90° and 180°, so it is an obtuse angle'),
(8, '{"text": "Using a protractor, an angle measures 45 degrees. What type of angle is it?", "options": {"A": "Acute angle", "B": "Right angle", "C": "Obtuse angle", "D": "Straight angle"}}', 2, 'A', 'An angle measuring 45° is less than 90°, so it is an acute angle');
