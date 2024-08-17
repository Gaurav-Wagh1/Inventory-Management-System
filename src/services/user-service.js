const { StatusCodes } = require("http-status-codes");
const { User } = require("../models/index.js");
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
}

module.exports = { UserService };
