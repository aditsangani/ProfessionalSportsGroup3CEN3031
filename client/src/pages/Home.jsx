import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/Card";
import Button from "../components/Button";
import FormField from "../components/FormField";
import FormMessage from "../components/FormMessage";
import PageHeader from "../components/PageHeader";

function Home({ onOpen }) {
  const { user } = useAuth();

  const [leagues, setLeagues] = useState([]);
  const [draftStates, setDraftStates] = useState({});
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function getDraftStatus(leagueId) {
    try {
      await api("/api/draft/" + leagueId);
      return "started";
    } catch (err) {
      if (err.status === 404) {
        return "waiting";
      }

      return "error";
    }
  }

  async function loadLeagues() {
    setLoading(true);
    setMessage("");

    try {
      const data = await api("/api/leagues");

      const statuses = {};

      await Promise.all(
        data.map(async function (league) {
          statuses[league._id] = await getDraftStatus(league._id);
        })
      );

      setLeagues(data);
      setDraftStates(statuses);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    loadLeagues();
  }, []);

  async function handleCreate(event) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Please enter a league name.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const league = await api("/api/leagues", {
        method: "POST",
        body: { name: name.trim() },
      });

      setLeagues(function (oldLeagues) {
        return oldLeagues.concat([league]);
      });

      setDraftStates(function (oldStates) {
        return {
          ...oldStates,
          [league._id]: "waiting",
        };
      });

      setName("");
      setMessage("League created successfully.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleJoin(event) {
    event.preventDefault();

    if (!inviteCode.trim()) {
      setMessage("Please enter an invite code.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const league = await api("/api/leagues/join", {
        method: "POST",
        body: {
          inviteCode: inviteCode.trim().toUpperCase(),
        },
      });

      const status = await getDraftStatus(league._id);

      setLeagues(function (oldLeagues) {
        return oldLeagues.concat([league]);
      });

      setDraftStates(function (oldStates) {
        return {
          ...oldStates,
          [league._id]: status,
        };
      });

      setInviteCode("");
      setMessage("Joined league successfully.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStart(league) {
    setMessage("");

    if (league.members.length < 2) {
      setMessage("At least two members are needed to start the draft.");
      return;
    }

    setSaving(true);

    try {
      const result = await api(
        "/api/leagues/" + league._id + "/settings"
      );

      const rounds = Number(result.settings.rounds);

      await api("/api/draft/" + league._id + "/start", {
        method: "POST",
        body: { rounds: rounds },
      });

      setDraftStates(function (oldStates) {
        return {
          ...oldStates,
          [league._id]: "started",
        };
      });

      onOpen("draft", league._id);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "20px auto",
        padding: "0 16px",
      }}
    >
      <PageHeader
        title="My Leagues"
        subtitle="Create a league, join friends, and draft NBA players"
      />

      <FormMessage text={message} />

      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 250 }}>
          <Card title="Create a league">
            <form onSubmit={handleCreate}>
              <FormField
                label="League name"
                name="name"
                value={name}
                onChange={function (event) {
                  setName(event.target.value);
                }}
              />

              <Button type="submit" disabled={saving}>
                Create league
              </Button>
            </form>
          </Card>
        </div>

        <div style={{ flex: 1, minWidth: 250 }}>
          <Card title="Join a league">
            <form onSubmit={handleJoin}>
              <FormField
                label="Invite code"
                name="inviteCode"
                value={inviteCode}
                onChange={function (event) {
                  setInviteCode(event.target.value);
                }}
              />

              <Button type="submit" disabled={saving}>
                Join league
              </Button>
            </form>
          </Card>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <h2>Your leagues</h2>

        <Button onClick={loadLeagues} disabled={loading}>
          Refresh leagues
        </Button>
      </div>

      {loading && <p>Loading leagues...</p>}

      {!loading && leagues.length === 0 && (
        <p>You are not in any leagues yet.</p>
      )}

      {!loading && leagues.map(function (league) {
        const commissioner =
          String(league.commissioner) === String(user.id);

        const status = draftStates[league._id];

        let statusText = "Checking draft status...";

        if (status === "started") {
          statusText = "Draft started";
        }

        if (status === "waiting") {
          statusText = "Waiting for draft to start";
        }

        if (status === "error") {
          statusText = "Could not check draft status";
        }

        return (
          <Card key={league._id} title={league.name}>
            <p style={{ marginBottom: 8 }}>
              Invite code: <strong>{league.inviteCode}</strong>
            </p>

            <p style={{ marginBottom: 8 }}>
              Members: {league.members.length}
            </p>

            <p style={{ marginBottom: 8 }}>
              Status: {statusText}
            </p>

            {commissioner && (
              <p style={{ marginBottom: 8 }}>
                You are the commissioner.
              </p>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 16,
              }}
            >
              {commissioner && status === "waiting" && (
                <Button
                  disabled={saving || league.members.length < 2}
                  onClick={function () {
                    handleStart(league);
                  }}
                >
                  Start draft
                </Button>
              )}

              <Button
                onClick={function () {
                  onOpen("draft", league._id);
                }}
              >
                {status === "started" ? "Open draft" : "Draft room"}
              </Button>

              <Button
                onClick={function () {
                  onOpen("roster", league._id);
                }}
              >
                My roster
              </Button>

              <Button
                onClick={function () {
                  onOpen("standings", league._id);
                }}
              >
                Standings
              </Button>

              <Button
                onClick={function () {
                  onOpen("matchup", league._id);
                }}
              >
                Matchups
              </Button>

              <Button
                onClick={function () {
                  onOpen("settings", league._id);
                }}
              >
                Settings
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default Home;
