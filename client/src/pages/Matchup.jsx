import React, { useEffect, useState } from "react";
import { api } from "../api";
import Button from "../components/Button";
import Card from "../components/Card";
import FormMessage from "../components/FormMessage";
import PageHeader from "../components/PageHeader";

function TeamCard({ team }) {
  const name = team.username || "Team " + String(team.team).slice(-4);
  const players = Array.isArray(team.players) ? team.players : [];
  const score = Number(team.score || 0).toFixed(2);

  return (
    <div style={{ flex: 1, minWidth: 250 }}>
      <Card title={name}>
        <h2>{score} points</h2>

        {players.length === 0 && <p>No player scores yet.</p>}

        {players.map(function (player, index) {
          return (
            <div key={index} style={{ marginBottom: 8 }}>
              {player.name}: {Number(player.points || 0).toFixed(2)} points
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function Matchup({ leagueId }) {
  const [matchups, setMatchups] = useState([]);
  const [week, setWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(function () {
    let cancelled = false;

    async function loadMatchups() {
      setLoading(true);
      setError("");

      if (!leagueId) {
        setMatchups([]);
        setWeek(null);
        setError("Choose a league from Home first.");
        setLoading(false);
        return;
      }

      try {
        const data = await api("/api/matchups/" + leagueId);

        if (!Array.isArray(data.matchups)) {
          throw new Error("Could not load matchups.");
        }

        if (!cancelled) {
          setMatchups(data.matchups);
          setWeek(data.week === undefined ? null : data.week);
        }
      } catch (err) {
        if (!cancelled) {
          setMatchups([]);
          setWeek(null);
          setError(err.message);
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadMatchups();

    return function () {
      cancelled = true;
    };
  }, [leagueId, refresh]);

  function handleRefresh() {
    setRefresh(refresh + 1);
  }

  let title = "Matchups";
  if (week !== null) {
    title = "Week " + week + " matchups";
  }

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: "0 16px" }}>
      <PageHeader title={title} subtitle="Fantasy scores for each matchup" />

      <div style={{ marginBottom: 16 }}>
        <Button onClick={handleRefresh} disabled={loading || !leagueId}>
          Refresh matchups
        </Button>
      </div>

      <FormMessage text={error} />

      {loading && <p>Loading matchups...</p>}

      {!loading && !error && matchups.length === 0 && (
        <Card>No matchups available yet.</Card>
      )}

      {!loading && !error && matchups.map(function (matchup, index) {
        return (
          <div key={index} style={{ marginBottom: 20 }}>
            <h3>Matchup {index + 1}</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <TeamCard team={matchup.home} />
              <TeamCard team={matchup.away} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Matchup;
