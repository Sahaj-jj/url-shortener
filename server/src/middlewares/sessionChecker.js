const pool = require("../../db/pg");

async function getUser(userId) {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
        userId,
    ]);
    const user = result.rows[0];
    return user;
}

const sessionChecker = async (req, res, next) => {
    let userId = req.session.userId;
    if (userId) {
        req.user = await getUser(userId);
        return next();
    }

    const result = await pool.query(
        "INSERT INTO users DEFAULT VALUES RETURNING id"
    );
    userId = result.rows[0].id;
    req.session.userId = userId;
    req.user = await getUser(userId);
    return next();
};

module.exports = sessionChecker;
