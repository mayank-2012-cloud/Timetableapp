import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const schoolsTable = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  gradeType: text("grade_type").notNull().default("standard"),
  minGrade: integer("min_grade").notNull().default(1),
  maxGrade: integer("max_grade").notNull().default(12),
  customGrades: text("custom_grades"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSchoolSchema = createInsertSchema(schoolsTable).omit({ id: true, createdAt: true });
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type School = typeof schoolsTable.$inferSelect;
