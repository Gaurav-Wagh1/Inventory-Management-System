const { StatusCodes } = require("http-status-codes");

const { UserService } = require("../services/user-service.js");
const {
    ResponseError,
    ResponseSuccess,
} = require("../utils/response/response.js");

const userService = new UserService();

const signupUser = async (req, res) => {
    try {
        const data = {
            email: req.body.email,
            password: req.body.password,
            fullName: req.body.fullName,
        };
        const response = await userService.signup(data);
        return res
            .status(StatusCodes.CREATED)
            .cookie("accessToken", response.accessToken, {
                httpOnly: true,
                secure: true,
                maxAge: 15 * 60 * 1000, // 15 mins
            })
            .cookie("refreshToken", response.refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 15 * 24 * 60 * 1000, // 15 days
            })
            .json(
                new ResponseSuccess(
                    response.userData,
                    "User sign up successful"
                )
            );
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(
                new ResponseError(
                    error.error,
                    error.message || "Something went wrong!"
                )
            );
    }
};

module.exports = {
    signupUser,
};
