import { strict as assert } from "node:assert";
import { test } from "node:test";
import { getSection, normalizeRow, SECTION_KEYS } from "../lib/sections.ts";

test("current stock sections resolve and prices prefer selling price", () => {
  for (const section of [
    "camera",
    "drone",
    "electronic_spare_parts",
    "multimeter",
    "old_products",
    "soldering_tool",
    "torch",
  ]) {
    assert.equal(getSection(section)?.table, section);
    assert.ok(SECTION_KEYS.includes(section));
  }
  assert.equal(getSection("toString"), undefined);
  assert.equal(
    normalizeRow("drone", { id: 1, selling_price: 20, price: "10" }).price,
    20,
  );
  assert.equal(
    normalizeRow("drone", { id: 1, selling_price: null, price: "10" }).price,
    "10",
  );
  assert.equal(normalizeRow("main", { id: 1, price: 10 }).price, 10);
});
