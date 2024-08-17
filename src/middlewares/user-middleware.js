const axios = require("axios");
const { StatusCodes } = require("http-status-codes");

const jwt = require("jsonwebtoken");

const {
    EMAIL_VERIFICATION_URL,
    EMAIL_VERIFICATION_KEY,
    REFRESH_TOKEN_SECRET_STRING,
} = require("../config/server-config.js");

const { ResponseError } = require("../utils/response/response.js");

async function validateSignup(req, res, next) {
    if (!req.body.email || !req.body.password || !req.body.fullName) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(
                new ResponseError("Signup failed", "Provide valid information!")
            );
    }

    // email verification;
    try {
        const emailValidation = await axios.get(
            `${EMAIL_VERIFICATION_URL}/${req.body.email}/${EMAIL_VERIFICATION_KEY}`
        );
        if (emailValidation.data.Status != "Valid") {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(
                    new ResponseError(
                        "Invalid email address",
                        "Provide valid / active email address!"
                    )
                );
        }
    } catch (error) {
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(
                new ResponseError(
                    "Signup failed",
                    "Cannot validate email, try again later!"
                )
            );
    }

    // password verification;
    const regexForPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!regexForPassword.test(req.body.password)) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(
                new ResponseError(
                    "Invalid password",
                    "Try more complex & secure password!"
                )
            );
    }

    next();
}

async function validateSignIn(req, res, next) {
    if (!req.body.email || !req.body.password) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(
                new ResponseError(
                    "Signin failed",
                    "Provide email and password!"
                )
            );
    }

    // email verification;
    const regexForEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regexForEmail.test(req.body.email)) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(
                new ResponseError(
                    "Incorrect email",
                    "Please enter a valid email address!"
                )
            );
    }

    // password verification;
    const regexForPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!regexForPassword.test(req.body.password)) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(
                new ResponseError(
                    "Incorrect password",
                    "Please enter a valid password!"
                )
            );
    }

    next();
}

async function validateLogout(req, res, next) {
    if (!req.cookies.refreshToken && !req.body.refreshToken) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(
                new ResponseError(
                    "Logout failed",
                    "Provide email and password!"
                )
            );
    }

    const token = req.cookies.refreshToken || req.body.refreshToken;
    try {
        const response = jwt.verify(token, REFRESH_TOKEN_SECRET_STRING);
        req.user = { refreshToken: token, userId: response.userId };
    } catch (error) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(
                new ResponseError(
                    "Logout failed",
                    "Provide valid refresh token!"
                )
            );
    }

    next();
}
module.exports = {
    validateSignup,
    validateSignIn,
    validateLogout,
};
