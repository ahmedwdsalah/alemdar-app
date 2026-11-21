import { createPrisma } from "@/lib/prisma";
import { error, json, parseIntParam } from "@/lib/http";
import { getSection, normalizeRow } from "@/lib/sections";

export async function GET(
  request: Request,
  { section }: Record<string, string>,
) {
  const cfg = getSection(section);
  if (!cfg) {
    return error(`Unknown section "${section}"`, 404);
  }

  const url = new URL(request.url);
  const page = parseIntParam(url.searchParams.get("page"), 1);
  const limit = parseIntParam(url.searchParams.get("limit"), 20, { max: 100 });

  const prisma = createPrisma();
  try {
    const delegate = (prisma as any)[cfg.table];
    const [rows, total] = await Promise.all([
      delegate.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: "asc" },
      }),
      delegate.count(),
    ]);
    return json({
      section,
      data: rows.map((row: Record<string, any>) => normalizeRow(section, row)),
      page,
      limit,
      total,
    });
  } catch {
    return error("Failed to load section products", 500);
  } finally {
    await prisma.$disconnect();
  }
}
