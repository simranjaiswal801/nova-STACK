import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const refreshUser = async () => {
    try { const data = await api.me(); setUser(data.user); setAuthError(""); return data.user; }
    catch (error) { setUser(null); if (error.status !== 401) setAuthError(error.message); return null; }
    finally { setLoading(false); }
  };
  useEffect(() => { refreshUser(); }, []);
  const value = useMemo(() => ({ user, loading, authError,
    async login(credentials) { const data = await api.login(credentials); setUser(data.user); setAuthError(""); return data.user; },
    async register(details) { const data = await api.register(details); setUser(data.user); setAuthError(""); return data.user; },
    async logout() { try { await api.logout(); } finally { setUser(null); setAuthError(""); } },
    refreshUser,
  }), [user, loading, authError]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
