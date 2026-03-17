import { Router, type IRouter, type Request, type Response } from "express";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

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
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    (req.session as any).adminId = admin.id;

    res.json({
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        createdAt: admin.createdAt,
      },
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "Logged out" });
  });
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
    res.json({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      createdAt: admin.createdAt,
    });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
