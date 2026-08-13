export interface PrintOrderPayload {
  source: "catalog" | "upload";
  catalogModelId?: string;
  fileUri?: string;   // local uri of the user's STL, only for source === "upload"
  fileName?: string;
  material: string;
  color: string;
  quantity: number;
  notes?: string;
}

export interface PrintOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * TODO(backend): supervisor will wire this to the real print-order endpoint
 * once company products + upload storage are ready. For now this is a stub
 * that simulates a network round trip so the UI can be fully exercised.
 *
 * Expected real behavior:
 * - if payload.source === "upload", the STL at payload.fileUri needs to be
 *   uploaded (likely multipart/form-data) to object storage first, then the
 *   order record created referencing that stored file.
 * - if payload.source === "catalog", just reference catalogModelId server-side.
 */
export async function submitPrintOrder(
  payload: PrintOrderPayload
): Promise<PrintOrderResult> {
  console.log("[stub] submitPrintOrder called with:", payload);
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { success: true, orderId: `MOCK-${Date.now()}` };
}