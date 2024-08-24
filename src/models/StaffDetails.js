const mongoose = require("mongoose");

const staffDetailSchema = new mongoose.Schema(
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
        salary: {
            type: mongoose.Schema.Types.Decimal128,
        },
    },
    { timestamps: true }
);

staffDetailSchema
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

const StaffDetail = mongoose.model("StaffDetail", staffDetailSchema);

module.exports = { StaffDetail };
