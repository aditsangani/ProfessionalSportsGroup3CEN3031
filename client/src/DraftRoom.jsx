import React, { useState } from "react";
import { useAuth, API_URL } from "./context/AuthContext";
import useDraftSocket from "./useDraftSocket";
import Card from "./components/Card";
import Button from "./components/Button";
import PageHeader from "./components/PageHeader";
import FormMessage from "./components/FormMessage";

// who is on the clock, same snake rules as the server
function whoIsOnTheClock(draft) {
  const teamCount = draft.teams.length;
  if (draft.pickNumber >= teamCount * draft.rounds) {
    return null;
  }
  const round = Math.floor(draft.pickNumber / teamCount);
  const spot = draft.pickNumber % teamCount;
  return round % 2 === 0 ? draft.teams[spot] : draft.teams[teamCount - 1 - spot];
}

// placeholder player list until the player search story is done
const queue = ["Player C", "Player D", "Player E", "Player F"];

function DraftRoom({ leagueId }) {
  const { token, user } = useAuth();
  const draft = useDraftSocket(leagueId, token);
  const [message, setMessage] = useState("");

  async function pickPlayer(playerId) {
    setMessage("");
    const response = await fetch(API_URL + "/api/draft/" + leagueId + "/pick", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ playerId: playerId }),
    });
    if (!response.ok) {
      const data = await response.json();
      setMessage(data.message);
    }
    // on success the socket sends the new draft to everyone, so nothing else to do here
  }

  if (!draft) {
    return <p style={{ textAlign: "center", marginTop: 40 }}>Waiting for the draft to start...</p>;
  }

  const onTheClock = whoIsOnTheClock(draft);
  const myTurn = onTheClock === user.id;
  const takenPlayers = draft.picks.map(function (pick) {
    return pick.player;
  });

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: "0 16px" }}>
      <PageHeader
        title="Draft Room"
        subtitle={onTheClock ? (myTurn ? "You are on the clock" : "Waiting for the next pick") : "The draft is over"}
      />
      <FormMessage text={message} />

      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <Card title="Pick order">
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {draft.teams.map(function (team) {
                return (
                  <li key={team} style={{ fontWeight: team === onTheClock ? "bold" : "normal" }}>
                    {team === user.id ? "You" : "Team " + team.slice(-4)}
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card title="Picks so far">
            {draft.picks.length === 0 && <div>No picks yet</div>}
            {draft.picks.map(function (pick) {
              return (
                <div key={pick.number}>
                  #{pick.number} {pick.team === user.id ? "You" : "Team " + pick.team.slice(-4)}: {pick.player}
                </div>
              );
            })}
          </Card>
        </div>

        <div style={{ flex: 1 }}>
          <Card title="Your queue">
            {queue.map(function (player) {
              const taken = takenPlayers.includes(player);
              return (
                <div key={player} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ textDecoration: taken ? "line-through" : "none" }}>{player}</span>
                  <Button
                    disabled={!myTurn || taken}
                    onClick={function () {
                      pickPlayer(player);
                    }}
                  >
                    Draft
                  </Button>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DraftRoom;
