ALTER TABLE casual_quizzes DROP COLUMN filter_types;
ALTER TABLE casual_quizzes ADD COLUMN filter_node JSONB;
