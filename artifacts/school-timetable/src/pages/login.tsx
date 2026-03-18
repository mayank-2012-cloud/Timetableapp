import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Eye, EyeOff, ShieldCheck, X } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError("");
    setAdminLoading(true);
    try {
      await login(adminId, adminPass);
    } catch (err: any) {
      setAdminError(err.message || "Administrator login failed");
    } finally {
      setAdminLoading(false);
    }
  };

  const toggleAdminForm = () => {
    setShowAdminForm(v => !v);
    setAdminId("");
    setAdminPass("");
    setAdminError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SchoolSync</h1>
              <p className="text-blue-300 text-sm">Timetable Management</p>
            </div>
          </div>
        </div>

        <Card className="shadow-2xl border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password">
                    <span className="text-xs text-blue-500 hover:text-blue-400 cursor-pointer">Forgot password?</span>
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md border border-destructive/20">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {!showAdminForm ? (
              <Button
                type="button"
                variant="outline"
                className="w-full border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-500"
                onClick={toggleAdminForm}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Administrator Login
              </Button>
            ) : (
              <div className="border border-amber-500/40 rounded-lg p-4 bg-amber-50/30 dark:bg-amber-950/10 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    Administrator Login
                  </div>
                  <button
                    type="button"
                    onClick={toggleAdminForm}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleAdminSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-id">Administrator ID</Label>
                    <Input
                      id="admin-id"
                      type="text"
                      value={adminId}
                      onChange={e => setAdminId(e.target.value)}
                      placeholder="Enter administrator ID"
                      autoComplete="off"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="admin-pass">Password</Label>
                    <div className="relative">
                      <Input
                        id="admin-pass"
                        type={showAdminPass ? "text" : "password"}
                        value={adminPass}
                        onChange={e => setAdminPass(e.target.value)}
                        placeholder="Enter administrator password"
                        autoComplete="off"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowAdminPass(v => !v)}
                      >
                        {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {adminError && (
                    <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md border border-destructive/20">
                      {adminError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    disabled={adminLoading}
                  >
                    {adminLoading ? "Verifying..." : "Access Administration"}
                  </Button>
                </form>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Link href="/signup">
                <span className="text-blue-500 hover:text-blue-400 font-medium cursor-pointer">Create one</span>
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
