import { useEffect, useState } from "react";
import { API_URL } from "./context/AuthContext";
import { api } from "./api";

function useDraftSocket(leagueId, token) {
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notStarted, setNotStarted] = useState(false);
  const [refreshNumber, setRefreshNumber] = useState(0);

  useEffect(function () {
    let active = true;
    let socket = null;
    let reconnectTimer = null;
    let receivedLiveUpdate = false;

    setDraft(null);
    setLoading(true);
    setError("");
    setNotStarted(false);

    if (!leagueId || !token) {
      setError("Please choose a league and log in.");
      setLoading(false);
      return;
    }

    async function loadDraft() {
      try {
        const data = await api("/api/draft/" + leagueId);

        if (active && !receivedLiveUpdate) {
          setDraft(data);
          setNotStarted(false);
          setError("");
        }
      } catch (err) {
        if (!active || receivedLiveUpdate) {
          return;
        }

        if (err.status === 404) {
          setDraft(null);
          setNotStarted(true);
          setError("");
        } else {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    function connectSocket() {
      if (!active) {
        return;
      }

      const websocketURL = API_URL
        .replace("https://", "wss://")
        .replace("http://", "ws://");

      const address =
        websocketURL + "/draft?leagueId=" + encodeURIComponent(leagueId);

      try {
        socket = new WebSocket(address);
      } catch (err) {
        reconnectTimer = setTimeout(connectSocket, 3000);
        return;
      }

      socket.onmessage = function (event) {
        try {
          const data = JSON.parse(event.data);

          if (
            active &&
            data &&
            Array.isArray(data.teams) &&
            Array.isArray(data.picks)
          ) {
            receivedLiveUpdate = true;
            setDraft(data);
            setNotStarted(false);
            setError("");
            setLoading(false);
          }
        } catch (err) {
          
        }
      };

      socket.onclose = function () {
        if (active) {
          reconnectTimer = setTimeout(connectSocket, 3000);
        }
      };
    }

    loadDraft();
    connectSocket();

    return function () {
      active = false;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [leagueId, token, refreshNumber]);

  function refreshDraft() {
    setRefreshNumber(function (oldNumber) {
      return oldNumber + 1;
    });
  }

  return {
    draft,
    loading,
    error,
    notStarted,
    refreshDraft,
    setDraft,
  };
}

export default useDraftSocket;
