\c url_shortener_db;

CREATE TABLE urls (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(7) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    password_hash CHAR(60),
    is_authenticated BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE user_urls (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    url_id INTEGER REFERENCES urls(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_urls_unique_user_id_url_id UNIQUE (user_id, url_id)
);
