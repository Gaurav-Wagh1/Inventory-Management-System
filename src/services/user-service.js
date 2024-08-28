const { StatusCodes } = require("http-status-codes");
const {
    User,
    AdminDetail,
    CustomerDetail,
    StaffDetail,
} = require("../models/index.js");
const { ApiError } = require("../utils/error/api-error.js");

class UserService {
    async signup(data) {
        try {
            // check if user already exist;
            const presentUser =
                (await User.findOne({ email: data.email })) || {};
            if (Object.keys(presentUser).length) {
                // user found
                throw new ApiError(
                    "User already exist",
                    "User with this email already exists!",
                    StatusCodes.BAD_REQUEST
                );
            }

            // create user, if not exist already;
            const userData = {
                email: data.email,
                password: data.password,
            };
            const user = await User.create(userData);
            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save();
            return {
                accessToken,
                refreshToken,
                userData: user.safeUser,
            };
        } catch (error) {
            throw error;
        }
    }

    async signIn(data) {
        try {
            const user = await User.findOne({ email: data.email });

            // user not found;
            if (!user) {
                throw new ApiError(
                    "No such user",
                    "No user found, signup first!",
                    StatusCodes.BAD_REQUEST
                );
            }

            const isPasswordCorrect = await user.comparePassword(data.password);
            // incorrect password;
            if (!isPasswordCorrect) {
                throw new ApiError(
                    "Incorrect password",
                    "Enter correct password",
                    StatusCodes.BAD_REQUEST
                );
            }

            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save();

            return {
                accessToken,
                refreshToken,
            };
        } catch (error) {
            throw error;
        }
    }

    async logOut(data) {
        try {
            await User.findByIdAndUpdate(data.userId, { refreshToken: "" });
        } catch (error) {
            throw error;
        }
    }

    async refreshAccessToken(data) {
        try {
            const user = await User.findById(data.userId);
            if (user.refreshToken !== data.refreshToken) {
                user.refreshToken = "";
                await user.save();
                throw new ApiError(
                    "Invalid token",
                    "Invalid token, sign in again to access account",
                    StatusCodes.CONFLICT
                );
            }

            const newRefreshToken = await user.generateRefreshToken();
            const newAccessToken = await user.generateAccessToken();

            user.refreshToken = newRefreshToken;
            await user.save();

            return {
                refreshToken: newRefreshToken,
                accessToken: newAccessToken,
            };
        } catch (error) {
            throw error;
        }
    }

    async updateDetails(userData, userDetails) {
        try {
            const user = await User.findById(userData.userId);

            // user not found;
            if (!user) {
                throw new ApiError(
                    "Invalid token",
                    "Sign in again!",
                    StatusCodes.BAD_REQUEST
                );
            }

            // role is not aligning with received role;
            if (userData.role !== user.role) {
                this.logOut(userData);
                throw new ApiError(
                    "Invalid token",
                    "Sign in again",
                    StatusCodes.BAD_REQUEST
                );
            }

            // role based data update;
            let updatedUserDetails = {};
            switch (userData.role) {
                case "customer":
                    let customerDetails = await CustomerDetail.findOne({
                        user: user.id,
                    });

                    if (!customerDetails) {
                        userDetails.user = user.id;
                        updatedUserDetails =
                            await CustomerDetail.create(userDetails);
                    } else {
                        updatedUserDetails =
                            await CustomerDetail.findByIdAndUpdate(
                                customerDetails.id,
                                { $set: userDetails },
                                { new: true }
                            );
                    }
                    break;
                case "staff":
                    let staffDetails = await StaffDetail.findOne({
                        user: user.id,
                    });

                    if (!staffDetails) {
                        userDetails.user = user.id;
                        updatedUserDetails =
                            await StaffDetail.create(userDetails);
                    } else {
                        updatedUserDetails =
                            await StaffDetail.findByIdAndUpdate(
                                staffDetails.id,
                                { $set: userDetails },
                                { new: true }
                            );
                    }
                    break;
                case "admin":
                    let adminDetails = await AdminDetail.findOne({
                        user: user.id,
                    });

                    if (!adminDetails) {
                        userDetails.user = user.id;
                        updatedUserDetails =
                            await AdminDetail.create(userDetails);
                    } else {
                        updatedUserDetails =
                            await AdminDetail.findByIdAndUpdate(
                                adminDetails.id,
                                { $set: userDetails },
                                { new: true }
                            );
                    }
                    break;

                default:
                    throw new ApiError(
                        "Invalid role",
                        "Login again",
                        StatusCodes.BAD_REQUEST
                    );
            }

            return updatedUserDetails;
        } catch (error) {
            throw error;
        }
    }

    async updateRole({ userId, role }) {
        try {
            const user = await User.findById(userId);

            // user not found;
            if (!user) {
                throw new ApiError(
                    "No such user",
                    "No user found with this credentials!",
                    StatusCodes.BAD_REQUEST
                );
            }

            // delete if user has any details related to previous role;
            switch (user.role) {
                case "customer":
                    await CustomerDetail.findOneAndDelete({ user: user.id });
                    break;

                case "staff":
                    await StaffDetail.findOneAndDelete({ user: user.id });
                    break;

                default:
                    throw new ApiError(
                        "Invalid role",
                        "Cannot perform this action!",
                        StatusCodes.BAD_REQUEST
                    );
            }
            // update user role and log out the user;
            user.role = role;
            user.refreshToken = "";
            await user.save();
        } catch (error) {
            throw error;
        }
    }

    async getSelfDetails(selfData) {
        try {
            const user = await User.findById(selfData.userId);
            let userDetails;
            switch (user.role) {
                case "customer":
                    userDetails = await CustomerDetail.findOne({
                        user: user.id,
                    });
                    break;

                case "staff":
                    userDetails = await StaffDetail.findOne({ user: user.id });
                    break;

                case "admin":
                    userDetails = await AdminDetail.findOne({ user: user.id });
                    break;
                default:
                    throw new ApiError(
                        "Invalid role",
                        "Cannot perform this action!",
                        StatusCodes.BAD_REQUEST
                    );
            }
            return {
                user: user.safeUser,
                userDetails: userDetails?.safeDetails || {},
            };
        } catch (error) {
            throw error;
        }
    }

    async getDetails(userSelfData, requestedUserId) {
        try {
            const selfUser = await User.findById(userSelfData.userId);

            if (selfUser.role === "customer") {
                throw new ApiError(
                    "UnAuthorized user",
                    "You are not authorized to perform this action!",
                    StatusCodes.UNAUTHORIZED
                );
            }

            const requestedUserData = await this.getSelfDetails({
                userId: requestedUserId,
            });

            switch (selfUser.role) {
                case "staff":
                    // staff member cannot access admin's or other staff member's details;
                    if (
                        requestedUserData.user.role === "admin" ||
                        requestedUserData.user.role === "staff"
                    ) {
                        throw new ApiError(
                            "UnAuthorized user",
                            "You are not authorized to perform this action!",
                            StatusCodes.UNAUTHORIZED
                        );
                    }
                    return requestedUserData;
                case "admin":
                    // admin can access anyone's details;
                    return requestedUserData;

                default:
                    throw new ApiError(
                        "Invalid role",
                        "You are not authorized to perform this action!",
                        StatusCodes.UNAUTHORIZED
                    );
            }
        } catch (error) {
            // console.log(error)
            throw error;
        }
    }
}

module.exports = { UserService };
