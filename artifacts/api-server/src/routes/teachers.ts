import { Router, type IRouter, type Request, type Response } from "express";
import { db, teachersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: Function) {
  if (!(req.session as any).adminId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.get("/schools/:schoolId/teachers", requireAuth, async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const teachers = await db.select().from(teachersTable).where(eq(teachersTable.schoolId, schoolId)).orderBy(teachersTable.name);
    res.json(teachers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/schools/:schoolId/teachers", requireAuth, async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const { name, email, phone, subjects } = req.body;
    const [teacher] = await db.insert(teachersTable).values({
      schoolId,
      name,
      email,
      phone,
      subjects,
    }).returning();
    res.status(201).json(teacher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/schools/:schoolId/teachers/:teacherId", requireAuth, async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const teacherId = parseInt(req.params.teacherId);
    const { name, email, phone, subjects } = req.body;
    const [teacher] = await db.update(teachersTable).set({ name, email, phone, subjects })
      .where(and(eq(teachersTable.id, teacherId), eq(teachersTable.schoolId, schoolId)))
      .returning();
    if (!teacher) {
      res.status(404).json({ error: "Teacher not found" });
      return;
    }
    res.json(teacher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/schools/:schoolId/teachers/:teacherId", requireAuth, async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const teacherId = parseInt(req.params.teacherId);
    await db.delete(teachersTable).where(and(eq(teachersTable.id, teacherId), eq(teachersTable.schoolId, schoolId)));
    res.json({ success: true, message: "Teacher deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
