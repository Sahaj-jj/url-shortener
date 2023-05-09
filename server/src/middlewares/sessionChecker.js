const pool = require("../../db/pg");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

// Configure the Google strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if the user with the Google ID exists in the database
                const existingUser = await pool.query(
                    "SELECT * FROM users WHERE google_id = $1",
                    [profile.id]
                );

                if (existingUser.rows.length > 0) {
                    // User exists, update access and refresh tokens
                    const user = existingUser.rows[0];
                    await pool.query(
                        "UPDATE users SET google_access_token = $1, google_refresh_token = $2 WHERE id = $3",
                        [accessToken, refreshToken, user.id]
                    );
                    done(null, user); // Authenticate the user
                } else {
                    // User does not exist, create a new user
                    const newUser = await pool.query(
                        "INSERT INTO users (google_id, google_access_token, google_refresh_token, is_authenticated, name, email, profile_picture) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
                        [
                            profile.id,
                            accessToken,
                            refreshToken,
                            true,
                            profile.displayName,
                            profile.emails[0].value,
                            profile.photos[0].value, // Store profile picture URL
                        ]
                    );
                    done(null, newUser.rows[0]); // Authenticate the new user
                }
            } catch (error) {
                done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [
            id,
        ]);
        done(null, user.rows[0]);
    } catch (error) {
        done(error);
    }
});

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
