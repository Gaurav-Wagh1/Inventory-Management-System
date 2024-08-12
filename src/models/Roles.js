const mongoose = require("mongoose");

const rolesSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Role = mongoose.model("Role", rolesSchema);

module.exports = { Role };
