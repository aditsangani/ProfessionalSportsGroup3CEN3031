import React from "react";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";

const teamOne = { name: "Team 1A2B", score: 142.6, players: ["Player A", "Player B", "Player C"] };
const teamTwo = { name: "Team 3C4D", score: 131.9, players: ["Player D", "Player E", "Player F"] };

function TeamCard({ team }) {
  return (
    <div style={{ flex: 1 }}>
      <Card title={team.name}>
        <h2 style={{ marginTop: 0 }}>{team.score}</h2>
        {team.players.map(function (player) {
          return <div key={player}>{player}</div>;
        })}
      </Card>
    </div>
  );
}

function Matchup() {
  return (
    <div style={{ maxWidth: 800, margin: "30px auto", padding: "0 16px" }}>
      <PageHeader title="Week 1 matchup" subtitle="Sample data for now" />
      <div style={{ display: "flex", gap: 16 }}>
        <TeamCard team={teamOne} />
        <TeamCard team={teamTwo} />
      </div>
    </div>
  );
}

export default Matchup;
