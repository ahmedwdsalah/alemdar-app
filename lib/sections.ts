/**
 * Allowlist of product "section" tables in the alemdar-production database.
 *
 * Section tables are heterogeneous (different column names for name/price/image),
 * so each entry describes how to read a normalized product shape from a raw row.
 * Only keys present in this map may be queried by the API (prevents arbitrary
 * table access / SQL injection on dynamic table names).
 */
export type SectionConfig = {
  /** Prisma model delegate name (equals the DB table name). */
  table: string;
  /** Candidate columns for the display name; first non-null wins. */
  nameFields: string[];
  /** Column holding the (selling) price. */
  priceField: string;
  /** Column holding the image filename, if any. */
  imageField?: string;
  /** Column holding the category, if any. */
  categoryField?: string;
};

export const SECTIONS: Record<string, SectionConfig> = {
  main: {
    table: "main",
    nameFields: ["english_name", "turkish_name"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  sound: {
    table: "sound",
    nameFields: ["english_name", "turkish_name"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  arduino: {
    table: "arduino",
    nameFields: ["english_names", "turkish_names"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  adapters: {
    table: "adapters",
    nameFields: ["english_names", "turkish_names"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  chargers: {
    table: "chargers",
    nameFields: ["english_names", "turkish_names"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  electric: {
    table: "electric",
    nameFields: ["english_names", "turkish_names"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  fans: {
    table: "fans",
    nameFields: ["english_names", "turkish_names"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  lamps: {
    table: "lamps",
    nameFields: ["english_names", "turkish_names"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  others: {
    table: "others",
    nameFields: ["english_names", "turkish_names"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  scrawesdriver: {
    table: "scrawesdriver",
    nameFields: ["english_names", "turkish_names"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  mainled: {
    table: "mainled",
    nameFields: ["english_name", "turkish_name"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  spray_gum: {
    table: "spray_gum",
    nameFields: ["english_name", "turkish_name"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  batteries: {
    table: "batteries",
    nameFields: ["model"],
    priceField: "price",
    imageField: "image_filename",
  },
  filaments: {
    table: "filaments",
    nameFields: ["name"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "material",
  },
  mexxsun: {
    table: "mexxsun",
    nameFields: ["name"],
    priceField: "selling_price",
    imageField: "image_filename",
    categoryField: "category",
  },
  solardb: {
    table: "solardb",
    nameFields: ["name"],
    priceField: "selling_price",
    imageField: "image_filename",
    categoryField: "category",
  },
  tv_remotes: {
    table: "tv_remotes",
    nameFields: ["name", "brand"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  camera: {
    table: "camera",
    nameFields: ["english_name", "turkish_name"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  drone: {
    table: "drone",
    nameFields: ["english_names", "turkish_names"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  electronic_spare_parts: {
    table: "electronic_spare_parts",
    nameFields: ["english_names", "turkish_names"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  multimeter: {
    table: "multimeter",
    nameFields: ["english_names", "turkish_names"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  old_products: {
    table: "old_products",
    nameFields: ["english_names", "turkish_names"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  soldering_tool: {
    table: "soldering_tool",
    nameFields: ["english_names", "turkish_names"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
  torch: {
    table: "torch",
    nameFields: ["english_names", "turkish_names"],
    priceField: "price",
    imageField: "image_filename",
    categoryField: "category",
  },
};

export const SECTION_KEYS = Object.keys(SECTIONS);

export function getSection(
  section: string | null | undefined,
): SectionConfig | undefined {
  if (!section) return undefined;
  return Object.hasOwn(SECTIONS, section) ? SECTIONS[section] : undefined;
}

/** Normalize a raw section row into a consistent product shape. */
export function normalizeRow(section: string, row: Record<string, any>) {
  const cfg = SECTIONS[section];
  if (!cfg) return row;
  const name =
    cfg.nameFields
      .map((f) => row[f])
      .find((v) => v != null && `${v}`.trim() !== "") ?? null;
  return {
    id: row.id,
    section,
    name,
    price: row.selling_price ?? row[cfg.priceField] ?? null,
    image_filename: cfg.imageField ? (row[cfg.imageField] ?? null) : null,
    category: cfg.categoryField ? (row[cfg.categoryField] ?? null) : null,
  };
}
