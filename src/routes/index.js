const express = require("express");
const router = express.Router();

const { signupUser, signInUser } = require("../controllers/user-controller.js");
const {
    validateSignup,
    validateSignIn,
} = require("../middlewares/user-middleware.js");

router.post("/signup", validateSignup, signupUser);

router.post("/signin", validateSignIn, signInUser);

module.exports = router;
