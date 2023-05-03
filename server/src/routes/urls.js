const express = require("express");
const generateBase62 = require("../utils/generateBase62");
const pool = require("../../db/pg");
const router = express.Router();

router.post("/", async (req, res) => {
    const originalUrl = req.body.originalUrl;

    // Check if the originalUrl already exists
    const result = await pool.query(
        "SELECT id, short_code FROM urls WHERE original_url = $1",
        [originalUrl]
    );

    if (result.rowCount > 0) {
        const id = result.rows[0].id;
        const shortCode = result.rows[0].short_code;

        return res.json({
            id,
            originalUrl,
            shortCode,
        });
    }

    // Generate and insert the shortCode
    const shortCode = generateBase62();

    const insertResult = await pool.query(
        "INSERT INTO urls (original_url, short_code) VALUES ($1, $2) RETURNING id",
        [originalUrl, shortCode]
    );

    const id = insertResult.rows[0].id;

    return res.json({
        id,
        originalUrl,
        shortCode,
    });
});

module.exports = router;
