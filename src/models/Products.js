const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        image: {
            type: String,
        },
        costPrice: {
            type: mongoose.Schema.Types.Decimal128,
        },
        sellingPrice: {
            type: mongoose.Schema.Types.Decimal128,
        },
        unitsLeft: {
            type: Number,
        },
        threshold: {
            type: Number,
        },
        isActive: {
            type: Boolean,
        },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = { Product };
