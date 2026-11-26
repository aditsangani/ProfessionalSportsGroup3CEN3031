import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";

import LoginForm from "./LoginForm.jsx";
import SignupForm from "./SignupForm.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

import Home from "./pages/Home.jsx";
import DraftRoom from "./DraftRoom.jsx";
import Roster from "./pages/Roster.jsx";
import LeagueSettings from "./pages/LeagueSettings.jsx";
import Standings from "./pages/Standings.jsx";
import Matchup from "./pages/Matchup.jsx";

import Button from "./components/Button.jsx";

function App() {
  const { user, logout } = useAuth();

  let firstPage = "login";

  if (window.location.pathname === "/reset-password") {
    firstPage = "reset";
  }

  const [page, setPage] = useState(firstPage);
  const [loggedInPage, setLoggedInPage] = useState("home");
  const [leagueId, setLeagueId] = useState("");

  const resetToken = new URLSearchParams(
    window.location.search
  ).get("token");

  function openPage(pageName, selectedLeagueId) {
    if (pageName === "home") {
      setLeagueId("");
      setLoggedInPage("home");
      return;
    }

    if (selectedLeagueId) {
      setLeagueId(selectedLeagueId);
    }

    setLoggedInPage(pageName);
  }

  function openLoginPage(pageName) {
    window.history.replaceState({}, "", "/");
    setPage(pageName);
  }

  function handleLogout() {
    logout();
    setLeagueId("");
    setLoggedInPage("home");
    openLoginPage("login");
  }

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2 style={{ textAlign: "center" }}>
          Dynasty Drafters
        </h2>

        {page !== "reset" && (
          <div
            style={{
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            <button onClick={function () {
              openLoginPage("login");
            }}>
              Log in
            </button>

            <span style={{ margin: 12 }}>|</span>

            <button onClick={function () {
              openLoginPage("signup");
            }}>
              Sign up
            </button>
          </div>
        )}

        {page === "login" && (
          <LoginForm onNavigate={openLoginPage} />
        )}

        {page === "signup" && <SignupForm />}

        {page === "forgot" && (
          <ForgotPassword onNavigate={openLoginPage} />
        )}

        {page === "reset" && (
          <ResetPassword
            token={resetToken}
            onNavigate={openLoginPage}
          />
        )}
      </div>
    );
  }

  let content = null;

  if (loggedInPage === "home") {
    content = <Home onOpen={openPage} />;
  }

  if (loggedInPage === "draft") {
    content = <DraftRoom leagueId={leagueId} />;
  }

  if (loggedInPage === "roster") {
    content = <Roster leagueId={leagueId} />;
  }

  if (loggedInPage === "settings") {
    content = <LeagueSettings leagueId={leagueId} />;
  }

  if (loggedInPage === "standings") {
    content = <Standings leagueId={leagueId} />;
  }

  if (loggedInPage === "matchup") {
    content = <Matchup leagueId={leagueId} />;
  }

  return (
    <div style={{ padding: 20 }}>
      <header
        style={{
          borderBottom: "1px solid #ddd",
          paddingBottom: 16,
          marginBottom: 24,
        }}
      >
        <h2>Dynasty Drafters</h2>

        <p style={{ marginBottom: 12 }}>
          Welcome, {user.username}
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <Button onClick={function () {
            openPage("home");
          }}>
            Home
          </Button>

          {leagueId && (
            <>
              <Button onClick={function () {
                openPage("draft");
              }}>
                Draft
              </Button>

              <Button onClick={function () {
                openPage("roster");
              }}>
                Roster
              </Button>

              <Button onClick={function () {
                openPage("standings");
              }}>
                Standings
              </Button>

              <Button onClick={function () {
                openPage("matchup");
              }}>
                Matchups
              </Button>

              <Button onClick={function () {
                openPage("settings");
              }}>
                Settings
              </Button>
            </>
          )}

          <Button onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>

      <main>{content}</main>
    </div>
  );
}

export default App;
