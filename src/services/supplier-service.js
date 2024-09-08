const { StatusCodes } = require("http-status-codes");
const { User, SupplierDetail } = require("../models/index.js");
const { ApiError } = require("../utils/error/api-error");

class SupplierService {
    async signUp({ email, password }) {
        try {
            const supplier = await User.create({
                email,
                password,
                role: "supplier",
            });
            await SupplierDetail.create({
                user: supplier.id,
                status: "pending",
            });

            const accessToken = await supplier.generateAccessToken();
            const refreshToken = await supplier.generateRefreshToken();
            supplier.refreshToken = refreshToken;
            await supplier.save();

            return { accessToken, refreshToken, supplier: supplier.safeUser };
        } catch (error) {
            if (error.code === 11000) {
                // mongoose error code for duplicate entry, means with this email already exist;
                throw new ApiError(
                    "Already exist",
                    "User with this email already exist!",
                    StatusCodes.BAD_REQUEST
                );
            }
            throw error;
        }
    }

    async updateStatus({ userId, status }) {
        // supplierId, status to update;
        try {
            const supplier = await User.findById(userId);
            if (!supplier) {
                throw new ApiError(
                    "No such user",
                    "No user with this credentials!",
                    StatusCodes.BAD_REQUEST
                );
            }

            const supplierDetails = await SupplierDetail.findOneAndUpdate(
                { user: supplier.id },
                { status },
                { new: true }
            );

            return { supplier, supplierDetails: supplierDetails.safeDetails };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = { SupplierService };
