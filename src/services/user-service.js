const { StatusCodes } = require("http-status-codes");
const { authenticator, totp } = require("otplib");
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

            // create user, if not exist already, customer role by default;
            const userData = {
                email: data.email,
                password: data.password,
            };

            // if request is from admin url, assign the role as admin else it will be customer by default;
            if (data.admin) {
                userData.role = "admin";
            }
            const user = await User.create(userData);
            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save();

            if (data.admin) {
                const adminDetail = new AdminDetail({
                    user: user.id,
                    is2FAEnabled: false,
                });
                await adminDetail.save({ validateBeforeSave: false });
            }
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

            // user logged in through oauth
            // user will update the password then only access the platform;
            if (!user.password) {
                throw new ApiError(
                    "Oauth used for login!",
                    "Update the password from login window",
                    StatusCodes.NOT_ACCEPTABLE
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

            let is2FAEnabled = undefined;
            switch (user.role) {
                case "admin":
                    const adminDetails = await AdminDetail.findOne({
                        user: user.id,
                    });
                    is2FAEnabled = adminDetails.is2FAEnabled;
                    break;

                case "staff":
                    const staffDetails = await StaffDetail.findOne({
                        user: user.id,
                    });
                    is2FAEnabled = staffDetails.is2FAEnabled;
                    break;
            }

            // Two-Factor-Authentication is enabled;
            if (is2FAEnabled === true) {
                const session2FAToken = await user.generateSession2FAToken();
                return { is2FAEnabled: true, session2FAToken };
            }

            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save();

            // This is a customer, no need to check Two-Factor-Authentication;
            if (is2FAEnabled === undefined) {
                return {
                    accessToken,
                    refreshToken,
                };
            } //  2FA is not enabled by the admin / staff;
            else {
                return {
                    accessToken,
                    refreshToken,
                    is2FAEnabled,
                };
            }
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
                        for (const key in userDetails) {
                            customerDetails[key] = userDetails[key];
                        }
                        await customerDetails.save();
                        updatedUserDetails = await CustomerDetail.findById(
                            customerDetails.id
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
                        for (const key in userDetails) {
                            staffDetails[key] = userDetails[key];
                        }
                        await staffDetails.save();
                        updatedUserDetails = await StaffDetail.findById(
                            staffDetails.id
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
                        for (const key in userDetails) {
                            adminDetails[key] = userDetails[key];
                        }
                        await adminDetails.save();
                        updatedUserDetails = await AdminDetail.findById(
                            adminDetails.id
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

            return updatedUserDetails.safeDetails;
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

                case "admin":
                    await AdminDetail.findOneAndDelete({ user: user.id });
                    break;

                default:
                    throw new ApiError(
                        "Invalid role",
                        "Cannot perform this action!",
                        StatusCodes.BAD_REQUEST
                    );
            }

            // update user role and log out the user;
            // if role is admin / staff, allow them for 2-factor-authentication;
            if (role == "staff") {
                user.role = "staff";
                user.refreshToken = "";
                await user.save();

                const staffDetail = new StaffDetail({
                    user: user.id,
                    is2FAEnabled: false,
                });
                await staffDetail.save({ validateBeforeSave: false });
            } else if (role == "admin") {
                user.role = "admin";
                user.refreshToken = "";
                await user.save();

                const adminDetail = new AdminDetail({
                    user: user.id,
                    is2FAEnabled: false,
                });
                await adminDetail.save({ validateBeforeSave: false });
            } else if (role == "customer") {
                user.role = "customer";
                user.refreshToken = "";
                await user.save();
            }
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

    async enableTwoFA({ userId }) {
        try {
            const user = await User.findById(userId);

            if (!user) {
                throw new ApiError(
                    "No user found",
                    "No such user found, signup first!",
                    StatusCodes.BAD_REQUEST
                );
            }

            if (user.role === "customer") {
                throw new ApiError(
                    "Un-Authorized user",
                    "You are not authorized to perform this action!",
                    StatusCodes.UNAUTHORIZED
                );
            }

            const secret = authenticator.generateSecret();

            if (user.role == "admin") {
                await AdminDetail.findOneAndUpdate(
                    { user: user.id },
                    {
                        twoFASecret: secret,
                        is2FAEnabled: true,
                    }
                );
            } else if (user.role == "staff") {
                await StaffDetail.findOneAndUpdate(
                    { user: user.id },
                    {
                        twoFASecret: secret,
                        is2FAEnabled: true,
                    }
                );
            }
            // QR code of this secret will be generated on client side;
            return { secret, is2FAEnabled: true };
        } catch (error) {
            throw error;
        }
    }

    async verifyTwoFA(userId, token) {
        try {
            const user = await User.findById(userId);

            if (!user) {
                throw new ApiError(
                    "No such user",
                    "No such user exist, sign up first",
                    StatusCodes.BAD_REQUEST
                );
            }

            let userDetails = {};
            if (user.role == "admin") {
                userDetails = await AdminDetail.findOne({ user: userId });
            } else if (user.role == "staff") {
                userDetails = await StaffDetail.findOne({ user: userId });
            }

            if (!userDetails.is2FAEnabled) {
                throw new ApiError(
                    "Authentication disabled",
                    "Two-Factor Authentication is already disabled",
                    StatusCodes.BAD_REQUEST
                );
            }
            const isValid = authenticator.verify({
                token,
                secret: userDetails.twoFASecret,
            });
            if (!isValid) {
                throw new ApiError(
                    "Invalid code",
                    "Invalid OTP, Re-enter the authenticator code",
                    StatusCodes.BAD_REQUEST
                );
            }

            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save();

            return { accessToken, refreshToken, isValid };
        } catch (error) {
            throw error;
        }
    }

    async disableTwoFA({ userId }) {
        try {
            const user = await User.findById(userId);

            let userDetails = {};
            switch (user.role) {
                case "admin":
                    userDetails = await AdminDetail.findOne({ user: userId });
                    break;
                case "staff":
                    userDetails = await StaffDetail.findOne({ user: userId });
                    break;
                default:
                    throw new ApiError(
                        "Un authorized",
                        "You are not authorized to perform this action!",
                        StatusCodes.BAD_REQUEST
                    );
            }

            userDetails.is2FAEnabled = false;
            userDetails.twoFASecret = "";
            await userDetails.save();

            return true;
        } catch (error) {
            throw error;
        }
    }

    async handleOauth(userData) {
        try {
            if (userData.role === "customer") {
                const accessToken = await userData.generateAccessToken();
                const refreshToken = await userData.generateRefreshToken();
                return { accessToken, refreshToken };
            }

            if (userData.is2FAEnabled) {
                const session2FAToken =
                    await userData.generateSession2FAToken();
                return { is2FAEnabled: userData.is2FAEnabled, session2FAToken };
            } else {
                const accessToken = await userData.generateAccessToken();
                const refreshToken = await userData.generateRefreshToken();
                return {
                    is2FAEnabled: userData.is2FAEnabled,
                    accessToken,
                    refreshToken,
                };
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = { UserService };
