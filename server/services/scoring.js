function scoreGame(stat) {
  const points = stat.pts || 0;
  const rebounds = stat.reb || 0;
  const assists = stat.ast || 0;
  const steals = stat.stl || 0;
  const blocks = stat.blk || 0;
  const turnovers = stat.turnover || 0;

  const total = points + rebounds * 1.2 + assists * 1.5 + steals * 3 + blocks * 3 - turnovers;
  return Math.round(total * 100) / 100;
}

function scoreMany(stats) {
  let total = 0;
  for (let i = 0; i < stats.length; i++) {
    total = total + scoreGame(stats[i]);
  }
  return Math.round(total * 100) / 100;
}

module.exports = { scoreGame, scoreMany };