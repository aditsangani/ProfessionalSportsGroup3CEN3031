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
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(
    function () {
      api("/api/leagues/" + leagueId + "/settings")
        .then(function (data) {
          setValues(data.settings);
          setIsCommissioner(data.isCommissioner);
        })
        .catch(function (err) {
          setError(err.message);
        });
    },
    [leagueId]
  );

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaved("");
    try {
      const data = await api("/api/leagues/" + leagueId + "/settings", { method: "PUT", body: values });
      setValues(data.settings);
      setSaved("Settings saved");
    } catch (err) {
      setError(err.message);
    }
  }

  if (!values) {
    return <p style={{ textAlign: "center" }}>{error || "Loading..."}</p>;
  }

  return (
    <div style={{ maxWidth: 400, margin: "30px auto", padding: "0 16px" }}>
      <PageHeader title="League settings" subtitle={isCommissioner ? "You are the commissioner" : "Only the commissioner can change these"} />
      <Card>
        <form onSubmit={handleSubmit}>
          <FormMessage text={error} />
          <FormField label="Max teams" name="maxTeams" type="number" value={values.maxTeams} onChange={handleChange} />
          <FormField label="Roster size" name="rosterSize" type="number" value={values.rosterSize} onChange={handleChange} />
          <FormField label="Draft rounds" name="rounds" type="number" value={values.rounds} onChange={handleChange} />
          <label htmlFor="scoringType" style={{ display: "block", marginBottom: 4, fontWeight: 600 }}>
            Scoring
          </label>
          <select id="scoringType" name="scoringType" value={values.scoringType} onChange={handleChange} style={{ padding: 10, marginBottom: 14 }}>
            <option value="points">Points</option>
            <option value="categories">Categories</option>
          </select>
          <div>
            {isCommissioner && <Button type="submit">Save settings</Button>}
            {saved && <span> {saved}</span>}
          </div>
        </form>
      </Card>
    </div>
  );
}

export default LeagueSettings;
