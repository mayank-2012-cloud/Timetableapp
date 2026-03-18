import { Router, type IRouter, type Request, type Response } from "express";
import { db, adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response): number | null {
  const adminId = (req.session as any).adminId;
  if (!adminId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return adminId;
}

router.put("/profile", async (req: Request, res: Response) => {
  const adminId = requireAuth(req, res);
  if (!adminId) return;

  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const admins = await db.select().from(adminsTable).where(eq(adminsTable.id, adminId)).limit(1);
    const admin = admins[0];
    if (!admin) { res.status(404).json({ error: "Account not found" }); return; }

    const updates: Partial<typeof adminsTable.$inferInsert> = {};

    if (name && name.trim()) updates.name = name.trim();

    if (email && email.trim()) {
      const existing = await db.select().from(adminsTable)
        .where(eq(adminsTable.email, email.trim())).limit(1);
      if (existing[0] && existing[0].id !== adminId) {
        res.status(409).json({ error: "Email already used by another account" });
        return;
      }
      updates.email = email.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: "Current password is required to set a new password" });
        return;
      }
      const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!valid) {
        res.status(400).json({ error: "Current password is incorrect" });
        return;
      }
      if (newPassword.length < 6) {
        res.status(400).json({ error: "New password must be at least 6 characters" });
        return;
      }
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No changes provided" });
      return;
    }

    const [updated] = await db.update(adminsTable).set(updates).where(eq(adminsTable.id, adminId)).returning();
    res.json({
      admin: { id: updated.id, username: updated.username, name: updated.name, email: updated.email, createdAt: updated.createdAt },
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
