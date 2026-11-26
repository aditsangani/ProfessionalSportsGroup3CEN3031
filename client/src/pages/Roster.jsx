import React from "react";
import { useAuth } from "../context/AuthContext";
import useDraftSocket from "../useDraftSocket";
import Card from "../components/Card";
import Button from "../components/Button";
import PageHeader from "../components/PageHeader";
import FormMessage from "../components/FormMessage";

function Roster({ leagueId }) {
  const { user, token } = useAuth();

  const {
    draft,
    loading,
    error,
    notStarted,
    refreshDraft,
  } = useDraftSocket(leagueId, token);

  let picks = [];

  if (draft && Array.isArray(draft.picks)) {
    picks = draft.picks;
  }

  const myPicks = picks.filter(function (pick) {
    return String(pick.team) === String(user.id);
  });

  return (
    <div
      style={{
        maxWidth: 650,
        margin: "30px auto",
        padding: "0 16px",
      }}
    >
      <PageHeader
        title="My Roster"
        subtitle="Players you have drafted"
      />

      <div style={{ marginBottom: 16 }}>
        <Button onClick={refreshDraft}>Refresh roster</Button>
      </div>

      <FormMessage text={error} />

      {loading && <p>Loading roster...</p>}

      {!loading && notStarted && (
        <p>The draft has not started yet.</p>
      )}

      {!loading && draft && (
        <Card title="Your players">
          {myPicks.length === 0 && (
            <p>You have not drafted any players yet.</p>
          )}

          {myPicks.map(function (pick, index) {
            return (
              <div
                key={pick.number}
                style={{
                  padding: "10px 0",
                  borderBottom: "1px solid #ddd",
                }}
              >
                {index + 1}. {pick.player}
                <span style={{ color: "#666" }}>
                  {" "} (Pick #{pick.number})
                </span>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

export default Roster;
