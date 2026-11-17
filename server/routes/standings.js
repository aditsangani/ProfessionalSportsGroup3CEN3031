const express = require("express");
const { requireLogin } = require("../middleware/auth");
const { loadScores, readWeek } = require("../services/loadScores");
const { rankTeams } = require("../services/leagueScores");

const router = express.Router();

router.get("/:leagueId", requireLogin, async function (req, res) {
  const week = readWeek(req.query);

  try {
    const result = await loadScores(req.params.leagueId, req.userId, week);
    if (result.status !== 200) {
      return res.status(result.status).json({ message: result.message });
    }

    res.json({
      leagueId: req.params.leagueId,
      week: week,
      source: result.source,
      standings: rankTeams(result.teams),
    });
  } catch (err) {
    res.status(502).json({ message: "could not get the player stats right now" });
  }
});

module.exports = router;