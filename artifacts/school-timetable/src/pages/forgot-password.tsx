import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowLeft, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send reset email");
      }
      setSent(true);
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
          {sent ? (
            <>
              <CardHeader>
                <div className="flex justify-center mb-3">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full">
                    <MailCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">Check your email</CardTitle>
                <CardDescription className="text-center">
                  If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-sm text-muted-foreground mb-4">
                  The link expires in 1 hour. Check your spam folder if you don't see it.
                </p>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />Back to Sign In
                  </Button>
                </Link>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-xl">Forgot Password</CardTitle>
                <CardDescription>
                  Enter the email address linked to your account and we'll send you a reset link.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@school.com"
                      autoComplete="email"
                      required
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md border border-destructive/20">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>

                <Link href="/">
                  <Button variant="ghost" className="w-full mt-3 text-muted-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" />Back to Sign In
                  </Button>
                </Link>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
