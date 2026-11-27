import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import Card from "../components/Card";
import FormMessage from "../components/FormMessage";
import PageHeader from "../components/PageHeader";

function Standings({ leagueId }) {
  const { user } = useAuth();
  const [standings, setStandings] = useState([]);
  const [week, setWeek] = useState(1);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(function () {
    let cancelled = false;

    async function loadStandings() {
      setLoading(true);
      setError("");
      setStandings([]);
      setSource("");

      if (!leagueId) {
        setError("Choose a league from Home first.");
        setLoading(false);
        return;
      }

      try {
        const data = await api("/api/standings/" + leagueId + "?week=" + week);

        if (!data || !Array.isArray(data.standings)) {
          throw new Error("Could not load standings.");
        }

        if (!cancelled) {
          setStandings(data.standings);
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

    loadStandings();

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
    <div style={{ maxWidth: 850, margin: "30px auto", padding: "0 16px" }}>
      <PageHeader title="Standings" subtitle="League records and total fantasy points" />

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <label htmlFor="standingsWeek">Through week</label>
        <select
          id="standingsWeek"
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
          Refresh standings
        </Button>
      </div>

      <FormMessage text={error} />

      {loading && <p>Loading standings...</p>}
      {!loading && !error && sourceText && <p style={{ marginBottom: 12 }}>{sourceText}</p>}

      {!loading && !error && standings.length === 0 && (
        <Card>No standings available yet.</Card>
      )}

      {!loading && !error && standings.length > 0 && (
        <Card>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: 8 }}>Rank</th>
                  <th style={{ padding: 8 }}>Team</th>
                  <th style={{ padding: 8 }}>Wins</th>
                  <th style={{ padding: 8 }}>Losses</th>
                  <th style={{ padding: 8 }}>Ties</th>
                  <th style={{ padding: 8 }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {standings.map(function (row, index) {
                  const teamName = row.username || "Team " + String(row.team).slice(-4);
                  const isMyTeam = user && String(row.team) === String(user.id);
                  const points = Number(row.points || 0).toFixed(2);

                  return (
                    <tr key={row.team || index} style={{ borderTop: "1px solid #ddd" }}>
                      <td style={{ padding: 8 }}>{index + 1}</td>
                      <td style={{ padding: 8, fontWeight: isMyTeam ? 700 : 400 }}>
                        {teamName}{isMyTeam ? " (You)" : ""}
                      </td>
                      <td style={{ padding: 8 }}>{row.wins || 0}</td>
                      <td style={{ padding: 8 }}>{row.losses || 0}</td>
                      <td style={{ padding: 8 }}>{row.ties || 0}</td>
                      <td style={{ padding: 8 }}>{points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Standings;
