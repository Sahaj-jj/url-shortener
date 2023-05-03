const express = require("express");
const urlRoutes = require("./routes/urls");
const redirectionRoutes = require("./routes/redirection");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use("/urls", urlRoutes);
app.use("/r", redirectionRoutes);

app.get("/", (_, res) => {
    res.send("Hello");
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
