const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const passport = require("./config/passport-config.js");

const apiRouter = require("./routes/index.js");
const { CORS_ORIGIN } = require("./config/server-config.js");

const app = express();

app.use(
    cors({
        origin: CORS_ORIGIN,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use("/api/v1", apiRouter);

module.exports = app;
