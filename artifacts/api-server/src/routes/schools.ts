import { Router, type IRouter, type Request, type Response } from "express";
import { db, schoolsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: Function) {
  if (!(req.session as any).adminId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.get("/schools", requireAuth, async (_req: Request, res: Response) => {
  try {
    const schools = await db.select().from(schoolsTable).orderBy(schoolsTable.createdAt);
    res.json(schools);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/schools", requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, address, gradeType, minGrade, maxGrade, customGrades } = req.body;
    const [school] = await db.insert(schoolsTable).values({
      name,
      address,
      gradeType: gradeType || "standard",
      minGrade: minGrade ?? 1,
      maxGrade: maxGrade ?? 12,
      customGrades,
    }).returning();
    res.status(201).json(school);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/schools/:schoolId", requireAuth, async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const schools = await db.select().from(schoolsTable).where(eq(schoolsTable.id, schoolId)).limit(1);
    if (!schools[0]) {
      res.status(404).json({ error: "School not found" });
      return;
    }
    res.json(schools[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/schools/:schoolId", requireAuth, async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const { name, address, gradeType, minGrade, maxGrade, customGrades } = req.body;
    const [school] = await db.update(schoolsTable).set({
      name,
      address,
      gradeType,
      minGrade,
      maxGrade,
      customGrades,
    }).where(eq(schoolsTable.id, schoolId)).returning();
    if (!school) {
      res.status(404).json({ error: "School not found" });
      return;
    }
    res.json(school);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/schools/:schoolId", requireAuth, async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    await db.delete(schoolsTable).where(eq(schoolsTable.id, schoolId));
    res.json({ success: true, message: "School deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
