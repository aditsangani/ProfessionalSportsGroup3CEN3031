import React, { useEffect, useState } from "react";
import { api } from "../api";
import Button from "../components/Button";
import Card from "../components/Card";
import FormMessage from "../components/FormMessage";
import PageHeader from "../components/PageHeader";

function Standings({ leagueId }) {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(function () {
    let cancelled = false;

    async function loadStandings() {
      setLoading(true);
      setError("");

      if (!leagueId) {
        setStandings([]);
        setError("Choose a league from Home first.");
        setLoading(false);
        return;
      }

      try {
        const data = await api("/api/standings/" + leagueId);

        if (!Array.isArray(data.standings)) {
          throw new Error("Could not load standings.");
        }

        const sorted = data.standings.slice().sort(function (a, b) {
          return Number(b.points || 0) - Number(a.points || 0);
        });

        if (!cancelled) {
          setStandings(sorted);
        }
      } catch (err) {
        if (!cancelled) {
          setStandings([]);
          setError(err.message);
        }
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    loadStandings();

    return function () {
      cancelled = true;
    };
  }, [leagueId, refresh]);

  function handleRefresh() {
    setRefresh(refresh + 1);
  }

  return (
    <div style={{ maxWidth: 700, margin: "30px auto", padding: "0 16px" }}>
      <PageHeader title="Standings" subtitle="League rankings by fantasy points" />

      <div style={{ marginBottom: 16 }}>
        <Button onClick={handleRefresh} disabled={loading || !leagueId}>
          Refresh standings
        </Button>
      </div>

      <FormMessage text={error} />

      {loading && <p>Loading standings...</p>}

      {!loading && !error && standings.length === 0 && (
        <Card>No standings available yet.</Card>
      )}

      {!loading && !error && standings.length > 0 && (
        <Card>
          <table style={{ width: "100%", textAlign: "left" }}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {standings.map(function (row, index) {
                const teamName = row.username || "Team " + String(row.team).slice(-4);
                const points = Number(row.points || 0).toFixed(2);

                return (
                  <tr key={row.team || index}>
                    <td>{index + 1}</td>
                    <td>{teamName}</td>
                    <td>{points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

export default Standings;
