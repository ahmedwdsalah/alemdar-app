import { strict as assert } from "node:assert";
import { test } from "node:test";
import { SECTION_KEYS } from "../lib/sections.ts";

const base = process.env.TEST_API_URL ?? "http://127.0.0.1:8798";

async function check(path, expected = 200) {
  const response = await fetch(`${base}/api${path}`, {
    signal: AbortSignal.timeout(20000),
  });
  assert.equal(response.status, expected, `${path}: ${response.status}`);
  return response.json();
}

test("consecutive and concurrent reads work across the API", async () => {
  for (const path of [
    "/health",
    "/sections/arduino?limit=1",
    "/sections/chargers?limit=1",
    "/sections/adapters?limit=1",
    "/sections/lamps?limit=1",
    "/sections/batteries?limit=1",
    "/products?limit=1",
    "/products/1?section=arduino",
    "/categories?section=arduino",
    "/similars?section=arduino&id=1",
    "/sections",
    "/categories",
    "/products/search?q=",
    "/invoices?limit=1",
  ]) {
    await check(path);
  }
  await check("/products/invalid", 400);
  await check("/sections/not-a-section", 404);
  const pages = await Promise.all(
    SECTION_KEYS.map((key) => check(`/sections/${key}?limit=1`)),
  );
  pages.forEach((page, index) =>
    assert.equal(page.section, SECTION_KEYS[index]),
  );
});
