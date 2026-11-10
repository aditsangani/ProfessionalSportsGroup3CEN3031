import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import FormMessage from "../components/FormMessage";

function Roster({ leagueId }) {
  const { user } = useAuth();
  const [picks, setPicks] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(
    function () {
      api("/api/draft/" + leagueId)
        .then(function (draft) {
          setPicks(draft.picks);
        })
        .catch(function (err) {
          setMessage(err.message);
        });
    },
    [leagueId]
  );

  const myPicks = picks.filter(function (pick) {
    return pick.team === user.id;
  });

  return (
    <div style={{ maxWidth: 600, margin: "30px auto", padding: "0 16px" }}>
      <PageHeader title="My roster" />
      <FormMessage text={message} />
      <Card>
        {myPicks.length === 0 && <div>No players drafted yet</div>}
        {myPicks.map(function (pick) {
          return (
            <div key={pick.number}>
              Pick #{pick.number}: {pick.player}
            </div>
          );
        })}
      </Card>
    </div>
  );
}

export default Roster;
