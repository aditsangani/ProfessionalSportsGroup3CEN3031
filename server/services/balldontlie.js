const base = "https://api.balldontlie.io/v1";

async function callApi(path) {
  const response = await fetch(base + path, {
    headers: { Authorization: process.env.BALLDONTLIE_API_KEY || "" },
  });
  if (!response.ok) {
    throw new Error("balldontlie error " + response.status);
  }
  return response.json();
}

async function searchPlayers(name) {
  return callApi("/players?per_page=10&search=" + encodeURIComponent(name));
}

async function getPlayer(id) {
  return callApi("/players/" + encodeURIComponent(id));
}

async function getGameStats(playerId, startDate, endDate) {
  return callApi(
    "/stats?per_page=100&player_ids[]=" + playerId +
    "&start_date=" + startDate + "&end_date=" + endDate
  );
}

module.exports = { searchPlayers, getPlayer, getGameStats };