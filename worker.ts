import rateLimit from "./app/+middleware";
import * as cartOrder from "./app/api/cart-order+api";
import * as categories from "./app/api/categories+api";
import * as health from "./app/api/health+api";
import * as invoices from "./app/api/invoices+api";
import * as invoice from "./app/api/invoices/[id]+api";
import * as products from "./app/api/products+api";
import * as product from "./app/api/products/[id]+api";
import * as productSearch from "./app/api/products/search+api";
import * as sections from "./app/api/sections+api";
import * as section from "./app/api/sections/[section]+api";
import * as similars from "./app/api/similars+api";

type Handler = (
  request: Request,
  params: Record<string, string>,
) => Response | Promise<Response>;
const routes: [RegExp, Record<string, Handler>, string[]?][] = [
  [/^\/api\/health\/?$/, health],
  [/^\/api\/cart-order\/?$/, cartOrder],
  [/^\/api\/categories\/?$/, categories],
  [/^\/api\/invoices\/?$/, invoices],
  [/^\/api\/invoices\/([^/]+)\/?$/, invoice, ["id"]],
  [/^\/api\/products\/?$/, products],
  [/^\/api\/products\/search\/?$/, productSearch],
  [/^\/api\/products\/([^/]+)\/?$/, product, ["id"]],
  [/^\/api\/sections\/?$/, sections],
  [/^\/api\/sections\/([^/]+)\/?$/, section, ["section"]],
  [/^\/api\/similars\/?$/, similars],
];

export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (!pathname.startsWith("/api/"))
      return Response.json({ error: "Not found" }, { status: 404 });

    const limited = await rateLimit(request);
    if (limited) return limited;

    const match = routes
      .map(([pattern, handlers, keys]) => ({
        match: pathname.match(pattern),
        handlers,
        keys,
      }))
      .find((route) => route.match);
    if (!match?.match)
      return Response.json({ error: "Not found" }, { status: 404 });

    const method = request.method.toUpperCase();
    const handler = match.handlers[method];
    if (!handler)
      return Response.json({ error: "Method not allowed" }, { status: 405 });

    const params = Object.fromEntries(
      (match.keys ?? []).map((key, index) => [
        key,
        decodeURIComponent(match.match![index + 1]),
      ]),
    );
    return handler(request, params);
  },
};
