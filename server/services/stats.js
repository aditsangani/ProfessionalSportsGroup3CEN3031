const balldontlie = require("./balldontlie");

function hashName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 2147483647;
  }
  return hash;
}

function pickNumber(seed, min, max) {
  const next = (seed * 48271) % 2147483647;
  return { seed: next, value: min + (next % (max - min + 1)) };
}

function sampleStats(playerName, week) {
  const games = [];
  let seed = hashName(playerName + "-week-" + week) + 1;

  for (let i = 0; i < 3; i++) {
    const pts = pickNumber(seed, 8, 32);
    const reb = pickNumber(pts.seed, 2, 12);
    const ast = pickNumber(reb.seed, 1, 10);
    const stl = pickNumber(ast.seed, 0, 3);
    const blk = pickNumber(stl.seed, 0, 3);
    const turnover = pickNumber(blk.seed, 0, 5);
    seed = turnover.seed;

    games.push({
      pts: pts.value,
      reb: reb.value,
      ast: ast.value,
      stl: stl.value,
      blk: blk.value,
      turnover: turnover.value,
    });
  }

  return games;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

async function realStats(playerName, week) {
  const found = await balldontlie.searchPlayers(playerName);
  if (found.data.length === 0) {
    return [];
  }

  const end = new Date();
  end.setDate(end.getDate() - (week - 1) * 7);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);

  const result = await balldontlie.getGameStats(found.data[0].id, formatDate(start), formatDate(end));
  return result.data;
}

function getStatsSource() {
  return process.env.STATS_SOURCE === "balldontlie" ? "balldontlie" : "sample";
}

async function getPlayerStats(playerName, week) {
  if (getStatsSource() === "balldontlie") {
    return realStats(playerName, week);
  }
  return sampleStats(playerName, week);
}

module.exports = { sampleStats, getPlayerStats, getStatsSource };