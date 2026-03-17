import { db, adminsTable } from "@workspace/db";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seedAdmin() {
  const existing = await db.select().from(adminsTable).where(eq(adminsTable.username, "admin")).limit(1);
  if (existing.length > 0) {
    console.log("Admin already exists, skipping seed.");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash("admin123", 10);
  await db.insert(adminsTable).values({
    username: "admin",
    passwordHash,
    name: "Super Admin",
  });

  console.log("Admin seeded: username=admin, password=admin123");
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
