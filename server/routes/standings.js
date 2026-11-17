const express = require("express");
const mongoose = require("mongoose");
const { requireLogin } = require("../middleware/auth");
const { loadScores, readWeek } = require("../services/loadScores");
const { buildSeasonStandings } = require("../services/seasonStandings");

const MAX_WEEK = 20;

const router = express.Router();

router.get("/:leagueId", requireLogin, async function (req, res) {
  const week = readWeek(req.query);

  if (!mongoose.Types.ObjectId.isValid(req.params.leagueId)) {
    return res.status(404).json({ message: "league not found" });
  }
  if (week > MAX_WEEK) {
    return res.status(400).json({ message: "week must be " + MAX_WEEK + " or less" });
  }

  try {
    const weeklyTeams = [];
    let source = "";

    for (let current = 1; current <= week; current++) {
      const result = await loadScores(req.params.leagueId, req.userId, current);
      if (result.status !== 200) {
        return res.status(result.status).json({ message: result.message });
      }
      source = result.source;
      weeklyTeams.push(result.teams);
    }

    res.json({
      leagueId: req.params.leagueId,
      week: week,
      source: source,
      standings: buildSeasonStandings(weeklyTeams),
    });
  } catch (err) {
    res.status(502).json({ message: "could not get the player stats right now" });
  }
});

module.exports = router;
