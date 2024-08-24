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
        unitPrice: {
            type: Number,
        },
        unitsLeft: {
            type: mongoose.Schema.Types.Decimal128,
        },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = { Product };
