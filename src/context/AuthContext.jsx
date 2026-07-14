import React, { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken, clearToken } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const signup = async (payload) => {
    const { user, token } = await api.signup(payload);
    setToken(token);
    setUser(user);
    return user;
  };

  const login = async (payload) => {
    const { user, token } = await api.login(payload);
    setToken(token);
    setUser(user);
    return user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const refreshUser = async () => {
    const { user } = await api.me();
    setUser(user);
    return user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, refreshUser }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
