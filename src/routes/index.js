const express = require("express");
const router = express.Router();

const {
    signupUser,
    signInUser,
    logoutUser,
    refreshAccessToken,
    updateDetails,
} = require("../controllers/user-controller.js");
const {
    validateSignup,
    validateSignIn,
    validateLogout,
    validateDetailsRequest,
    validateRefreshAccessToken,
} = require("../middlewares/user-middleware.js");

router.post("/users/signup", validateSignup, signupUser);

router.post("/users/signin", validateSignIn, signInUser);

router.post("/users/logout", validateLogout, logoutUser);

router.post(
    "/users/refresh-token",
    validateRefreshAccessToken,
    refreshAccessToken
);

router.patch("/users/details", validateDetailsRequest, updateDetails);

module.exports = router;
