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

const signInUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { accessToken, refreshToken } = await userService.signIn({
            email,
            password,
        });
        return res
            .status(StatusCodes.OK)
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                maxAge: 15 * 60 * 1000, // 15 mins
            })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 15 * 24 * 60 * 1000, // 15 days
            })
            .json(new ResponseSuccess({}, "User sign in successful"));
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

const logoutUser = async (req, res) => {
    try {
        await userService.logOut(req.user);
        return res
            .status(StatusCodes.OK)
            .clearCookie("accessToken", {
                httpOnly: true,
                secure: true,
                maxAge: 15 * 60 * 1000, // 15 mins
            })
            .clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
                maxAge: 15 * 24 * 60 * 1000, // 15 days
            })
            .json(new ResponseSuccess({}, "Logout successful"));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(
                new ResponseError(
                    error.error,
                    error.message || "Something went wrong in logout!"
                )
            );
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken, accessToken } =
            await userService.refreshAccessToken(req.user);
        return res
            .status(StatusCodes.OK)
            .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                maxAge: 15 * 60 * 1000, // 15 mins
            })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 15 * 24 * 60 * 1000, // 15 days
            })
            .json(new ResponseSuccess({}, "Tokens refreshed successfully!"));
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .clearCookie("accessToken", {
                httpOnly: true,
                secure: true,
                maxAge: 15 * 60 * 1000, // 15 mins
            })
            .clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
                maxAge: 15 * 24 * 60 * 1000, // 15 days
            })
            .json(
                new ResponseError(
                    error.error,
                    error.message || "Something went wrong in logout!"
                )
            );
    }
};

const updateDetails = async (req, res) => {
    try {
        const response = await userService.updateDetails(req.user, req.body);
        return res
            .status(StatusCodes.OK)
            .json(
                new ResponseSuccess(
                    response,
                    "User details updated successfully!"
                )
            );
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(
                new ResponseError(
                    error.error,
                    error.message || "Something went wrong in update details!"
                )
            );
    }
};

module.exports = {
    signupUser,
    signInUser,
    logoutUser,
    updateDetails,
    refreshAccessToken,
};
