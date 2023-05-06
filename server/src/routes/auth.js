const express = require("express");
const pool = require("../../db/pg");
const sessionChecker = require("../middlewares/sessionChecker");
const router = express.Router();
const bcrypt = require("bcrypt");

router.post("/signup", sessionChecker, async (req, res) => {
    const { name, email, password } = req.body;
    const userId = req.user.id;

    try {
        // Generate a password hash using bcrypt
        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );
        if (result.rowCount > 0) {
            return res.json({
                success: false,
                message: "User found with the same email",
            });
        }

        // Insert a new user into the database
        await pool.query(
            "UPDATE users " +
                "SET name = $1, email = $2, password_hash = $3, is_authenticated = $4 " +
                "WHERE id = $5",
            [name, email, passwordHash, true, userId]
        );

        return res.json({
            success: true,
            message: "User registered successfully",
        });
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({ success: false, message: "Error registering user" });
    }
});

router.post("/login", sessionChecker, async (req, res) => {
    const { email, password } = req.body;
    if (req.user.is_authenticated) {
        return res.json({
            success: true,
            message: "User logged in successfully",
        });
    }

    try {
        const {
            rowCount,
            rows: [user],
        } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (
            rowCount === 0 ||
            !(await bcrypt.compare(password, user.password_hash))
        ) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid email or password" });
        }

        await pool.query(
            "UPDATE users SET is_authenticated = $1 WHERE id = $2",
            [true, user.id]
        );

        await pool.query("BEGIN"); // Start a transaction

        const migrationQuery = {
            text: `
          UPDATE user_urls
          SET user_id = $1
          WHERE user_id = $2
            AND url_id NOT IN (
              SELECT url_id
              FROM user_urls
              WHERE user_id = $1
            )
        `,
            values: [user.id, req.user.id],
        };

        await pool.query(migrationQuery);

        await pool.query("DELETE FROM user_urls WHERE user_id = $1", [
            req.user.id,
        ]);

        await pool.query("DELETE FROM users WHERE id = $1", [req.user.id]);

        await pool.query("COMMIT"); // Commit the transaction

        req.session.userId = user.id;

        return res.json({
            success: true,
            message: "User logged in successfully",
        });
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json({ success: false, message: "Error logging in user" });
    }
});

router.get("/logout", async (req, res) => {
    try {
        await pool.query("UPDATE users SET is_authenticated = false");
        req.session.destroy();
        return res.json({
            success: true,
            message: "User logged out successfully",
        });
    } catch (err) {
        console.log(err);
        return res.status(500);
    }
});

module.exports = router;
