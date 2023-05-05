const pool = require("../../db/pg");

const sessionChecker = async (req, res, next) => {
    if (req.session.userId) {
        return next();
    }

    const result = await pool.query(
        "INSERT INTO users DEFAULT VALUES RETURNING id"
    );
    req.session.userId = result.rows[0].id;
    return next();
};

module.exports = sessionChecker;
