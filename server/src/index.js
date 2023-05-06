const express = require("express");
const authRoutes = require("./routes/auth");
const urlRoutes = require("./routes/urls");
const redirectionRoutes = require("./routes/redirection");
const userRoutes = require("./routes/users");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(
    session({
        secret: "my-secret",
    })
);

app.use("/auth", authRoutes);
app.use("/urls", urlRoutes);
app.use("/users", userRoutes);
app.use("/r", redirectionRoutes);

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
