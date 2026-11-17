const test = require("node:test");
const assert = require("node:assert");
const { pairTeams, buildTeamScores, rankTeams, buildMatchups } = require("./leagueScores");
const { sampleStats } = require("./stats");

test("four teams make two matchups", function () {
  assert.strictEqual(pairTeams(["a", "b", "c", "d"], 1).length, 2);
});

test("nobody plays themselves and nobody plays twice in a week", function () {
  const pairs = pairTeams(["a", "b", "c", "d"], 2);
  const seen = [];
  pairs.forEach(function (pair) {
    assert.notStrictEqual(pair[0], pair[1]);
    seen.push(pair[0], pair[1]);
  });
  assert.strictEqual(new Set(seen).size, 4);
});

test("every team meets every other team over the weeks", function () {
  const meetings = new Set();
  for (let week = 1; week <= 3; week++) {
    pairTeams(["a", "b", "c", "d"], week).forEach(function (pair) {
      meetings.add(pair.slice().sort().join("-"));
    });
  }
  assert.strictEqual(meetings.size, 6);
});

test("odd number of teams gives one team a bye", function () {
  assert.strictEqual(pairTeams(["a", "b", "c"], 1).length, 1);
});

test("one team has no matchups", function () {
  assert.strictEqual(pairTeams(["a"], 1).length, 0);
});

test("team scores add up each player's points", function () {
  const picks = [
    { team: "a", player: "P1", number: 1 },
    { team: "a", player: "P2", number: 3 },
    { team: "b", player: "P3", number: 2 },
  ];
  const scores = buildTeamScores(["a", "b"], { a: "adit", b: "rohan" }, picks, { P1: 10, P2: 5.5, P3: 7 });
  assert.strictEqual(scores[0].score, 15.5);
  assert.strictEqual(scores[0].username, "adit");
  assert.strictEqual(scores[1].players.length, 1);
});

test("a team with no picks scores 0", function () {
  const scores = buildTeamScores(["a"], {}, [], {});
  assert.strictEqual(scores[0].score, 0);
});

test("standings are sorted by points, highest first", function () {
  const ranked = rankTeams([
    { team: "a", username: "x", score: 5, players: [] },
    { team: "b", username: "y", score: 9, players: [] },
  ]);
  assert.strictEqual(ranked[0].team, "b");
  assert.strictEqual(ranked[0].points, 9);
});

test("matchups have a home and an away team", function () {
  const teams = [
    { team: "a", username: "x", score: 1, players: [] },
    { team: "b", username: "y", score: 2, players: [] },
  ];
  const matchups = buildMatchups(teams, 1);
  assert.strictEqual(matchups.length, 1);
  assert.strictEqual(matchups[0].home.team, "a");
  assert.strictEqual(matchups[0].away.team, "b");
});

test("sample stats are the same every time for the same player and week", function () {
  assert.deepStrictEqual(sampleStats("Stephen Curry", 1), sampleStats("Stephen Curry", 1));
  assert.strictEqual(sampleStats("Stephen Curry", 1).length, 3);
});

test("sample stats differ between players", function () {
  assert.notDeepStrictEqual(sampleStats("Stephen Curry", 1), sampleStats("LeBron James", 1));
});