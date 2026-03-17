import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface Admin {
  id: number;
  username: string;
  name: string;
  email?: string;
  createdAt: string;
}

interface AuthContextType {
  admin: Admin | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then(res => { if (res.ok) return res.json(); throw new Error("Not authenticated"); })
      .then(setAdmin)
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Login failed"); }
    const data = await res.json();
    setAdmin(data.admin);
  };

  const signup = async (name: string, username: string, email: string, password: string) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, username, email, password }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Signup failed"); }
    const data = await res.json();
    setAdmin(data.admin);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
