import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { adminsTable } from "./admins";

export const passwordResetTokensTable = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => adminsTable.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokensTable.$inferSelect;
