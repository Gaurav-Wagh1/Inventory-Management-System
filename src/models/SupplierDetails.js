const mongoose = require("mongoose");

const supplierDetailsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        name: {
            type: String,
            required: true,
        },
        contactPerson: {
            type: String,
        },
        phoneNumber: {
            type: String,
        },
        address: {
            type: String,
        },
    },
    { timestamps: true }
);

const SupplierDetail = mongoose.model("SupplierDetail", supplierDetailsSchema);

module.exports = { SupplierDetail };
