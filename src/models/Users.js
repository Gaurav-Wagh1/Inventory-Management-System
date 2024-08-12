const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            type: String,
            required: [true, "provide valid email address"],
            trim: true,
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            unique: true,
            index: true,
        },
        password_hash: {
            type: String,
            required: [true, "provide password"],
            alias: "password",
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
        details: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserDetail",
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
        },
        passwordExpiry: {
            type: Date,
        },
        loginAttempts: {
            type: Number,
        },
    },
    { timestamps: true }
);

usersSchema
    .virtual("fullName")
    .get(function () {
        return `${this.firstName} ${this.lastName}`;
    })
    .set(function (fullName) {
        const fullNameArr = fullName.split(" ");
        const fName = fullNameArr[0].trim(); // extract firstName
        const lName = fullNameArr[fullNameArr.length - 1]; // extract lastName
        this.set({ firstName: fName, lastName: lName });
    });

const User = mongoose.model("User", usersSchema);

module.exports = { User };
