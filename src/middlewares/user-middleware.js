const axios = require("axios");
const { StatusCodes } = require("http-status-codes");

const jwt = require("jsonwebtoken");

const {
    EMAIL_VERIFICATION_URL,
    EMAIL_VERIFICATION_KEY,
    REFRESH_TOKEN_SECRET_STRING,
    ACCESS_TOKEN_SECRET_STRING,
} = require("../config/server-config.js");

const { ResponseError } = require("../utils/response/response.js");

async function validateSignup(req, res, next) {
    if (!req.body.email || !req.body.password) {
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

async function validateRefreshAccessToken(req, res, next) {
    if (!req.cookies.refreshToken && !req.body.refreshToken) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(new ResponseError("Token refresh failed", "Please Sign in!"));
    }

    const token = req.cookies.refreshToken || req.body.refreshToken;
    try {
        const payload = jwt.verify(token, REFRESH_TOKEN_SECRET_STRING);
        if (!payload || !payload.userId) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({
                    error: "Unauthorized user",
                    message: "Please Sign in!",
                });
        }
        req.user = { refreshToken: token, userId: payload.userId };
    } catch (error) {
        if (err.name === "TokenExpiredError") {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(
                    new ResponseError("Token expired", "Please refresh token!")
                );
        }
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(new ResponseError("Token refresh failed", "Please Sign in!"));
    }

    next();
}

async function validateRequest(req, res, next) {
    const accessToken =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
    if (!accessToken) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(new ResponseError("Unauthorized user", "Please Sign in!"));
    }
    let payload;
    try {
        payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET_STRING);
    } catch (error) {
        if (err.name === "TokenExpiredError") {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(
                    new ResponseError("Token expired", "Please log in again.")
                );
        }
    }

    if (!payload || !payload.userId || !payload.email || !payload.role) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(new ResponseError("Unauthorized user", "Please Sign in!"));
    }
    const { userId, email, role } = payload;
    req.user = { userId, email, role };

    next();
}

async function validateUpdateRole(req, res, next) {
    const token = req.cookies.accessToken || req.body.accessToken;
    if (!token) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(
                new ResponseError(
                    "Un-authorized user",
                    "You are not authorized to perform this action!"
                )
            );
    }

    if (!req.body.userId || !req.body.role) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(
                new ResponseError(
                    "Invalid Credentials",
                    "Provide valid credentials to update the role!"
                )
            );
    }

    let response;
    try {
        response = jwt.verify(token, ACCESS_TOKEN_SECRET_STRING);
    } catch (error) {
        if (err.name === "TokenExpiredError") {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(
                    new ResponseError("Token expired", "Please log in again.")
                );
        }
    }

    if (response.role !== "admin") {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(
                new ResponseError(
                    "Un-authorized user",
                    "You are not authorized to perform this action!"
                )
            );
    }
    // req.user = { userId: response.userId, role: response.role };

    next();
}

async function validateGetDetailsRequest(req, res, next) {
    // token does not exits;
    const accessToken =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
    if (!accessToken) {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(new ResponseError("Unauthorized user", "Please Sign in!"));
    }

    // check weather the token is valid or not;
    let payload;
    try {
        payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET_STRING);
    } catch (error) {
        if (err.name === "TokenExpiredError") {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(
                    new ResponseError("Token expired", "Please refresh token!")
                );
        }
    }

    // check weather the token has all required payload information or not;
    if (!payload || !payload.userId || !payload.email || !payload.role) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json(new ResponseError("Unauthorized user", "Please Sign in!"));
    }

    // only admin and staff has authority to check other users details;
    // staff can get customers details;
    // admins can get any users details;
    // customers cannot fetch other user's details;
    if (payload.role !== "admin" && payload.role !== "staff") {
        return res
            .status(StatusCodes.UNAUTHORIZED)
            .json(
                new ResponseError(
                    "Unauthorized user",
                    "You are not authorized to perform this action!"
                )
            );
    }

    req.user = { userId: payload.userId, role: payload.role };

    next();
}

module.exports = {
    validateSignup,
    validateSignIn,
    validateLogout,
    validateRequest,
    validateUpdateRole,
    validateGetDetailsRequest,
    validateRefreshAccessToken,
};
