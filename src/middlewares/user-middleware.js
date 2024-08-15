const axios = require("axios");
const { StatusCodes } = require("http-status-codes");

const {
    EMAIL_VERIFICATION_URL,
    EMAIL_VERIFICATION_KEY,
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

module.exports = {
    validateSignup,
};
