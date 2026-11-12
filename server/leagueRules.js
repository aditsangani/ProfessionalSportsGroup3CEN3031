function isLeagueFull(league) {
  return league.members.length >= league.settings.maxTeams;
}

function isWholeNumber(value, min, max) {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max;
}

function checkSettings(body, memberCount) {
  const errors = [];

  if (!isWholeNumber(body.maxTeams, 2, 20)) {
    errors.push("max teams must be a whole number from 2 to 20");
  } else if (Number(body.maxTeams) < memberCount) {
    errors.push("max teams cannot be lower than the number of teams already in the league");
  }

  if (!isWholeNumber(body.rosterSize, 1, 20)) {
    errors.push("roster size must be a whole number from 1 to 20");
  }

  if (!isWholeNumber(body.rounds, 1, 20)) {
    errors.push("draft rounds must be a whole number from 1 to 20");
  }

  if (body.scoringType !== "points" && body.scoringType !== "categories") {
    errors.push("scoring must be points or categories");
  }

  return errors;
}

module.exports = { isLeagueFull, checkSettings };
