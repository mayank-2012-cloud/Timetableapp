import { useState } from "react";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
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
          {!token ? (
            <>
              <CardHeader>
                <div className="flex justify-center mb-3">
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
                <CardTitle className="text-center">Invalid Link</CardTitle>
                <CardDescription className="text-center">
                  This password reset link is invalid or has expired.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/forgot-password">
                  <Button className="w-full">Request a New Link</Button>
                </Link>
              </CardContent>
            </>
          ) : success ? (
            <>
              <CardHeader>
                <div className="flex justify-center mb-3">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">Password Reset!</CardTitle>
                <CardDescription className="text-center">
                  Your password has been updated successfully.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/">
                  <Button className="w-full">Sign In Now</Button>
                </Link>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-xl">Set New Password</CardTitle>
                <CardDescription>Choose a strong new password for your account.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(v => !v)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirm New Password</Label>
                    <Input
                      id="confirm"
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md border border-destructive/20">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
