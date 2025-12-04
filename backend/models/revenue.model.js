const mongoose = require("mongoose");

const revenueSchema = new mongoose.Schema({}, { timestamps: true });

module.exports = mongoose.model("Revenue", revenueSchema);
