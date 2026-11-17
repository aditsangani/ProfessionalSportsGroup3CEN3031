const { buildMatchups } = require("./leagueScores");

function decideWinner(home, away) {
  if (home.score > away.score) {
    return home.team;
  }
  if (away.score > home.score) {
    return away.team;
  }
  return "tie";
}

function addWinners(matchups) {
  return matchups.map(function (matchup) {
    return {
      home: matchup.home,
      away: matchup.away,
      winner: decideWinner(matchup.home, matchup.away),
    };
  });
}

function newRecord(team) {
  return {
    team: team.team,
    username: team.username,
    wins: 0,
    losses: 0,
    ties: 0,
    points: 0,
  };
}

function buildSeasonStandings(weeklyTeams) {
  const records = {};

  weeklyTeams.forEach(function (teams, index) {
    const week = index + 1;

    teams.forEach(function (team) {
      if (!records[team.team]) {
        records[team.team] = newRecord(team);
      }
      records[team.team].points = records[team.team].points + team.score;
    });

    addWinners(buildMatchups(teams, week)).forEach(function (matchup) {
      const home = records[matchup.home.team];
      const away = records[matchup.away.team];

      if (matchup.winner === "tie") {
        home.ties = home.ties + 1;
        away.ties = away.ties + 1;
      } else if (matchup.winner === home.team) {
        home.wins = home.wins + 1;
        away.losses = away.losses + 1;
      } else {
        away.wins = away.wins + 1;
        home.losses = home.losses + 1;
      }
    });
  });

  return Object.keys(records)
    .map(function (id) {
      const record = records[id];
      record.points = Math.round(record.points * 100) / 100;
      return record;
    })
    .sort(function (a, b) {
      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }
      return b.points - a.points;
    });
}

module.exports = { decideWinner, addWinners, buildSeasonStandings };
