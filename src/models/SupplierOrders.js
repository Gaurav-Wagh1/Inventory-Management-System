const mongoose = require("mongoose");

const supplierOrdersSchema = new mongoose.Schema(
    {
        supplierProduct: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SupplierProduct",
            index: true,
        },
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        productDetails: {
            unitPrice: {
                type: mongoose.Schema.Types.Decimal128,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            total: {
                type: mongoose.Schema.Types.Decimal128,
                required: true,
            },
            lastModified: {
                type: Date,
                default: Date.now,
            },
            previousDetails: [
                {
                    unitPrice: mongoose.Schema.Types.Decimal128,
                    quantity: Number,
                    total: mongoose.Schema.Types.Decimal128,
                    modifiedBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                    modifiedDate: {
                        type: Date,
                        default: Date.now,
                    },
                    comment: {
                        type: String,
                    },
                },
            ],
        },
        status: {
            type: String,
            enum: [
                "ORDER PLACED",
                "PENDING",
                "ACCEPTED",
                "COMPLETED",
                "MODIFIED",
                "REJECTED",
                "CANCELLED",
            ],
            default: "ORDER PLACED",
        },
        lastModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

const SupplierOrders = mongoose.model("SupplierOrders", supplierOrdersSchema);

module.exports = { SupplierOrders };
