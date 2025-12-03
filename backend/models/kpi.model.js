const mongoose = require("mongoose");

const kpiSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },

    revenueTarget: { type: Number, default: 0 },
    revenueProgress: { type: Number, default: 0 },

    bktTarget: { type: Number, default: 0 },
    bktProgress: { type: Number, default: 0 },

    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KPI", kpiSchema);
