const test = require("node:test");
const assert = require("node:assert");
const { isLeagueFull, checkSettings } = require("./leagueRules");

const goodSettings = { maxTeams: 8, rosterSize: 10, rounds: 5, scoringType: "points" };

test("league is full when members reach maxTeams", function () {
  const league = { settings: { maxTeams: 2 }, members: ["a", "b"] };
  assert.strictEqual(isLeagueFull(league), true);
});

test("league is not full under the limit", function () {
  const league = { settings: { maxTeams: 3 }, members: ["a"] };
  assert.strictEqual(isLeagueFull(league), false);
});

test("good settings have no errors", function () {
  assert.strictEqual(checkSettings(goodSettings, 3).length, 0);
});

test("maxTeams below 2 is an error", function () {
  const body = { ...goodSettings, maxTeams: 1 };
  assert.strictEqual(checkSettings(body, 1).length, 1);
});

test("maxTeams cannot be lower than the current members", function () {
  const body = { ...goodSettings, maxTeams: 3 };
  assert.strictEqual(checkSettings(body, 5).length, 1);
});

test("bad scoring type is an error", function () {
  const body = { ...goodSettings, scoringType: "banana" };
  assert.strictEqual(checkSettings(body, 1).length, 1);
});
