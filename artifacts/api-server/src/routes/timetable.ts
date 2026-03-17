import { Router, type IRouter, type Request, type Response } from "express";
import { db, timetableTable, classesTable, teachersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: Function) {
  if (!(req.session as any).adminId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

router.get("/schools/:schoolId/timetable", requireAuth, async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const { classId, section } = req.query;

    const entries = await db
      .select({
        id: timetableTable.id,
        schoolId: timetableTable.schoolId,
        classId: timetableTable.classId,
        className: classesTable.grade,
        teacherId: timetableTable.teacherId,
        teacherName: teachersTable.name,
        section: timetableTable.section,
        subject: timetableTable.subject,
        dayOfWeek: timetableTable.dayOfWeek,
        startTime: timetableTable.startTime,
        endTime: timetableTable.endTime,
        room: timetableTable.room,
        createdAt: timetableTable.createdAt,
      })
      .from(timetableTable)
      .leftJoin(classesTable, eq(timetableTable.classId, classesTable.id))
      .leftJoin(teachersTable, eq(timetableTable.teacherId, teachersTable.id))
      .where(eq(timetableTable.schoolId, schoolId))
      .orderBy(timetableTable.dayOfWeek, timetableTable.startTime);

    let filtered = entries;
    if (classId) {
      filtered = filtered.filter(e => e.classId === parseInt(classId as string));
    }
    if (section) {
      filtered = filtered.filter(e => e.section === section);
    }

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/schools/:schoolId/timetable", requireAuth, async (req: Request, res: Response) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    const { classId, teacherId, section, subject, dayOfWeek, startTime, endTime, room } = req.body;
    const [entry] = await db.insert(timetableTable).values({
      schoolId,
      classId,
      teacherId,
      section,
      subject,
      dayOfWeek,
      startTime,
      endTime,
      room,
    }).returning();

    const full = await db
      .select({
        id: timetableTable.id,
        schoolId: timetableTable.schoolId,
        classId: timetableTable.classId,
        className: classesTable.grade,
        teacherId: timetableTable.teacherId,
        teacherName: teachersTable.name,
        section: timetableTable.section,
        subject: timetableTable.subject,
        dayOfWeek: timetableTable.dayOfWeek,
        startTime: timetableTable.startTime,
        endTime: timetableTable.endTime,
        room: timetableTable.room,
        createdAt: timetableTable.createdAt,
      })
      .from(timetableTable)
      .leftJoin(classesTable, eq(timetableTable.classId, classesTable.id))
      .leftJoin(teachersTable, eq(timetableTable.teacherId, teachersTable.id))
      .where(eq(timetableTable.id, entry.id))
      .limit(1);

    res.status(201).json(full[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/schools/:schoolId/timetable/:entryId", requireAuth, async (req: Request, res: Response) => {
  try {
    const entryId = parseInt(req.params.entryId);
    const { classId, teacherId, section, subject, dayOfWeek, startTime, endTime, room } = req.body;
    await db.update(timetableTable).set({ classId, teacherId, section, subject, dayOfWeek, startTime, endTime, room })
      .where(eq(timetableTable.id, entryId));

    const full = await db
      .select({
        id: timetableTable.id,
        schoolId: timetableTable.schoolId,
        classId: timetableTable.classId,
        className: classesTable.grade,
        teacherId: timetableTable.teacherId,
        teacherName: teachersTable.name,
        section: timetableTable.section,
        subject: timetableTable.subject,
        dayOfWeek: timetableTable.dayOfWeek,
        startTime: timetableTable.startTime,
        endTime: timetableTable.endTime,
        room: timetableTable.room,
        createdAt: timetableTable.createdAt,
      })
      .from(timetableTable)
      .leftJoin(classesTable, eq(timetableTable.classId, classesTable.id))
      .leftJoin(teachersTable, eq(timetableTable.teacherId, teachersTable.id))
      .where(eq(timetableTable.id, entryId))
      .limit(1);

    res.json(full[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/schools/:schoolId/timetable/:entryId", requireAuth, async (req: Request, res: Response) => {
  try {
    const entryId = parseInt(req.params.entryId);
    await db.delete(timetableTable).where(eq(timetableTable.id, entryId));
    res.json({ success: true, message: "Entry deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
