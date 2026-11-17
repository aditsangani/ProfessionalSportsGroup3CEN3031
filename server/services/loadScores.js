const League = require("../models/League");
const Draft = require("../models/Draft");
const User = require("../models/User");
const { getPlayerStats, getStatsSource } = require("./stats");
const { pointsForStats, buildTeamScores } = require("./leagueScores");

async function loadScores(leagueId, userId, week) {
  const league = await League.findById(leagueId);
  if (!league) {
    return { status: 404, message: "league not found" };
  }

  const isMember = league.members.some(function (id) {
    return String(id) === String(userId);
  });
  if (!isMember) {
    return { status: 403, message: "you are not in this league" };
  }

  const users = await User.find({ _id: { $in: league.members } });
  const usernames = {};
  users.forEach(function (user) {
    usernames[String(user._id)] = user.username;
  });

  const draft = await Draft.findOne({ leagueId: league._id });
  const picks = draft ? draft.picks : [];

  const pointsByPlayer = {};
  for (let i = 0; i < picks.length; i++) {
    const name = picks[i].player;
    if (pointsByPlayer[name] === undefined) {
      const stats = await getPlayerStats(name, week);
      pointsByPlayer[name] = pointsForStats(stats);
    }
  }

  const picksList = picks.map(function (pick) {
    return { team: pick.team, player: pick.player, number: pick.number };
  });

  return {
    status: 200,
    source: getStatsSource(),
    teams: buildTeamScores(league.members, usernames, picksList, pointsByPlayer),
  };
}

function readWeek(query) {
  const week = parseInt(query.week, 10);
  if (isNaN(week) || week < 1) {
    return 1;
  }
  return week;
}

module.exports = { loadScores, readWeek };