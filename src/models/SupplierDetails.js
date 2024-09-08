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
        },
        contactPerson: {
            type: String,
        },
        phoneNumber: {
            type: String,
        },
        address: {
            address: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: String },
            country: { type: String },
        },
        status: {
            type: String,
            enum: ["active", "inactive", "pending"],
            default: "pending",
        },
    },
    { timestamps: true }
);

supplierDetailsSchema.virtual("safeDetails").get(function () {
    return {
        id: this.id,
        name: this.name,
        contactPerson: this.contactPerson,
        phoneNumber: this.phoneNumber,
        address: this.address,
        status: this.status,
    };
});

const SupplierDetail = mongoose.model("SupplierDetail", supplierDetailsSchema);

module.exports = { SupplierDetail };
