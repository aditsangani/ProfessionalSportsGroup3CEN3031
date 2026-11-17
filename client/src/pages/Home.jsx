
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
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    async function loadLeagues() {
      try {
        const data = await api("/api/leagues");
        setLeagues(data);
      } catch (err) {
        setMessage(err.message);
      }

      setLoading(false);
    }

    loadLeagues();
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Please enter a league name");
      return;
    }

    try {
      const league = await api("/api/leagues", {
        method: "POST",
        body: { name: name.trim() },
      });

      setLeagues(function (oldLeagues) {
        return oldLeagues.concat([league]);
      });

      setName("");
      setMessage("League created successfully");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleJoin(event) {
    event.preventDefault();
    setMessage("");

    if (!inviteCode.trim()) {
      setMessage("Please enter an invite code");
      return;
    }

    try {
      const league = await api("/api/leagues/join", {
        method: "POST",
        body: { inviteCode: inviteCode.trim() },
      });

      setLeagues(function (oldLeagues) {
        return oldLeagues.concat([league]);
      });

      setInviteCode("");
      setMessage("Joined league successfully");
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleStart(league) {
    setMessage("");

    try {
      const result = await api(
        "/api/leagues/" + league._id + "/settings"
      );

      await api("/api/draft/" + league._id + "/start", {
        method: "POST",
        body: {
          rounds: Number(result.settings.rounds),
        },
      });

      onOpen("draft", league._id);
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div style={{
      maxWidth: 900,
      margin: "20px auto",
      padding: "0 16px",
    }}>
      <PageHeader
        title="My Leagues"
        subtitle="Create a league, join friends, and draft NBA players"
      />

      <FormMessage text={message} />

      <div style={{
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
      }}>
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

              <Button type="submit">
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

              <Button type="submit">
                Join league
              </Button>
            </form>
          </Card>
        </div>
      </div>

      <h2>Your leagues</h2>

      {loading && <p>Loading leagues...</p>}

      {!loading && leagues.length === 0 && (
        <p>You are not in any leagues yet.</p>
      )}

      {leagues.map(function (league) {
        const commissioner =
          String(league.commissioner) === String(user.id);

        return (
          <Card key={league._id} title={league.name}>
            <p>Invite code: {league.inviteCode}</p>

            <p>
              Members: {league.members.length}
            </p>

            {commissioner && (
              <p>You are the commissioner.</p>
            )}

            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 16,
            }}>
              {commissioner && (
                <Button onClick={function () {
                  handleStart(league);
                }}>
                  Start draft
                </Button>
              )}

              <Button onClick={function () {
                onOpen("draft", league._id);
              }}>
                Open draft
              </Button>

              <Button onClick={function () {
                onOpen("roster", league._id);
              }}>
                My roster
              </Button>

              <Button onClick={function () {
                onOpen("standings", league._id);
              }}>
                Standings
              </Button>

              <Button onClick={function () {
                onOpen("matchup", league._id);
              }}>
                Matchups
              </Button>

              <Button onClick={function () {
                onOpen("settings", league._id);
              }}>
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
