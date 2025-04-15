CREATE TABLE collection_sets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE collections (
    id SERIAL PRIMARY KEY,
    collection_set_id INT REFERENCES collection_sets(id),
    name VARCHAR(100) NOT NULL
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    collection_id INT REFERENCES collections(id),
    question_text TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    description TEXT NULL
);