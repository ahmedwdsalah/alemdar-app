import { createPrisma } from "@/lib/prisma";
import { error, json, parseIntParam } from "@/lib/http";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sp = url.searchParams;

  const page = parseIntParam(sp.get("page"), 1);
  const limit = parseIntParam(sp.get("limit"), 20, { max: 100 });

  const category = sp.get("category");
  const subCategory = sp.get("sub_category");
  const minPrice = sp.get("minPrice");
  const maxPrice = sp.get("maxPrice");
  const inStock = sp.get("inStock");
  const sort = sp.get("sort"); // price_asc | price_desc | id_asc | id_desc

  const where: Record<string, any> = {};
  if (category) where.category = category;
  if (subCategory) where.sub_category = subCategory;
  if (inStock === "1" || inStock === "true") where.kalan_miktar = { gt: 0 };

  const priceFilter: Record<string, any> = {};
  if (minPrice != null && minPrice !== "" && Number.isFinite(Number(minPrice)))
    priceFilter.gte = Number(minPrice);
  if (maxPrice != null && maxPrice !== "" && Number.isFinite(Number(maxPrice)))
    priceFilter.lte = Number(maxPrice);
  if (Object.keys(priceFilter).length) where.price = priceFilter;

  let orderBy: Record<string, "asc" | "desc"> = { id: "asc" };
  if (sort === "price_asc") orderBy = { price: "asc" };
  else if (sort === "price_desc") orderBy = { price: "desc" };
  else if (sort === "id_desc") orderBy = { id: "desc" };

  const prisma = createPrisma();
  try {
    const [data, total] = await Promise.all([
      prisma.main.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.main.count({ where }),
    ]);
    return json({ data, page, limit, total });
  } catch {
    return error("Failed to load products", 500);
  } finally {
    await prisma.$disconnect();
  }
}
