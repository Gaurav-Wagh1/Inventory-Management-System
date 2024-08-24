const mongoose = require("mongoose");

const customerDetailsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        firstName: {
            type: String,
            required: [true, "provide firstName"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "provide lastName"],
            trim: true,
        },
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

customerDetailsSchema
    .virtual("fullName")
    .get(function () {
        return `${this.firstName} ${this.lastName}`;
    })
    .set(function (fullName) {
        const fullNameArr = fullName.split(" ");
        const fName = fullNameArr[0].trim(); // extract firstName
        const lName = fullNameArr[fullNameArr.length - 1].trim(); // extract lastName
        this.set({ firstName: fName, lastName: lName });
    });

const CustomerDetail = mongoose.model("CustomerDetail", customerDetailsSchema);

module.exports = { CustomerDetail };
