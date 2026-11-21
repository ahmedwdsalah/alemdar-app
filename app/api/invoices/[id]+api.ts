import { createPrisma } from "@/lib/prisma";
import { error, json } from "@/lib/http";

export async function GET(_request: Request, { id }: Record<string, string>) {
  const invoiceId = Number(id);
  if (!Number.isInteger(invoiceId)) {
    return error("Invalid invoice id", 400);
  }

  const prisma = createPrisma();
  try {
    const invoice = await prisma.invoices.findUnique({
      where: { id: invoiceId },
      include: { invoice_items: { orderBy: { id: "asc" } } },
    });
    if (!invoice) {
      return error("Invoice not found", 404);
    }
    return json(invoice);
  } catch {
    return error("Failed to load invoice", 500);
  } finally {
    await prisma.$disconnect();
  }
}
