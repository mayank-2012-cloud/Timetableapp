import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { schoolsTable } from "./schools";

export const teachersTable = pgTable("teachers", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull().references(() => schoolsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  subjects: text("subjects"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTeacherSchema = createInsertSchema(teachersTable).omit({ id: true, createdAt: true });
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type Teacher = typeof teachersTable.$inferSelect;
