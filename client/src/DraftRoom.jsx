import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { api } from "./api";
import useDraftSocket from "./useDraftSocket";
import Card from "./components/Card";
import PageHeader from "./components/PageHeader";
import FormMessage from "./components/FormMessage";
import PlayerSearch from "./PlayerSearch";

function whoIsOnTheClock(draft) {
  const teamCount = draft.teams.length;

  if (draft.pickNumber >= teamCount * draft.rounds) {
    return null;
  }

  const round = Math.floor(draft.pickNumber / teamCount);
  const spot = draft.pickNumber % teamCount;

  if (round % 2 === 0) {
    return draft.teams[spot];
  }

  return draft.teams[teamCount - 1 - spot];
}

function DraftRoom({ leagueId }) {
  const { token, user } = useAuth();
  const draft = useDraftSocket(leagueId, token);
  const [message, setMessage] = useState("");

  async function pickPlayer(playerName) {
    setMessage("");

    try {
      await api("/api/draft/" + leagueId + "/pick", {
        method: "POST",
        body: { playerId: playerName },
      });
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (!draft) {
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Waiting for the draft to start...
      </p>
    );
  }

  const onTheClock = whoIsOnTheClock(draft);
  const myTurn = onTheClock === user.id;

  const takenPlayers = draft.picks.map(function (pick) {
    return pick.player;
  });

  let subtitle = "Waiting for the next pick";

  if (myTurn) {
    subtitle = "You are on the clock";
  }

  if (!onTheClock) {
    subtitle = "The draft is over";
  }

  return (
    <div style={{
      maxWidth: 900,
      margin: "30px auto",
      padding: "0 16px",
    }}>
      <PageHeader
        title="Draft Room"
        subtitle={subtitle}
      />

      <FormMessage text={message} />

      <div style={{
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <Card title="Pick order">
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {draft.teams.map(function (team) {
                return (
                  <li
                    key={team}
                    style={{
                      fontWeight:
                        team === onTheClock ? "bold" : "normal",
                    }}
                  >
                    {team === user.id
                      ? "You"
                      : "Team " + team.slice(-4)}
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card title="Picks so far">
            {draft.picks.length === 0 && (
              <p>No picks yet</p>
            )}

            {draft.picks.map(function (pick) {
              return (
                <div key={pick.number}>
                  #{pick.number}{" "}
                  {pick.team === user.id
                    ? "You"
                    : "Team " + pick.team.slice(-4)}
                  : {pick.player}
                </div>
              );
            })}
          </Card>
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <PlayerSearch
            canPick={myTurn}
            takenPlayers={takenPlayers}
            onPick={pickPlayer}
          />
        </div>
      </div>
    </div>
  );
}

export default DraftRoom;
