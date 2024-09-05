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
    validateAdminRequest,
} = require("../middlewares/user-middleware.js");
const passport = require("passport");
const { ResponseError } = require("../utils/response/response.js");

// create the first admin account(needs admin secret along with email and pass);
router.post("/admin", validateAdminRequest, validateSignup, signupUser);

router.post("/users/signup", validateSignup, signupUser); // signup user;

router.post("/users/signin", validateSignIn, signInUser); // signin users;

router.post("/users/logout", validateLogout, logoutUser); // logout user;

router.post(
    "/users/refresh-token",
    validateRefreshAccessToken,
    refreshAccessToken
); // refresh the access token;

router.patch("/users/details", validateRequest, updateDetails); // update user details;

router.patch("/users/update-role", validateUpdateRole, updateRole); // update user role (only admin has the authority);

router.get("/users/details", validateRequest, getSelfDetails); // anyone can fetch their own details;

router.get("/users/:id", validateGetDetailsRequest, getDetails); // get other's details, staff can get customer's details, admin can get any details;

// ------------------------------------------------------------------- 2-Factor-Authentication

router.post("/users/enable-2fa", validateRequest, enableTwoFA);

router.post("/users/verify-2fa", validate2FARequest, verifyTwoFA);

router.post("/users/disable-2fa", validateRequest, disableTwoFA);

// ------------------------------------------------------------------- oauth

// initiate github oauth
router.get(
    "/auth/github",
    passport.authenticate("github", { scope: ["user:email"] })
);

// successful oauth;
router.get(
    "/auth/github/callback",
    passport.authenticate("github", {
        session: false,
        failureRedirect: "/api/v1/auth/github/failure",
    }),
    signInUser
);

// un-successful oauth
router.get("/auth/github/failure", (req, res) =>
    res
        .status(401)
        .json(
            new ResponseError(
                "Oauth failed",
                "Github authentication failed, try again later"
            )
        )
);

module.exports = router;
