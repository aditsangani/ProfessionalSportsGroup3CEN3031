const mongoose = require("mongoose");

const leagueSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  inviteCode: { type: String, required: true, unique: true },
  commissioner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  settings: {
    maxTeams: { type: Number, default: 10 },
    rosterSize: { type: Number, default: 10 },
    rounds: { type: Number, default: 10 },
    scoringType: { type: String, default: "points" },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("League", leagueSchema);
