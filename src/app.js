const express = require("express");
const cookieParser = require("cookie-parser");

const apiRouter = require("./routes/index.js");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", apiRouter);

module.exports = app;
