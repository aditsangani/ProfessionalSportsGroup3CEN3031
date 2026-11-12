const express = require("express");
const League = require("../models/League");
const { requireLogin } = require("../middleware/auth");
const { isLeagueFull, checkSettings } = require("../leagueRules");

const router = express.Router();

const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// makes a random 6 character code like "K7PQ3X"
function makeCode() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code = code + LETTERS[Math.floor(Math.random() * LETTERS.length)];
  }
  return code;
}

// keeps trying until we get a code nobody else has
async function makeUniqueCode() {
  let code = makeCode();
  while (await League.findOne({ inviteCode: code })) {
    code = makeCode();
  }
  return code;
}

// GET /api/leagues
router.get("/", requireLogin, async function (req, res) {
  const leagues = await League.find({ members: req.userId });
  res.json(leagues);
});

// POST /api/leagues
router.post("/", requireLogin, async function (req, res) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "give your league a name" });
  }

  const league = await League.create({
    name: name,
    inviteCode: await makeUniqueCode(),
    commissioner: req.userId,
    members: [req.userId],
  });

  res.status(201).json(league);
});

// POST /api/leagues/join
router.post("/join", requireLogin, async function (req, res) {
  const code = (req.body.inviteCode || "").toUpperCase().trim();

  const league = await League.findOne({ inviteCode: code });
  if (!league) {
    return res.status(404).json({ message: "no league has that invite code" });
  }

  if (isLeagueFull(league)) {
    return res.status(400).json({ message: "this league is full" });
  }

  const alreadyIn = league.members.some(function (id) {
    return String(id) === String(req.userId);
  });
  if (alreadyIn) {
    return res.status(400).json({ message: "you are already in this league" });
  }

  league.members.push(req.userId);
  await league.save();

  res.json(league);
});

// GET /api/leagues/:id/settings
router.get("/:id/settings", requireLogin, async function (req, res) {
  const league = await League.findById(req.params.id);
  if (!league) {
    return res.status(404).json({ message: "league not found" });
  }

  res.json({
    settings: league.settings,
    isCommissioner: String(league.commissioner) === String(req.userId),
  });
});

// PUT /api/leagues/:id/settings
router.put("/:id/settings", requireLogin, async function (req, res) {
  const league = await League.findById(req.params.id);
  if (!league) {
    return res.status(404).json({ message: "league not found" });
  }
  if (String(league.commissioner) !== String(req.userId)) {
    return res.status(403).json({ message: "only the commissioner can change the settings" });
  }

  const errors = checkSettings(req.body, league.members.length);
  if (errors.length > 0) {
    return res.status(400).json({ message: errors.join(", ") });
  }

  league.settings.maxTeams = Number(req.body.maxTeams);
  league.settings.rosterSize = Number(req.body.rosterSize);
  league.settings.rounds = Number(req.body.rounds);
  league.settings.scoringType = req.body.scoringType;
  await league.save();

  res.json({ settings: league.settings });
});

module.exports = router;
