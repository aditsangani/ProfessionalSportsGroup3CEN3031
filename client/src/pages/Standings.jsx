import React from "react";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";

const standings = [
  { team: "Team 1A2B", wins: 5, losses: 1, points: 812.4 },
  { team: "Team 3C4D", wins: 4, losses: 2, points: 790.1 },
  { team: "Team 5E6F", wins: 2, losses: 4, points: 701.9 },
  { team: "Team 7G8H", wins: 1, losses: 5, points: 655.3 },
];

function Standings() {
  return (
    <div style={{ maxWidth: 600, margin: "30px auto", padding: "0 16px" }}>
      <PageHeader title="Standings" subtitle="Sample data for now" />
      <Card>
        <table style={{ width: "100%", textAlign: "left" }}>
          <thead>
            <tr>
              <th>Team</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {standings.map(function (row) {
              return (
                <tr key={row.team}>
                  <td>{row.team}</td>
                  <td>{row.wins}</td>
                  <td>{row.losses}</td>
                  <td>{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export default Standings;
