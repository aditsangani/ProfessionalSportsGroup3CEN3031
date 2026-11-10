const test = require("node:test");
const assert = require("node:assert");
const { scoreGame, scoreMany } = require("./scoring");

test("an empty stat line is worth 0", function () {
  assert.strictEqual(scoreGame({}), 0);
});

test("a normal game is scored correctly", function () {
  const stat = { pts: 20, reb: 10, ast: 5, stl: 2, blk: 1, turnover: 3 };
  assert.strictEqual(scoreGame(stat), 45.5);
});

test("turnovers take points away", function () {
  assert.strictEqual(scoreGame({ turnover: 4 }), -4);
});

test("scoreMany adds up every game", function () {
  assert.strictEqual(scoreMany([{ pts: 10 }, { pts: 5, ast: 2 }]), 18);
});