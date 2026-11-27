import React, { useEffect, useState } from "react";
import { api } from "../api";
import Button from "../components/Button";
import Card from "../components/Card";
import FormMessage from "../components/FormMessage";
import PageHeader from "../components/PageHeader";

function TeamCard({ team, winner }) {
  const name = team.username || "Team " + String(team.team).slice(-4);
  const players = Array.isArray(team.players) ? team.players : [];
  const score = Number(team.score || 0).toFixed(2);
  const isWinner = String(winner) === String(team.team);

  return (
    <div style={{ flex: 1, minWidth: 250 }}>
      <Card title={name}>
        <h2 style={{ marginTop: 0 }}>{score} points</h2>
        {isWinner && <p style={{ fontWeight: 700, marginBottom: 12 }}>Winner</p>}
        {players.length === 0 && <p>No players drafted yet.</p>}
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
  const [week, setWeek] = useState(1);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(function () {
    let cancelled = false;

    async function loadMatchups() {
      setLoading(true);
      setError("");
      setMatchups([]);
      setSource("");

      if (!leagueId) {
        setError("Choose a league from Home first.");
        setLoading(false);
        return;
      }

      try {
        const data = await api("/api/matchups/" + leagueId + "?week=" + week);

        if (!data || !Array.isArray(data.matchups)) {
          throw new Error("Could not load matchups.");
        }

        if (!cancelled) {
          setMatchups(data.matchups);
          setSource(data.source || "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMatchups();

    return function () {
      cancelled = true;
    };
  }, [leagueId, week, refresh]);

  function handleRefresh() {
    setRefresh(function (current) {
      return current + 1;
    });
  }

  const weeks = [];
  for (let number = 1; number <= 20; number++) {
    weeks.push(number);
  }

  let sourceText = "";
  if (source === "sample") {
    sourceText = "Scores are based on sample stats for testing.";
  }
  if (source === "balldontlie") {
    sourceText = "Scores are based on NBA API stats.";
  }

  return (
    <div style={{ maxWidth: 900, margin: "30px auto", padding: "0 16px" }}>
      <PageHeader title={"Week " + week + " matchups"} subtitle="Fantasy points for each team" />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <label htmlFor="matchupWeek">Select week</label>
        <select
          id="matchupWeek"
          value={week}
          disabled={loading}
          onChange={function (event) {
            setWeek(Number(event.target.value));
          }}
          style={{ padding: 8, borderRadius: 6 }}
        >
          {weeks.map(function (number) {
            return <option key={number} value={number}>Week {number}</option>;
          })}
        </select>
        <Button onClick={handleRefresh} disabled={loading || !leagueId}>
          Refresh matchups
        </Button>
      </div>

      <FormMessage text={error} />

      {loading && <p>Loading matchups...</p>}
      {!loading && !error && sourceText && <p style={{ marginBottom: 12 }}>{sourceText}</p>}

      {!loading && !error && matchups.length === 0 && (
        <Card>No matchups available yet.</Card>
      )}

      {!loading && !error && matchups.map(function (matchup, index) {
        return (
          <div key={index} style={{ marginBottom: 24 }}>
            <h3>Matchup {index + 1}</h3>
            {matchup.winner === "tie" && <p style={{ marginBottom: 12 }}>This matchup is tied.</p>}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <TeamCard team={matchup.home} winner={matchup.winner} />
              <TeamCard team={matchup.away} winner={matchup.winner} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Matchup;
