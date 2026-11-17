const express = require("express");
const mongoose = require("mongoose");
const { requireLogin } = require("../middleware/auth");
const { loadScores, readWeek } = require("../services/loadScores");
const { buildMatchups } = require("../services/leagueScores");
const { addWinners } = require("../services/seasonStandings");

const router = express.Router();

router.get("/:leagueId", requireLogin, async function (req, res) {
  const week = readWeek(req.query);

  if (!mongoose.Types.ObjectId.isValid(req.params.leagueId)) {
    return res.status(404).json({ message: "league not found" });
  }

  try {
    const result = await loadScores(req.params.leagueId, req.userId, week);
    if (result.status !== 200) {
      return res.status(result.status).json({ message: result.message });
    }

    res.json({
      leagueId: req.params.leagueId,
      week: week,
      source: result.source,
      matchups: addWinners(buildMatchups(result.teams, week)),
    });
  } catch (err) {
    res.status(502).json({ message: "could not get the player stats right now" });
  }
});

module.exports = router;
