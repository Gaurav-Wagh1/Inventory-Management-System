const { StatusCodes } = require("http-status-codes");
const { User, UserDetail } = require("../models/index.js");
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
                fullName: data.fullName,
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

            // update the fullName if user wants to;
            if (userDetails.fullName) {
                user.fullName = userDetails.fullName;
                delete userDetails.fullName;
            }

            // if only fullName is there to update, return after updating fullName;
            if (Object.keys(userDetails).length == 0) {
                await user.save();
                return "";
            }

            // if user wants to update other data;
            const userDetailsId = user.details;
            let response;

            // if already exists, then update the details;
            if (userDetailsId) {
                response = await UserDetail.findByIdAndUpdate(
                    userDetailsId,
                    { $set: userDetails },
                    { new: true }
                );
            } else {
                response = await UserDetail.create(userDetails); // if not exists, then create the document with details;
                user.details = response._id;
            }
            await user.save();

            return response;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = { UserService };
