import React, { useState } from "react";
import { api } from "./api";
import Card from "./components/Card";
import Button from "./components/Button";
import FormMessage from "./components/FormMessage";

function PlayerSearch({ onPick, canPick, takenPlayers }) {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState([]);
  const [message, setMessage] = useState("");
  const [searching, setSearching] = useState(false);
  const [picking, setPicking] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();

    if (query.trim().length < 2) {
      setMessage("Enter at least two letters.");
      return;
    }

    setSearching(true);
    setMessage("");
    setPlayers([]);

    try {
      const data = await api(
        "/api/players/search?q=" +
          encodeURIComponent(query.trim())
      );

      if (!data || !Array.isArray(data.players)) {
        throw new Error("Invalid player search response.");
      }

      setPlayers(data.players);

      if (data.players.length === 0) {
        setMessage("No players found.");
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSearching(false);
    }
  }

  async function handlePick(player) {
    if (!canPick || picking) {
      return;
    }

    setPicking(true);
    setMessage("");

    try {
      const success = await onPick(player.name);

      if (success) {
        setMessage("Successfully drafted " + player.name + ".");
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setPicking(false);
    }
  }

  return (
    <Card title="Player search">
      <form
        onSubmit={handleSearch}
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <input
          value={query}
          onChange={function (event) {
            setQuery(event.target.value);
          }}
          placeholder="Search for an NBA player"
          aria-label="Search for an NBA player"
          style={{
            flex: 1,
            minWidth: 0,
            padding: 10,
            fontSize: 15,
          }}
        />

        <Button
          type="submit"
          disabled={searching || query.trim().length < 2}
        >
          {searching ? "Searching..." : "Search"}
        </Button>
      </form>

      <FormMessage text={message} />

      {!canPick && (
        <p style={{ marginBottom: 12 }}>
          You can search for players, but you can only draft
          when it is your turn.
        </p>
      )}

      {players.map(function (player) {
        const taken = takenPlayers.includes(player.name);

        return (
          <div
            key={player.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                textDecoration: taken ? "line-through" : "none",
              }}
            >
              {player.name}
              {player.position && " (" + player.position + ")"}
              {player.team && " - " + player.team}
            </span>

            <Button
              disabled={!canPick || taken || picking}
              onClick={function () {
                handlePick(player);
              }}
            >
              {taken ? "Taken" : "Draft"}
            </Button>
          </div>
        );
      })}
    </Card>
  );
}

export default PlayerSearch;
