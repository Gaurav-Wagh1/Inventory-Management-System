const express = require("express");
const router = express.Router();

const {
    signupUser,
    signInUser,
    logoutUser,
} = require("../controllers/user-controller.js");
const {
    validateSignup,
    validateSignIn,
    validateLogout,
} = require("../middlewares/user-middleware.js");

router.post("/signup", validateSignup, signupUser);

router.post("/signin", validateSignIn, signInUser);

router.post("/logout", validateLogout, logoutUser);

module.exports = router;
