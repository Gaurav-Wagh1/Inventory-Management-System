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
            admin: req.admin,
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
        let response;
        if (req.path.includes("/signin")) {
            response = await userService.signIn({
                email,
                password,
            });
        } else if (req.path.includes("/auth/github/callback")) {
            response = await userService.handleOauth(req.user);
        }
        if (response.is2FAEnabled == undefined) {
            return res
                .status(StatusCodes.OK)
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
                .json(new ResponseSuccess({}, "User sign in successful"));
        } else if (response.is2FAEnabled == true) {
            return res
                .status(StatusCodes.OK)
                .cookie("session2FAToken", response.session2FAToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 5 * 60 * 1000, // 5 mins
                })
                .json(
                    new ResponseSuccess(
                        { is2FAEnabled: response.is2FAEnabled },
                        "Enter Authenticator code"
                    )
                );
        } else {
            return res
                .status(StatusCodes.OK)
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
                        { is2FAEnabled: response.is2FAEnabled },
                        "User sign in successful"
                    )
                );
        }
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

const updateRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        await userService.updateRole({ userId, role });
        return res
            .status(StatusCodes.OK)
            .json(
                new ResponseSuccess(
                    {},
                    `Successfully updated the user role to ${req.body.role}`
                )
            );
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(
                new ResponseError(
                    error.error,
                    error.message || "Something went wrong in role update!"
                )
            );
    }
};

const getSelfDetails = async (req, res) => {
    try {
        const response = await userService.getSelfDetails(req.user);
        return res
            .status(StatusCodes.OK)
            .json(
                new ResponseSuccess(
                    response,
                    `Successfully fetched user details`
                )
            );
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(
                new ResponseError(
                    error.error,
                    error.message || "Something went wrong in data fetch!"
                )
            );
    }
};

const getDetails = async (req, res) => {
    try {
        const response = await userService.getDetails(req.user, req.params.id);
        return res
            .status(StatusCodes.OK)
            .json(
                new ResponseSuccess(
                    response,
                    `Successfully fetched user details`
                )
            );
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(
                new ResponseError(
                    error.error,
                    error.message || "Something went wrong in data fetch!"
                )
            );
    }
};

const enableTwoFA = async (req, res) => {
    try {
        const response = await userService.enableTwoFA(req.user);
        return res
            .status(StatusCodes.OK)
            .json(
                new ResponseSuccess(
                    response,
                    `Successfully enabled Two-Factor Authentication`
                )
            );
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(
                new ResponseError(
                    error.error,
                    error.message || "Something went wrong in data fetch!"
                )
            );
    }
};

const verifyTwoFA = async (req, res) => {
    try {
        const response = await userService.verifyTwoFA(
            req.user.userId,
            req.body.totp
        );
        return res
            .status(StatusCodes.OK)
            .clearCookie("session2FAToken", {
                httpOnly: true,
                secure: true,
                maxAge: 5 * 60 * 1000, // 15 mins
            })
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
                    { isCodeValid: response.isValid },
                    `User is successfully authenticated`
                )
            );
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(
                new ResponseError(
                    error.error,
                    error.message || "Something went wrong in data fetch!"
                )
            );
    }
};

const disableTwoFA = async (req, res) => {
    try {
        const response = await userService.disableTwoFA(req.user);
        return res
            .status(StatusCodes.OK)
            .json(
                new ResponseSuccess(
                    response,
                    "TwoFA disabled, kindly enable it to avoid any security issues!"
                )
            );
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(
                new ResponseError(
                    error.error,
                    error.message || "Something went wrong in disable twoFA!"
                )
            );
    }
};

module.exports = {
    signupUser,
    signInUser,
    logoutUser,
    updateRole,
    getDetails,
    enableTwoFA,
    verifyTwoFA,
    disableTwoFA,
    updateDetails,
    getSelfDetails,
    refreshAccessToken,
};
