import { createPrisma } from "@/lib/prisma";
import { error, json } from "@/lib/http";
import { SECTIONS, SECTION_KEYS, getSection } from "@/lib/sections";

function cleanName(value: unknown): string | null {
  if (value == null) return null;
  const s = `${value}`.trim();
  return s === "" ? null : s;
}

async function categoriesForSection(
  prisma: ReturnType<typeof createPrisma>,
  key: string,
) {
  const cfg = SECTIONS[key];
  if (!cfg.categoryField) return [] as { category: string; count: number }[];
  const delegate = (prisma as any)[cfg.table];
  const grouped = await delegate.groupBy({
    by: [cfg.categoryField],
    _count: { _all: true },
  });
  return grouped
    .map((g: Record<string, any>) => ({
      category: cleanName(g[cfg.categoryField!]),
      count: g._count._all,
    }))
    .filter((g: { category: string | null }) => g.category) as {
    category: string;
    count: number;
  }[];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const section = url.searchParams.get("section");

  const prisma = createPrisma();
  try {
    // Categories within a single allowlisted section.
    if (section) {
      if (!getSection(section))
        return error(`Unknown section "${section}"`, 404);
      const data = (await categoriesForSection(prisma, section)).sort((a, b) =>
        a.category.localeCompare(b.category),
      );
      return json({ section, data, total: data.length });
    }

    // Merged categories across all sections (master `main` has no usable categories).
    const perSection = await Promise.all(
      SECTION_KEYS.filter((k) => k !== "main").map((k) =>
        categoriesForSection(prisma, k),
      ),
    );
    const merged = new Map<string, number>();
    for (const list of perSection) {
      for (const { category, count } of list) {
        merged.set(category, (merged.get(category) ?? 0) + count);
      }
    }
    const data = [...merged.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category));
    return json({ data, total: data.length });
  } catch {
    return error("Failed to load categories", 500);
  } finally {
    await prisma.$disconnect();
  }
}
