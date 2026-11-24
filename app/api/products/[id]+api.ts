import { createPrisma } from "@/lib/prisma";
import { error, json } from "@/lib/http";
import { getSection, normalizeRow } from "@/lib/sections";

export async function GET(request: Request, { id }: Record<string, string>) {
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return error("Invalid product id", 400);
  }

  const prisma = createPrisma();
  try {
    const url = new URL(request.url);
    const section = url.searchParams.get("section");

    if (section) {
      const cfg = getSection(section);
      if (!cfg) return error(`Unknown section "${section}"`, 404);

      const delegate = (prisma as any)[cfg.table];
      const row = await delegate.findUnique({ where: { id: productId } });
      if (!row) {
        return error("Product not found", 404);
      }
      return json(normalizeRow(section, row));
    }

    const product = await prisma.main.findUnique({ where: { id: productId } });
    if (!product) {
      return error("Product not found", 404);
    }
    return json(product);
  } catch {
    return error("Failed to load product", 500);
  } finally {
    await prisma.$disconnect();
  }
}
