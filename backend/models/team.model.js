const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // Leader là 1 user
    leader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Thành viên nhóm
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
