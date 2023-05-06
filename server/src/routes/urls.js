const express = require("express");
const generateBase62 = require("../utils/generateBase62");
const pool = require("../../db/pg");
const sessionChecker = require("../middlewares/sessionChecker");
const router = express.Router();

// Handler function to create a new URL
async function createUrl(originalUrl) {
    const shortCode = generateBase62();
    const insertResult = await pool.query(
        "INSERT INTO urls (original_url, short_code) VALUES ($1, $2) RETURNING id, short_code",
        [originalUrl, shortCode]
    );
    const id = insertResult.rows[0].id;
    return { id, originalUrl, shortCode };
}

// Handler function to add a URL to a user's list
async function addUserUrl(userId, urlId) {
    const insertResult = await pool.query(
        "INSERT INTO user_urls (user_id, url_id) VALUES ($1, $2) " +
            "ON CONFLICT (user_id, url_id) DO NOTHING " +
            "RETURNING id",
        [userId, urlId]
    );

    // Check if a row was actually inserted
    if (insertResult.rowCount === 0) {
        return null;
    }

    const userUrlId = insertResult.rows[0].id;
    return userUrlId;
}

// Route handler
router.post("/", sessionChecker, async (req, res) => {
    const originalUrl = req.body.originalUrl;

    // Check if the originalUrl already exists
    const result = await pool.query(
        "SELECT id, short_code FROM urls WHERE original_url = $1",
        [originalUrl]
    );

    if (result.rowCount > 0) {
        const urlId = result.rows[0].id;
        const shortCode = result.rows[0].short_code;
        const userUrlId = await addUserUrl(req.session.userId, urlId);
        return res.json({
            id: urlId,
            originalUrl,
            shortCode,
        });
    }

    const url = await createUrl(originalUrl);
    const userUrlId = await addUserUrl(req.session.userId, url.id);

    return res.json(url);
});

// Route handler to retrieve a URL by short code
router.get("/:shortCode", async (req, res) => {
    const shortCode = req.params.shortCode;

    // Find the URL with the specified short code
    const result = await pool.query(
        "SELECT original_url FROM urls WHERE short_code = $1",
        [shortCode]
    );

    if (result.rowCount > 0) {
        const originalUrl = result.rows[0].original_url;
        return res.redirect(originalUrl);
    } else {
        return res.status(404).json({ message: "URL not found" });
    }
});

module.exports = router;
