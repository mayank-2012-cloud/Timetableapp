import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { schoolsTable } from "./schools";

export const classesTable = pgTable("classes", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull().references(() => schoolsTable.id, { onDelete: "cascade" }),
  grade: text("grade").notNull(),
  numSections: integer("num_sections").notNull().default(1),
  sections: text("sections").notNull().default("A"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClassSchema = createInsertSchema(classesTable).omit({ id: true, createdAt: true });
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classesTable.$inferSelect;
