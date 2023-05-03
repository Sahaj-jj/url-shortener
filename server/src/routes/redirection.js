const express = require("express");
const pool = require("../../db/pg");
const router = express.Router();

router.get("/:id", async (req, res) => {
    const shortCode = req.params.id;

    const result = await pool.query(
        "SELECT original_url FROM urls WHERE short_code = $1",
        [shortCode]
    );

    if (result.rowCount == 0) {
        return res.sendStatus(400);
    }

    const originalUrl = result.rows[0].original_url;

    res.redirect(302, originalUrl);
});

module.exports = router;
