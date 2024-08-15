const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const usersSchema = new mongoose.Schema(
    {
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
            select: false,
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

usersSchema
    .virtual("safeUser") // remove unwanted fields while returning the data
    .get(function () {
        const responseObject = this.toObject();
        delete responseObject.password_hash;
        delete responseObject._id;
        delete responseObject.createdAt;
        delete responseObject.updatedAt;
        delete responseObject.__v;
        responseObject["fullName"] = this.fullName;
        return responseObject;
    });

usersSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password_hash")) {
            this.password = await bcrypt.hash(this.password, 10);
        }
    } catch (error) {
        return next(error);
    }

    next();
});

const User = mongoose.model("User", usersSchema);

module.exports = { User };
