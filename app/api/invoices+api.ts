import { createPrisma } from "@/lib/prisma";
import { error, json, parseIntParam } from "@/lib/http";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sp = url.searchParams;

  const page = parseIntParam(sp.get("page"), 1);
  const limit = parseIntParam(sp.get("limit"), 20, { max: 100 });
  const status = sp.get("status");
  const from = sp.get("from");
  const to = sp.get("to");
  const includeUndone =
    sp.get("includeUndone") === "1" || sp.get("includeUndone") === "true";

  const where: Record<string, any> = {};
  if (status) where.status = status;
  if (!includeUndone) where.undone_at = null;

  const dateFilter: Record<string, any> = {};
  if (from && !Number.isNaN(Date.parse(from))) dateFilter.gte = new Date(from);
  if (to && !Number.isNaN(Date.parse(to))) dateFilter.lte = new Date(to);
  if (Object.keys(dateFilter).length) where.date_created = dateFilter;

  const prisma = createPrisma();
  try {
    const [data, total] = await Promise.all([
      prisma.invoices.findMany({
        where,
        orderBy: { date_created: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { _count: { select: { invoice_items: true } } },
      }),
      prisma.invoices.count({ where }),
    ]);
    return json({ data, page, limit, total });
  } catch {
    return error("Failed to load invoices", 500);
  } finally {
    await prisma.$disconnect();
  }
}
