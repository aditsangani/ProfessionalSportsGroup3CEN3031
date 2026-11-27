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

const navigation = [
  { page: "home", label: "Overview" },
  { page: "draft", label: "Draft room" },
  { page: "roster", label: "My roster" },
  { page: "standings", label: "Standings" },
  { page: "matchup", label: "Matchups" },
  { page: "settings", label: "Settings" },
];

function App() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState(
    window.location.pathname === "/reset-password" ? "reset" : "login"
  );
  const [loggedInPage, setLoggedInPage] = useState("home");
  const [leagueId, setLeagueId] = useState("");

  const resetToken = new URLSearchParams(window.location.search).get("token");

  function openPage(nextPage, selectedLeagueId) {
    if (selectedLeagueId) {
      setLeagueId(selectedLeagueId);
    }
    setLoggedInPage(nextPage);
  }

  function openLoginPage(nextPage) {
    window.history.replaceState({}, "", "/");
    setPage(nextPage);
  }

  function handleLogout() {
    logout();
    setLeagueId("");
    setLoggedInPage("home");
    openLoginPage("login");
  }

  if (!user) {
    return (
      <div className="auth-shell">
        <aside className="auth-intro">
          <p className="brand-kicker">Fantasy basketball / Front office</p>
          <div className="auth-wordmark">DYNASTY<br />DRAFTERS</div>
          <div className="auth-intro-bottom">
            <p className="auth-intro-heading">Your league.<br />Your draft.<br />Your season.</p>
            <p>Build your team, follow every pick, and compete with your friends.</p>
          </div>
        </aside>
        <main className="auth-main">
          <div className="auth-topline">
            <span>Season HQ</span>
            {page !== "reset" && (
              <div className="auth-tabs" aria-label="Account pages">
                <button type="button" className={page === "login" ? "is-active" : ""} onClick={() => openLoginPage("login")}>Log in</button>
                <button type="button" className={page === "signup" ? "is-active" : ""} onClick={() => openLoginPage("signup")}>Sign up</button>
              </div>
            )}
          </div>
          <div className="auth-form-area">
            {page === "login" && <LoginForm onNavigate={openLoginPage} />}
            {page === "signup" && <SignupForm />}
            {page === "forgot" && <ForgotPassword onNavigate={openLoginPage} />}
            {page === "reset" && <ResetPassword token={resetToken} onNavigate={openLoginPage} />}
          </div>
          <p className="auth-footer">DYNASTY DRAFTERS / LEAGUE MANAGEMENT</p>
        </main>
      </div>
    );
  }

  let content = <Home onOpen={openPage} activeLeagueId={leagueId} onSelectLeague={setLeagueId} />;

  if (loggedInPage === "draft") {
    content = <DraftRoom leagueId={leagueId} />;
  } else if (loggedInPage === "roster") {
    content = <Roster leagueId={leagueId} />;
  } else if (loggedInPage === "standings") {
    content = <Standings leagueId={leagueId} />;
  } else if (loggedInPage === "matchup") {
    content = <Matchup leagueId={leagueId} />;
  } else if (loggedInPage === "settings") {
    content = <LeagueSettings leagueId={leagueId} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-brand-small">Season HQ</span>
          <span className="sidebar-wordmark">DYNASTY<br />DRAFTERS</span>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map(function (item) {
            const disabled = item.page !== "home" && !leagueId;
            return (
              <button
                key={item.page}
                type="button"
                className={loggedInPage === item.page ? "sidebar-link is-active" : "sidebar-link"}
                disabled={disabled}
                aria-current={loggedInPage === item.page ? "page" : undefined}
                onClick={() => openPage(item.page)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <span className="sidebar-label">Current league</span>
          <span className="sidebar-league">{leagueId ? "League selected" : "Select a league on Overview"}</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-topbar">
          <span className="workspace-breadcrumb">SEASON HQ / LEAGUE MANAGEMENT</span>
          <div className="workspace-account">
            <span>{user.username}</span>
            <button type="button" onClick={handleLogout}>Log out</button>
          </div>
        </header>
        <main className="workspace-content" id="main-content">{content}</main>
        <footer className="workspace-footer">DYNASTY DRAFTERS <span>FANTASY BASKETBALL</span></footer>
      </div>
    </div>
  );
}

export default App;
