import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "alemdar-api",
});

const readRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(300, "1 m"),
  analytics: true,
  prefix: "alemdar-api-read",
});

export const unstable_settings = {
  matcher: {
    patterns: ["/api/[...path]"],
  },
};

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    request.headers.get("cf-connecting-ip") ||
    firstForwardedIp ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export default async function middleware(request: Request) {
  const ip = getClientIp(request);

  const limiter =
    request.method === "GET" || request.method === "HEAD"
      ? readRatelimit
      : ratelimit;
  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000));

    return Response.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
        },
      },
    );
  }
}
