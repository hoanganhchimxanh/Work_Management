const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    assignedToUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedToTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },

    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "WAITING"],
      default: "PENDING",
    },

    deadline: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
