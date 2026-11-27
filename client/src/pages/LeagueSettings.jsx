import React, { useEffect, useState } from "react";
import { api } from "../api";
import FormField from "../components/FormField";
import FormMessage from "../components/FormMessage";
import Button from "../components/Button";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";

function LeagueSettings({ leagueId }) {
  const [values, setValues] = useState(null);
  const [isCommissioner, setIsCommissioner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(function () {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setValues(null);
      setError("");
      setSaved("");

      if (!leagueId) {
        setError("Choose a league from Home first.");
        setLoading(false);
        return;
      }

      try {
        const data = await api("/api/leagues/" + leagueId + "/settings");

        if (!data || !data.settings) {
          throw new Error("Could not load league settings.");
        }

        if (!cancelled) {
          setValues(data.settings);
          setIsCommissioner(data.isCommissioner);
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

    loadSettings();

    return function () {
      cancelled = true;
    };
  }, [leagueId]);

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
    setSaved("");
    setError("");
  }

  function isWholeNumberInRange(value, min, max) {
    const number = Number(value);
    return value !== "" && Number.isInteger(number) && number >= min && number <= max;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaved("");

    if (!isCommissioner || saving) {
      return;
    }

    if (!isWholeNumberInRange(values.maxTeams, 2, 20)) {
      setError("Max teams must be a whole number from 2 to 20.");
      return;
    }
    if (!isWholeNumberInRange(values.rosterSize, 1, 20)) {
      setError("Roster size must be a whole number from 1 to 20.");
      return;
    }
    if (!isWholeNumberInRange(values.rounds, 1, 20)) {
      setError("Draft rounds must be a whole number from 1 to 20.");
      return;
    }

    setSaving(true);

    try {
      const data = await api("/api/leagues/" + leagueId + "/settings", {
        method: "PUT",
        body: {
          maxTeams: Number(values.maxTeams),
          rosterSize: Number(values.rosterSize),
          rounds: Number(values.rounds),
          scoringType: values.scoringType,
        },
      });

      setValues(data.settings);
      setSaved("Settings saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 450, margin: "30px auto", padding: "0 16px" }}>
      <PageHeader
        title="League settings"
        subtitle={isCommissioner ? "You are the commissioner" : "Only the commissioner can change these settings"}
      />

      <FormMessage text={error} />
      {loading && <p>Loading settings...</p>}

      {!loading && values && (
        <Card>
          <form onSubmit={handleSubmit}>
            <fieldset disabled={!isCommissioner || saving} style={{ border: "none", margin: 0, padding: 0 }}>
              <FormField
                label="Max teams (2-20)"
                name="maxTeams"
                type="number"
                value={values.maxTeams}
                onChange={handleChange}
              />
              <FormField
                label="Roster size (1-20)"
                name="rosterSize"
                type="number"
                value={values.rosterSize}
                onChange={handleChange}
              />
              <FormField
                label="Draft rounds (1-20)"
                name="rounds"
                type="number"
                value={values.rounds}
                onChange={handleChange}
              />
              <label htmlFor="scoringType" style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
                Scoring
              </label>
              <select
                id="scoringType"
                name="scoringType"
                value={values.scoringType}
                onChange={handleChange}
                style={{ padding: 10, marginBottom: 14 }}
              >
                <option value="points">Points</option>
                <option value="categories">Categories</option>
              </select>
              {isCommissioner && (
                <div>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save settings"}
                  </Button>
                </div>
              )}
            </fieldset>
          </form>
          {saved && <p style={{ marginTop: 12 }}>{saved}</p>}
        </Card>
      )}
    </div>
  );
}

export default LeagueSettings;
