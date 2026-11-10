const express = require("express");
const { requireLogin } = require("../middleware/auth");

const router = express.Router();

router.get("/:leagueId", requireLogin, function (req, res) {
  res.json({ leagueId: req.params.leagueId, matchups: [] });
});

module.exports = router;