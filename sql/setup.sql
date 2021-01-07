DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS grams CASCADE;
DROP TABLE IF EXISTS comments;

CREATE TABLE users(
  user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  profile_photo_url TEXT NOT NULL
);

CREATE TABLE grams(
  gram_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  photo_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  tags TEXT[],
  user_id BIGINT REFERENCES users(user_id)
);

CREATE TABLE comments(
  comment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  comment TEXT NOT NULL,
  user_id BIGINT REFERENCES users(user_id),
  gram_id BIGINT REFERENCES grams(gram_id)
);