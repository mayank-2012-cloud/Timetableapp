import { Router, type IRouter, type Request, type Response } from "express";
import { db, adminsTable, passwordResetTokensTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../lib/email";

const router: IRouter = Router();

router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }
    const admins = await db.select().from(adminsTable).where(eq(adminsTable.username, username)).limit(1);
    const admin = admins[0];
    if (!admin) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    (req.session as any).adminId = admin.id;
    res.json({
      admin: { id: admin.id, username: admin.username, name: admin.name, email: admin.email, createdAt: admin.createdAt },
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/signup", async (req: Request, res: Response) => {
  try {
    const { username, password, name, email } = req.body;
    if (!username || !password || !name || !email) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }
    const existing = await db.select().from(adminsTable)
      .where(eq(adminsTable.username, username)).limit(1);
    if (existing[0]) {
      res.status(409).json({ error: "Username already taken" });
      return;
    }
    const existingEmail = await db.select().from(adminsTable)
      .where(eq(adminsTable.email, email)).limit(1);
    if (existingEmail[0]) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [admin] = await db.insert(adminsTable).values({ username, passwordHash, name, email }).returning();
    (req.session as any).adminId = admin.id;
    res.status(201).json({
      admin: { id: admin.id, username: admin.username, name: admin.name, email: admin.email, createdAt: admin.createdAt },
      message: "Account created",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    const admins = await db.select().from(adminsTable).where(eq(adminsTable.email, email)).limit(1);
    const admin = admins[0];
    if (!admin) {
      res.json({ message: "If that email is registered, a reset link has been sent." });
      return;
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await db.insert(passwordResetTokensTable).values({ adminId: admin.id, token, expiresAt });
    const domains = process.env.REPLIT_DOMAINS?.split(",")[0];
    const baseUrl = domains ? `https://${domains}` : "http://localhost:80";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;
    await sendPasswordResetEmail(admin.email!, admin.name, resetLink);
    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Failed to send reset email" });
  }
});

router.post("/auth/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }
    const tokens = await db.select().from(passwordResetTokensTable)
      .where(and(
        eq(passwordResetTokensTable.token, token),
        eq(passwordResetTokensTable.used, false),
        gt(passwordResetTokensTable.expiresAt, new Date()),
      )).limit(1);
    const resetToken = tokens[0];
    if (!resetToken) {
      res.status(400).json({ error: "Invalid or expired reset link" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await db.update(adminsTable).set({ passwordHash }).where(eq(adminsTable.id, resetToken.adminId));
    await db.update(passwordResetTokensTable).set({ used: true }).where(eq(passwordResetTokensTable.id, resetToken.id));
    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (req: Request, res: Response) => {
  req.session.destroy(() => res.json({ success: true, message: "Logged out" }));
});

router.get("/auth/me", async (req: Request, res: Response) => {
  const adminId = (req.session as any).adminId;
  if (!adminId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    const admins = await db.select().from(adminsTable).where(eq(adminsTable.id, adminId)).limit(1);
    const admin = admins[0];
    if (!admin) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    res.json({ id: admin.id, username: admin.username, name: admin.name, email: admin.email, createdAt: admin.createdAt });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
