const express = require("express");
const { requireLogin } = require("../middleware/auth");
const balldontlie = require("../services/balldontlie");

const router = express.Router();

function simplify(player) {
  let team = "";
  if (player.team) {
    team = player.team.full_name;
  }
  return {
    id: player.id,
    name: player.first_name + " " + player.last_name,
    position: player.position,
    team: team,
  };
}

router.get("/search", requireLogin, async function (req, res) {
  const q = (req.query.q || "").trim();
  if (q.length < 2) {
    return res.status(400).json({ message: "type at least 2 letters" });
  }

  try {
    const result = await balldontlie.searchPlayers(q);
    res.json({ players: result.data.map(simplify) });
  } catch (err) {
    res.status(502).json({ message: "could not reach the player database" });
  }
});

router.get("/:id", requireLogin, async function (req, res) {
  try {
    const result = await balldontlie.getPlayer(req.params.id);
    res.json({ player: simplify(result.data) });
  } catch (err) {
    res.status(502).json({ message: "could not reach the player database" });
  }
});

module.exports = router;