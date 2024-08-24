const mongoose = require("mongoose");

const supplierProductSchema = new mongoose.Schema(
    {
        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            index: true,
        },
        unitPrice: {
            type: mongoose.Schema.Types.Decimal128,
        },
    },
    { timestamps: true }
);

const SupplierProduct = mongoose.model(
    "SupplierProduct",
    supplierProductSchema
);

module.exports = { SupplierProduct };
