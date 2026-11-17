const { scoreMany } = require("./scoring");

function pairTeams(teamIds, week) {
  const teams = teamIds.slice();
  if (teams.length % 2 === 1) {
    teams.push(null);
  }
  if (teams.length < 2) {
    return [];
  }

  const rounds = teams.length - 1;
  const rotation = (week - 1) % rounds;

  const first = teams[0];
  const rest = teams.slice(1);
  for (let i = 0; i < rotation; i++) {
    rest.unshift(rest.pop());
  }
  const order = [first].concat(rest);

  const pairs = [];
  for (let i = 0; i < order.length / 2; i++) {
    const home = order[i];
    const away = order[order.length - 1 - i];
    if (home !== null && away !== null) {
      pairs.push([home, away]);
    }
  }
  return pairs;
}

function buildTeamScores(members, usernames, picks, pointsByPlayer) {
  return members.map(function (memberId) {
    const id = String(memberId);
    const players = picks
      .filter(function (pick) {
        return pick.team === id;
      })
      .map(function (pick) {
        return { name: pick.player, points: pointsByPlayer[pick.player] || 0 };
      });

    let score = 0;
    players.forEach(function (player) {
      score = score + player.points;
    });

    return {
      team: id,
      username: usernames[id] || "",
      score: Math.round(score * 100) / 100,
      players: players,
    };
  });
}

function rankTeams(teamScores) {
  return teamScores
    .map(function (team) {
      return { team: team.team, username: team.username, points: team.score };
    })
    .sort(function (a, b) {
      return b.points - a.points;
    });
}

function buildMatchups(teamScores, week) {
  const byId = {};
  teamScores.forEach(function (team) {
    byId[team.team] = team;
  });

  const ids = teamScores.map(function (team) {
    return team.team;
  });

  return pairTeams(ids, week).map(function (pair) {
    return { home: byId[pair[0]], away: byId[pair[1]] };
  });
}

function pointsForStats(stats) {
  return scoreMany(stats);
}

module.exports = { pairTeams, buildTeamScores, rankTeams, buildMatchups, pointsForStats };