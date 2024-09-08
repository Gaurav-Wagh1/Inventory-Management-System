const { StatusCodes } = require("http-status-codes");
const { SupplierService } = require("../services/supplier-service.js");
const {
    ResponseError,
    ResponseSuccess,
} = require("../utils/response/response.js");
const supplierService = new SupplierService();

const signUp = async (req, res) => {
    try {
        const { email, password } = req.body;
        const response = await supplierService.signUp({ email, password });
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
                    response.supplier,
                    "Supplier sign up successful"
                )
            );
    } catch (error) {
        return res
            .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
            .json(
                new ResponseError(
                    error.error,
                    error.message || "Something went wrong in supplier signup!"
                )
            );
    }
};

const updateStatus = async (req, res) => {
    try {
        const { userId, status } = req.body;
        await supplierService.updateStatus({ userId, status });
        return res
            .status(StatusCodes.OK)
            .json(
                new ResponseSuccess(
                    {},
                    `Successfully updated the user role to ${req.body.status}`
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

module.exports = {
    signUp,
    updateStatus,
};
