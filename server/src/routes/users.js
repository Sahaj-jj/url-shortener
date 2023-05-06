const express = require("express");
const sessionChecker = require("../middlewares/sessionChecker");
const pool = require("../../db/pg");
const router = express.Router();

router.get("/", sessionChecker, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [
            userId,
        ]);

        if (result.rowCount === 0) {
            return res.status(404);
        }

        const user = result.rows[0];
        return res.json(user);
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
});

router.get("/urls", sessionChecker, async (req, res) => {
    const userId = req.user.id;

    const result = await pool.query(
        "SELECT urls.id, urls.short_code, urls.original_url, urls.created_at " +
            "FROM urls " +
            "INNER JOIN user_urls ON urls.id = user_urls.url_id " +
            "WHERE user_urls.user_id = $1 " +
            "ORDER BY user_urls.created_at DESC",
        [userId]
    );

    const urls = result.rows.map((row) => ({
        id: row.id,
        shortCode: row.short_code,
        originalUrl: row.original_url,
        createdAt: row.created_at,
    }));

    res.json({
        data: urls,
    });
});

module.exports = router;
