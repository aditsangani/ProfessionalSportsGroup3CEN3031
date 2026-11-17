const test = require("node:test");
const assert = require("node:assert");
const { decideWinner, addWinners, buildSeasonStandings } = require("./seasonStandings");

function makeTeam(id, name, score) {
  return { team: id, username: name, score: score, players: [] };
}

test("higher score wins the matchup", function () {
  assert.strictEqual(decideWinner(makeTeam("a", "x", 10), makeTeam("b", "y", 5)), "a");
  assert.strictEqual(decideWinner(makeTeam("a", "x", 5), makeTeam("b", "y", 10)), "b");
});

test("same score is a tie", function () {
  assert.strictEqual(decideWinner(makeTeam("a", "x", 7), makeTeam("b", "y", 7)), "tie");
});

test("addWinners keeps home and away and adds a winner", function () {
  const matchups = [{ home: makeTeam("a", "x", 3), away: makeTeam("b", "y", 9) }];
  const result = addWinners(matchups);
  assert.strictEqual(result[0].home.team, "a");
  assert.strictEqual(result[0].away.team, "b");
  assert.strictEqual(result[0].winner, "b");
});

test("one week gives each team a win or a loss", function () {
  const standings = buildSeasonStandings([
    [makeTeam("a", "x", 40), makeTeam("b", "y", 55)],
  ]);
  assert.strictEqual(standings[0].team, "b");
  assert.strictEqual(standings[0].wins, 1);
  assert.strictEqual(standings[1].losses, 1);
});

test("points add up across weeks", function () {
  const standings = buildSeasonStandings([
    [makeTeam("a", "x", 10.5), makeTeam("b", "y", 20)],
    [makeTeam("a", "x", 30), makeTeam("b", "y", 5)],
  ]);
  const teamA = standings.find(function (row) {
    return row.team === "a";
  });
  assert.strictEqual(teamA.points, 40.5);
  assert.strictEqual(teamA.wins, 1);
  assert.strictEqual(teamA.losses, 1);
});

test("a tie adds a tie to both teams", function () {
  const standings = buildSeasonStandings([
    [makeTeam("a", "x", 10), makeTeam("b", "y", 10)],
  ]);
  assert.strictEqual(standings[0].ties, 1);
  assert.strictEqual(standings[1].ties, 1);
});

test("standings sort by wins first and points second", function () {
  const standings = buildSeasonStandings([
    [makeTeam("a", "x", 10), makeTeam("b", "y", 20), makeTeam("c", "z", 5), makeTeam("d", "w", 6)],
  ]);
  assert.strictEqual(standings.length, 4);
  assert.strictEqual(standings[0].wins >= standings[1].wins, true);
  assert.strictEqual(standings[0].team, "b");
});

test("a team with a bye gets points but no win or loss", function () {
  const standings = buildSeasonStandings([
    [makeTeam("a", "x", 10), makeTeam("b", "y", 20), makeTeam("c", "z", 15)],
  ]);
  const total = standings.reduce(function (sum, row) {
    return sum + row.wins + row.losses + row.ties;
  }, 0);
  assert.strictEqual(total, 2);
  assert.strictEqual(standings.length, 3);
});

test("no weeks gives empty standings", function () {
  assert.deepStrictEqual(buildSeasonStandings([]), []);
});
