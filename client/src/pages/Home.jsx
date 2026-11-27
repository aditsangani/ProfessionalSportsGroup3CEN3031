import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import FormField from "../components/FormField";
import FormMessage from "../components/FormMessage";
import PageHeader from "../components/PageHeader";

function Home({ onOpen, activeLeagueId, onSelectLeague }) {
  const { user } = useAuth();
  const [leagues, setLeagues] = useState([]);
  const [draftStates, setDraftStates] = useState({});
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [standings, setStandings] = useState([]);
  const [matchups, setMatchups] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewRefresh, setPreviewRefresh] = useState(0);

  async function getDraftStatus(id) {
    try {
      await api("/api/draft/" + id);
      return "started";
    } catch (err) {
      return err.status === 404 ? "waiting" : "error";
    }
  }

  async function loadLeagues() {
    setLoading(true);
    setMessage("");

    try {
      const data = await api("/api/leagues");
      if (!Array.isArray(data)) {
        throw new Error("Could not load leagues.");
      }
      const statuses = {};
      await Promise.all(data.map(async function (league) {
        statuses[league._id] = await getDraftStatus(league._id);
      }));
      setLeagues(data);
      setDraftStates(statuses);
      setPreviewRefresh(function (oldValue) { return oldValue + 1; });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    loadLeagues();
  }, []);

  useEffect(function () {
    if (leagues.length && !leagues.some(function (league) { return league._id === activeLeagueId; })) {
      onSelectLeague(leagues[0]._id);
    }
  }, [leagues, activeLeagueId, onSelectLeague]);

  const activeLeague = leagues.find(function (league) {
    return league._id === activeLeagueId;
  }) || leagues[0] || null;
  const activeId = activeLeague ? activeLeague._id : "";
  const activeStatus = activeId ? draftStates[activeId] : "";

  useEffect(function () {
    let cancelled = false;
    setStandings([]);
    setMatchups([]);
    setPreviewError("");

    if (!activeId || activeStatus !== "started") {
      setPreviewLoading(false);
      return;
    }

    async function loadPreview() {
      setPreviewLoading(true);
      try {
        const results = await Promise.all([
          api("/api/standings/" + activeId + "?week=1"),
          api("/api/matchups/" + activeId + "?week=1"),
        ]);
        if (!cancelled) {
          setStandings(Array.isArray(results[0].standings) ? results[0].standings : []);
          setMatchups(Array.isArray(results[1].matchups) ? results[1].matchups : []);
        }
      } catch (err) {
        if (!cancelled) {
          setPreviewError(err.message);
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    }

    loadPreview();
    return function () { cancelled = true; };
  }, [activeId, activeStatus, previewRefresh]);

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
      setLeagues(function (old) { return old.concat([league]); });
      setDraftStates(function (old) { return { ...old, [league._id]: "waiting" }; });
      onSelectLeague(league._id);
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
        body: { inviteCode: inviteCode.trim().toUpperCase() },
      });
      const status = await getDraftStatus(league._id);
      setLeagues(function (old) { return old.concat([league]); });
      setDraftStates(function (old) { return { ...old, [league._id]: status }; });
      onSelectLeague(league._id);
      setInviteCode("");
      setMessage("Joined league successfully.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStart(league) {
    if (saving || league.members.length < 2) {
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const data = await api("/api/leagues/" + league._id + "/settings");
      await api("/api/draft/" + league._id + "/start", {
        method: "POST",
        body: { rounds: Number(data.settings.rounds) },
      });
      setDraftStates(function (old) { return { ...old, [league._id]: "started" }; });
      onOpen("draft", league._id);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  function statusText(status) {
    if (status === "started") return "Draft started";
    if (status === "waiting") return "Waiting for draft";
    if (status === "error") return "Draft status unavailable";
    return "Checking status";
  }

  function openLeaguePage(page, id) {
    onSelectLeague(id);
    onOpen(page, id);
  }

  return (
    <div className="dashboard-page">
      <PageHeader title="League overview" subtitle="Create or join a league, manage your team, and follow your weekly matchups." eyebrow="FRONT OFFICE / LEAGUE MANAGEMENT" />
      <FormMessage text={message} />

      <div className="dashboard-layout">
        <div className="dashboard-main">
          {loading ? (
            <section className="dashboard-feature"><p className="section-label">ACTIVE LEAGUE</p><p className="empty-message">Loading your leagues...</p></section>
          ) : activeLeague ? (
            <section className="dashboard-feature">
              <p className="section-label">ACTIVE LEAGUE</p>
              <div className="feature-inner">
                <h2>{activeLeague.name}</h2>
                <dl className="league-details">
                  <div><dt>Your role</dt><dd>{String(activeLeague.commissioner) === String(user.id) ? "Commissioner" : "Member"}</dd></div>
                  <div><dt>Members</dt><dd>{activeLeague.members.length}</dd></div>
                  <div><dt>Status</dt><dd>{statusText(activeStatus)}</dd></div>
                  <div><dt>Invite code</dt><dd className="invite-code">{activeLeague.inviteCode}</dd></div>
                </dl>
                <div className="feature-actions">
                  <Button onClick={() => openLeaguePage("draft", activeId)}>{activeStatus === "started" ? "Open draft room" : "View draft room"}</Button>
                  <Button variant="secondary" onClick={() => openLeaguePage("standings", activeId)}>Standings</Button>
                  {String(activeLeague.commissioner) === String(user.id) && activeStatus === "waiting" && (
                    <Button disabled={saving || activeLeague.members.length < 2} onClick={() => handleStart(activeLeague)}>Start draft</Button>
                  )}
                </div>
                {activeStatus === "waiting" && activeLeague.members.length < 2 && <p className="feature-note">At least two members are needed to start the draft.</p>}
              </div>
            </section>
          ) : (
            <section className="dashboard-feature">
              <p className="section-label">ACTIVE LEAGUE</p>
              <div className="feature-inner"><h2>No leagues yet</h2><p>Create a league or join one with an invite code to get started.</p></div>
            </section>
          )}

          <section className="dashboard-form-section">
            <h2>Create a new league</h2>
            <p>Set up a league, invite your friends, and start a draft.</p>
            <form className="dashboard-inline-form" onSubmit={handleCreate}>
              <FormField label="League name" name="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter a league name" />
              <Button type="submit" disabled={saving}>Create league</Button>
            </form>
          </section>

          <section className="dashboard-form-section">
            <h2>Join an existing league</h2>
            <p>Enter the invite code that your commissioner shared.</p>
            <form className="dashboard-inline-form" onSubmit={handleJoin}>
              <FormField label="Invite code" name="inviteCode" value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="Enter invite code" />
              <Button type="submit" disabled={saving}>Join league</Button>
            </form>
          </section>

          <section className="all-leagues-section">
            <div className="section-heading-row">
              <h2>Your leagues</h2>
              <Button variant="secondary" onClick={loadLeagues} disabled={loading}>Refresh leagues</Button>
            </div>
            {!loading && leagues.length === 0 && <p className="empty-message">You are not in any leagues yet.</p>}
            {leagues.map(function (league) {
              const selected = league._id === activeId;
              return (
                <div className={selected ? "league-list-row is-selected" : "league-list-row"} key={league._id}>
                  <div>
                    <h3>{league.name}</h3>
                    <p>{league.members.length} members / {statusText(draftStates[league._id])}</p>
                  </div>
                  <div className="league-list-actions">
                    <Button variant="secondary" onClick={() => onSelectLeague(league._id)} disabled={selected}>{selected ? "Selected" : "Select"}</Button>
                    <Button onClick={() => openLeaguePage("settings", league._id)}>Manage</Button>
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        <aside className="dashboard-rail">
          <section className="rail-section">
            <div className="rail-heading"><h2>League standings</h2><span>Week 1</span></div>
            {!activeLeague ? <p className="empty-message">Select a league to view standings.</p> : activeStatus !== "started" ? <p className="empty-message">Standings will appear once the draft starts.</p> : previewLoading ? <p className="empty-message">Loading standings...</p> : previewError ? <p className="empty-message">{previewError}</p> : standings.length === 0 ? <p className="empty-message">No standings available yet.</p> : (
              <div className="table-scroll">
                <table className="data-table"><thead><tr><th>Rank</th><th>Team</th><th>W-L</th><th>Points</th></tr></thead><tbody>
                  {standings.slice(0, 6).map(function (row, index) {
                    return <tr key={row.team || index}><td>{index + 1}</td><td>{row.username || "Team " + String(row.team).slice(-4)}</td><td>{row.wins || 0}-{row.losses || 0}</td><td>{Number(row.points || 0).toFixed(1)}</td></tr>;
                  })}
                </tbody></table>
              </div>
            )}
            {activeLeague && <button type="button" className="text-link" onClick={() => openLeaguePage("standings", activeId)}>View full standings</button>}
          </section>

          <section className="rail-section">
            <div className="rail-heading"><h2>Weekly matchups</h2><span>Week 1</span></div>
            {!activeLeague ? <p className="empty-message">Select a league to view matchups.</p> : activeStatus !== "started" ? <p className="empty-message">Matchups will appear once the draft starts.</p> : previewLoading ? <p className="empty-message">Loading matchups...</p> : previewError ? <p className="empty-message">Matchups could not be loaded.</p> : matchups.length === 0 ? <p className="empty-message">No matchups available yet.</p> : (
              <div className="matchup-preview-list">
                {matchups.slice(0, 3).map(function (matchup, index) {
                  return <div className="matchup-preview" key={index}><span>{matchup.home.username || "Home team"}</span><span className="matchup-versus">vs</span><span>{matchup.away.username || "Away team"}</span></div>;
                })}
              </div>
            )}
            {activeLeague && <button type="button" className="text-link" onClick={() => openLeaguePage("matchup", activeId)}>View matchups</button>}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default Home;
