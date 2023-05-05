\c url_shortener_db;

CREATE TABLE urls (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(7) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    is_authenticated BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE user_urls (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    url_id INTEGER REFERENCES urls(id)
);
