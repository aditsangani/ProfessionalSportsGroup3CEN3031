import React, { createContext, useContext, useState } from "react";

export const API_URL = "http://localhost:5000";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // if someone logged in before, pick up where they left off
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));

  function saveLogin(newToken, newUser) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, saveLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
