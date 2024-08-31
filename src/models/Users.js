const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const util = require("util");

const {
    ACCESS_TOKEN_SECRET_STRING,
    REFRESH_TOKEN_SECRET_STRING,
    SESSION_TOKEN_SECRET_STRING
} = require("../config/server-config.js");
const { ApiError } = require("../utils/error/api-error.js");

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
        },
        role: {
            type: String,
            enum: ["customer", "staff", "admin"],
            default: "customer",
            required: true,
        },
        passwordExpiry: {
            type: Date,
        },
        loginAttempts: {
            type: Number,
        },
        refreshToken: {
            type: String,
        },
    },
    { timestamps: true }
);

usersSchema
    .virtual("safeUser") // only return required fields;
    .get(function () {
        return {
            email: this.email,
            role: this.role,
        };
    });

usersSchema.methods.generateAccessToken = async function () {
    const signAsync = util.promisify(jwt.sign);
    try {
        const accessToken = await signAsync(
            {
                userId: this._id,
                email: this.email,
                role: this.role,
            },
            ACCESS_TOKEN_SECRET_STRING,
            {
                expiresIn: "15m",
            }
        );
        return accessToken;
    } catch (error) {
        console.log("Error generating access token");
        throw new ApiError(
            "Server Error",
            "Internal Server Error, try again later"
        );
    }
};

usersSchema.methods.generateRefreshToken = async function () {
    const signAsync = util.promisify(jwt.sign);
    try {
        const refreshToken = await signAsync(
            {
                userId: this._id,
            },
            REFRESH_TOKEN_SECRET_STRING,
            {
                expiresIn: "15d",
            }
        );
        return refreshToken;
    } catch (error) {
        console.log("Error generating refresh token");
        throw new ApiError(
            "Server Error",
            "Internal Server Error, try again later"
        );
    }
};

usersSchema.methods.generateSession2FAToken = async function () {
    const signAsync = util.promisify(jwt.sign);
    try {
        const session2FAToken = await signAsync(
            {
                userId: this._id,
            },
            SESSION_TOKEN_SECRET_STRING,
            {
                expiresIn: "5m",
            }
        );
        return session2FAToken;
    } catch (error) {
        console.log("Error generating session token");
        throw new ApiError(
            "Server Error",
            "Internal Server Error, try again later"
        );
    }
}

usersSchema.methods.comparePassword = async function (passwordToCompare) {
    try {
        return await bcrypt.compare(passwordToCompare, this.password_hash);
    } catch (error) {
        throw error;
    }
};

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
