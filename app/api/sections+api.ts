import { createPrisma } from "@/lib/prisma";
import { error, json } from "@/lib/http";
import { SECTIONS, SECTION_KEYS } from "@/lib/sections";

export async function GET() {
  const prisma = createPrisma();
  try {
    const counts = await Promise.all(
      SECTION_KEYS.map(async (key) => {
        const delegate = (prisma as any)[SECTIONS[key].table];
        const count = await delegate.count();
        return { section: key, table: SECTIONS[key].table, count };
      }),
    );
    return json({ data: counts, total: counts.length });
  } catch {
    return error("Failed to load sections", 500);
  } finally {
    await prisma.$disconnect();
  }
}
