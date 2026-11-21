import { createPrisma } from "@/lib/prisma";
import { error, json } from "@/lib/http";

export async function GET() {
  const prisma = createPrisma();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return json({ status: "ok", db: "up", time: new Date().toISOString() });
  } catch {
    return error("Database unreachable", 503);
  } finally {
    await prisma.$disconnect();
  }
}
