const express = require("express");
const router = express.Router();

const {
    signupUser,
    signInUser,
    logoutUser,
    refreshAccessToken,
    updateDetails,
    updateRole,
    getSelfDetails,
    getDetails,
    enableTwoFA,
    verifyTwoFA,
    disableTwoFA,
} = require("../controllers/user-controller.js");

const {
    validateSignup,
    validateSignIn,
    validateLogout,
    validateRequest,
    validateRefreshAccessToken,
    validateUpdateRole,
    validateGetDetailsRequest,
    validate2FARequest,
} = require("../middlewares/user-middleware.js");

router.post("/signup", validateSignup, signupUser); // signup user;

router.post("/signin", validateSignIn, signInUser); // signin users;

router.post("/logout", validateLogout, logoutUser); // logout user;

router.post("/refresh-token", validateRefreshAccessToken, refreshAccessToken); // refresh the access token;

router.patch("/details", validateRequest, updateDetails); // update user details;

router.patch("/update-role", validateUpdateRole, updateRole); // update user role (only admin has the authority);

router.get("/details", validateRequest, getSelfDetails); // anyone can fetch their own details;

router.get("/:id", validateGetDetailsRequest, getDetails); // get other's details, staff can get customer's details, admin can get any details;

// ------------------------------------------------------------------- 2-Factor-Authentication

router.post("/enable-2fa", validateRequest, enableTwoFA);

router.post("/verify-2fa", validate2FARequest, verifyTwoFA);

router.post("/disable-2fa", validateRequest, disableTwoFA);

module.exports = router;
