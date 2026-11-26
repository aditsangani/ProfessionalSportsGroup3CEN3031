import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { api } from "./api";
import useDraftSocket from "./useDraftSocket";
import Card from "./components/Card";
import Button from "./components/Button";
import PageHeader from "./components/PageHeader";
import FormMessage from "./components/FormMessage";
import PlayerSearch from "./PlayerSearch";

function whoIsOnTheClock(draft) {
  if (!draft || !draft.teams || draft.teams.length === 0) {
    return null;
  }

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

  const {
    draft,
    loading,
    error,
    notStarted,
    refreshDraft,
    setDraft,
  } = useDraftSocket(leagueId, token);

  const [message, setMessage] = useState("");
  const [picking, setPicking] = useState(false);

  async function pickPlayer(playerName) {
    if (picking || !draft) {
      return false;
    }

    setPicking(true);
    setMessage("");

    try {
      const updatedDraft = await api(
        "/api/draft/" + leagueId + "/pick",
        {
          method: "POST",
          body: { playerId: playerName },
        }
      );

      setDraft(updatedDraft);
      setMessage(playerName + " was drafted successfully.");
      return true;
    } catch (err) {
      setMessage(err.message);
      return false;
    } finally {
      setPicking(false);
    }
  }

  if (loading && !draft) {
    return (
      <p style={{ textAlign: "center", marginTop: 40 }}>
        Loading draft...
      </p>
    );
  }

  if (!draft) {
    let text = "Waiting for the commissioner to start the draft.";

    if (error) {
      text = error;
    }

    if (!notStarted && !error) {
      text = "Draft information is not available.";
    }

    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <PageHeader title="Draft Room" />
        <p style={{ marginBottom: 16 }}>{text}</p>
        <Button onClick={refreshDraft}>Refresh draft</Button>
      </div>
    );
  }

  const onTheClock = whoIsOnTheClock(draft);
  const myTurn = String(onTheClock) === String(user.id);

  const takenPlayers = draft.picks.map(function (pick) {
    return pick.player;
  });

  let subtitle = "Waiting for the next pick";

  if (myTurn) {
    subtitle = "You are on the clock!";
  }

  if (onTheClock === null) {
    subtitle = "The draft is complete!";
  }

  const totalPicks = draft.teams.length * draft.rounds;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "30px auto",
        padding: "0 16px",
      }}
    >
      <PageHeader title="Draft Room" subtitle={subtitle} />

      <FormMessage text={error} />
      <FormMessage text={message} />

      <p style={{ marginBottom: 16 }}>
        Pick {draft.pickNumber} of {totalPicks} completed
      </p>

      <div style={{ marginBottom: 16 }}>
        <Button onClick={refreshDraft}>Refresh draft</Button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <Card title="Draft order">
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {draft.teams.map(function (team) {
                const current = String(team) === String(onTheClock);

                return (
                  <li
                    key={team}
                    style={{
                      fontWeight: current ? "bold" : "normal",
                      marginBottom: 8,
                    }}
                  >
                    {String(team) === String(user.id)
                      ? "You"
                      : "Team " + String(team).slice(-4)}

                    {current && " (On the clock)"}
                  </li>
                );
              })}
            </ol>
          </Card>

          <Card title="Picks so far">
            {draft.picks.length === 0 && (
              <p>No players drafted yet.</p>
            )}

            {draft.picks.map(function (pick) {
              const name =
                String(pick.team) === String(user.id)
                  ? "You"
                  : "Team " + String(pick.team).slice(-4);

              return (
                <div
                  key={pick.number}
                  style={{ marginBottom: 10 }}
                >
                  #{pick.number} {name}: {pick.player}
                </div>
              );
            })}
          </Card>
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <PlayerSearch
            canPick={myTurn && !picking}
            takenPlayers={takenPlayers}
            onPick={pickPlayer}
          />
        </div>
      </div>
    </div>
  );
}

export default DraftRoom;
