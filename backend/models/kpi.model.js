const mongoose = require("mongoose");

const kpiSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },

    revenueTarget: { type: Number, default: 0 },

    bktTarget: { type: Number, default: 0 },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KPI", kpiSchema);
