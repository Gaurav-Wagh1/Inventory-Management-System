const express = require("express");

const { signUp, updateStatus } = require("../controllers/supplier-controller");
const {
    signInUser,
    logoutUser,
    getSelfDetails,
    updateDetails,
    refreshAccessToken,
} = require("../controllers/user-controller.js");
const {
    validateSignup,
    validateSignIn,
    validateLogout,
    validateRequest,
    validateRefreshAccessToken,
} = require("../middlewares/user-middleware");
const {
    validateUpdateStatus,
} = require("../middlewares/supplier-middleware.js");

const router = express.Router();

router.post("/signup", validateSignup, signUp);

router.post("/signin", validateSignIn, signInUser);

router.post("/refresh-token", validateRefreshAccessToken, refreshAccessToken); // refresh the access token;

router.post("/logout", validateLogout, logoutUser);

router.get("/details", validateRequest, getSelfDetails);

router.patch("/details", validateRequest, updateDetails);

router.patch("/update-status", validateUpdateStatus, updateStatus); // update user role (only admin has the authority);

module.exports = router;
