const mongoose = require("mongoose");

const supplierOrdersSchema = new mongoose.Schema(
    {
        supplierProduct: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SupplierProduct",
            index: true,
        },
        unitPrice: {
            type: mongoose.Schema.Types.Decimal128,
        },
        quantity: {
            type: Number,
        },
        amount: {
            type: Number,
        },
    },
    { timestamps: true }
);

const SupplierOrders = mongoose.model("SupplierOrders", supplierOrdersSchema);

module.exports = { SupplierOrders };
