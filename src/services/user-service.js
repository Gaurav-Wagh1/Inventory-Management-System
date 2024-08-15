const { StatusCodes } = require("http-status-codes");
const { User, Role } = require("../models/index.js");
const { ApiError } = require("../utils/error/api-error.js");

class UserService {
    async signup(data) {
        try {
            // check if user already exist;
            const presentUser =
                (await User.findOne({ email: data.email })) || {};
            if (Object.keys(presentUser).length) {
                throw new ApiError(
                    "User already exist",
                    "User with this email already exists!",
                    StatusCodes.BAD_REQUEST
                );
            }

            // if not already exist, create another user;
            const role = await Role.find({ role: "customer" }).exec(); // be default customer role will be assigned;
            const userData = {
                email: data.email,
                password: data.password,
                fullName: data.fullName,
                role: role._id,
            };
            const user = await User.create(userData);
            return user.safeUser;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = { UserService };
