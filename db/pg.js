const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres_user",
    password: "postgres_password",
    host: "postgres_url_shortener",
    port: 5432,
    database: "url_shortener_db",
});

module.exports = pool;
