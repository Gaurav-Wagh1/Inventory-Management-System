const express = require("express");
const passport = require("passport");

const { ResponseError } = require("../utils/response/response.js");
const userRouter = require("./user-routes.js");
const supplierRouter = require("./supplier-router.js");

const { signupUser, signInUser } = require("../controllers/user-controller.js");

const {
    validateSignup,
    validateAdminRequest,
} = require("../middlewares/user-middleware.js");

const router = express.Router();

// create the first admin account(needs admin secret along with email and pass);
router.post("/admin", validateAdminRequest, validateSignup, signupUser);

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

router.use("/users", userRouter);

router.use("/supplier", supplierRouter);

module.exports = router;
