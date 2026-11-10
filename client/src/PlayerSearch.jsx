import React, { useState } from "react";
import { api } from "./api";
import Card from "./components/Card";
import Button from "./components/Button";
import FormMessage from "./components/FormMessage";

function PlayerSearch({ onPick, canPick, takenPlayers }) {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState([]);
  const [message, setMessage] = useState("");

  async function handleSearch(event) {
    event.preventDefault();
    setMessage("");
    try {
      const data = await api("/api/players/search?q=" + encodeURIComponent(query));
      setPlayers(data.players);
      if (data.players.length === 0) {
        setMessage("No players found");
      }
    } catch (err) {
      setPlayers([]);
      setMessage(err.message);
    }
  }

  return (
    <Card title="Player search">
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={query}
          onChange={function (event) {
            setQuery(event.target.value);
          }}
          placeholder="Search a player"
          style={{ flex: 1, padding: 10, fontSize: 15 }}
        />
        <Button type="submit" disabled={query.trim().length < 2}>
          Search
        </Button>
      </form>

      <FormMessage text={message} />

      {players.map(function (player) {
        const taken = takenPlayers.includes(player.name);
        return (
          <div key={player.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ textDecoration: taken ? "line-through" : "none" }}>
              {player.name} ({player.position} {player.team})
            </span>
            <Button
              disabled={!canPick || taken}
              onClick={function () {
                onPick(player.name);
              }}
            >
              Draft
            </Button>
          </div>
        );
      })}
    </Card>
  );
}

export default PlayerSearch;
