import { createPrisma } from "@/lib/prisma";
import { error, json } from "@/lib/http";
import { getSection, normalizeRow } from "@/lib/sections";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const section = url.searchParams.get("section");
  const id = url.searchParams.get("id");

  if (!getSection(section)) {
    return error(`Unknown or missing "section"`, 404);
  }
  const sourceId = Number(id);
  if (!Number.isInteger(sourceId)) {
    return error('Invalid or missing "id"', 400);
  }

  const prisma = createPrisma();
  try {
    const links = await prisma.product_similars.findMany({
      where: { source_section: section!, source_product_id: sourceId },
    });

    // Group target ids by their section, then hydrate each allowlisted section once.
    const bySection = new Map<string, number[]>();
    for (const link of links) {
      if (!getSection(link.similar_section)) continue;
      const arr = bySection.get(link.similar_section) ?? [];
      arr.push(link.similar_product_id);
      bySection.set(link.similar_section, arr);
    }

    const groups = await Promise.all(
      [...bySection.entries()].map(async ([sec, ids]) => {
        const delegate = (prisma as any)[getSection(sec)!.table];
        const rows = await delegate.findMany({ where: { id: { in: ids } } });
        return rows.map((r: Record<string, any>) => normalizeRow(sec, r));
      }),
    );

    return json({ section, id: sourceId, data: groups.flat() });
  } catch {
    return error("Failed to load similar products", 500);
  } finally {
    await prisma.$disconnect();
  }
}
