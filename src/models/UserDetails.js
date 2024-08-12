const mongoose = require("mongoose");

const userDetailsSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            required: false,
            trim: true,
        },
        address: {
            type: String,
            required: false,
            trim: true,
        },
        city: {
            type: String,
            required: false,
            trim: true,
        },
        state: {
            type: String,
            required: false,
            trim: true,
        },
        country: {
            type: String,
            required: false,
            trim: true,
        },
        postalCode: {
            type: String,
            required: false,
            trim: true,
        },
    },
    { timestamps: true }
);

userDetailsSchema.set("toJSON", { virtuals: true });
userDetailsSchema.set("toObject", { virtuals: true });

userDetailsSchema.virtual("fullAddress").get(function () {
    return `${this.address}, ${this.city}, ${this.state}, ${this.country}, ${this.postalCode}`;
});

const UserDetail = mongoose.model("UserDetail", userDetailsSchema);

module.exports = { UserDetail };
