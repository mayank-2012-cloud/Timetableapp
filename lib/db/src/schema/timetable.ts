import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { schoolsTable } from "./schools";
import { classesTable } from "./classes";
import { teachersTable } from "./teachers";

export const timetableTable = pgTable("timetable", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull().references(() => schoolsTable.id, { onDelete: "cascade" }),
  classId: integer("class_id").notNull().references(() => classesTable.id, { onDelete: "cascade" }),
  teacherId: integer("teacher_id").notNull().references(() => teachersTable.id, { onDelete: "cascade" }),
  section: text("section").notNull(),
  subject: text("subject").notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  room: text("room"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTimetableSchema = createInsertSchema(timetableTable).omit({ id: true, createdAt: true });
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Timetable = typeof timetableTable.$inferSelect;
