const express = require("express");
const router = express.Router();

const { signupUser } = require("../controllers/user-controller.js");
const { validateSignup } = require("../middlewares/user-middleware.js");

router.post("/signup", validateSignup, signupUser);

module.exports = router;
