import { Router, type IRouter, type Request, type Response } from "express";
import { db, classesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: Function) {
  if (!(req.session as any).adminId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.get("/schools/:schoolId/classes", requireAuth, async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const classes = await db.select().from(classesTable).where(eq(classesTable.schoolId, schoolId)).orderBy(classesTable.grade);
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/schools/:schoolId/classes", requireAuth, async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const { grade, numSections, sections } = req.body;
    const [cls] = await db.insert(classesTable).values({
      schoolId,
      grade,
      numSections,
      sections,
    }).returning();
    res.status(201).json(cls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/schools/:schoolId/classes/:classId", requireAuth, async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const classId = parseInt(req.params.classId);
    const { grade, numSections, sections } = req.body;
    const [cls] = await db.update(classesTable).set({ grade, numSections, sections })
      .where(and(eq(classesTable.id, classId), eq(classesTable.schoolId, schoolId)))
      .returning();
    if (!cls) {
      res.status(404).json({ error: "Class not found" });
      return;
    }
    res.json(cls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/schools/:schoolId/classes/:classId", requireAuth, async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const classId = parseInt(req.params.classId);
    await db.delete(classesTable).where(and(eq(classesTable.id, classId), eq(classesTable.schoolId, schoolId)));
    res.json({ success: true, message: "Class deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
