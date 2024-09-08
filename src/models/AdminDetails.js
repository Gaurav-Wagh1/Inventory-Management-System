const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
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
        is2FAEnabled: {
            type: Boolean,
            default: false,
        },
        twoFASecret: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

adminSchema
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

adminSchema.virtual("safeDetails").get(function () {
    return {
        id: this.id,
        fullName: this.fullName,
    };
});

const AdminDetail = mongoose.model("AdminDetail", adminSchema);

module.exports = { AdminDetail };
