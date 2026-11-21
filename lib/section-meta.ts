/**
 * Display metadata for the live API sections (the DB only returns section keys
 * and counts, so titles/subtitles/colors/icons live here on the client).
 */
import type { Ionicons } from "@expo/vector-icons";

export type SectionMeta = {
  key: string;
  title: string;
  subtitle: string;
  accentColor: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const SECTION_META: Record<string, SectionMeta> = {
  arduino: {
    key: "arduino",
    title: "Arduino",
    subtitle: "Boards, modules and sensors for every project.",
    accentColor: "#00979d",
    icon: "hardware-chip-outline",
  },
  solardb: {
    key: "solardb",
    title: "Solar",
    subtitle: "Solar panels, inverters and energy solutions.",
    accentColor: "#f5a623",
    icon: "sunny-outline",
  },
  mexxsun: {
    key: "mexxsun",
    title: "Mexxsun",
    subtitle: "Renewable energy inverters and power systems.",
    accentColor: "#10b981",
    icon: "leaf-outline",
  },
  fans: {
    key: "fans",
    title: "Fans",
    subtitle: "Cooling fans and ventilation systems.",
    accentColor: "#06b6d4",
    icon: "thermometer-outline",
  },
  batteries: {
    key: "batteries",
    title: "Batteries",
    subtitle: "Rechargeable batteries and power storage.",
    accentColor: "#e3342f",
    icon: "battery-charging-outline",
  },
  adapters: {
    key: "adapters",
    title: "Adapters",
    subtitle: "Power adapters and converters for everyday electronics.",
    accentColor: "#3b82f6",
    icon: "swap-horizontal-outline",
  },
  chargers: {
    key: "chargers",
    title: "Chargers",
    subtitle: "Chargers for phones, tools and devices.",
    accentColor: "#3b82f6",
    icon: "phone-portrait-outline",
  },
  sound: {
    key: "sound",
    title: "Sound",
    subtitle: "Speakers, mixers and audio systems.",
    accentColor: "#a855f7",
    icon: "musical-notes-outline",
  },
  filaments: {
    key: "filaments",
    title: "Filaments",
    subtitle: "3D printing filaments - PLA, ABS, PETG & more.",
    accentColor: "#ec4899",
    icon: "layers-outline",
  },
  electric: {
    key: "electric",
    title: "Electric",
    subtitle: "Cables, connectors and daily electronics.",
    accentColor: "#f97316",
    icon: "construct-outline",
  },
  lamps: {
    key: "lamps",
    title: "Lamps",
    subtitle: "Lamps and lighting solutions.",
    accentColor: "#fbbf24",
    icon: "bulb-outline",
  },
  mainled: {
    key: "mainled",
    title: "Cable",
    subtitle: "Cables and connectors.",
    accentColor: "#22d3ee",
    icon: "flashlight-outline",
  },
  tv_remotes: {
    key: "tv_remotes",
    title: "TV Remotes",
    subtitle: "Replacement remotes for every TV.",
    accentColor: "#6366f1",
    icon: "tv-outline",
  },
  scrawesdriver: {
    key: "scrawesdriver",
    title: "Screwdrivers",
    subtitle: "Hand tools and screwdrivers.",
    accentColor: "#78716c",
    icon: "settings-outline",
  },
  spray_gum: {
    key: "spray_gum",
    title: "Spray & Gum",
    subtitle: "Sprays, adhesives and consumables.",
    accentColor: "#84cc16",
    icon: "color-fill-outline",
  },
  others: {
    key: "others",
    title: "Others",
    subtitle: "More products across categories.",
    accentColor: "#94a3b8",
    icon: "cube-outline",
  },
  camera: {
    key: "camera",
    title: "Camera",
    subtitle: "Cameras and accessories.",
    accentColor: "#64748b",
    icon: "camera-outline",
  },
  drone: {
    key: "drone",
    title: "Drone",
    subtitle: "Drones and accessories.",
    accentColor: "#64748b",
    icon: "airplane-outline",
  },
  electronic_spare_parts: {
    key: "electronic_spare_parts",
    title: "Electronic Spare Parts",
    subtitle: "Parts for electronics.",
    accentColor: "#64748b",
    icon: "hardware-chip-outline",
  },
  multimeter: {
    key: "multimeter",
    title: "Multimeters",
    subtitle: "Meters and testing equipment.",
    accentColor: "#64748b",
    icon: "speedometer-outline",
  },
  old_products: {
    key: "old_products",
    title: "Old Products",
    subtitle: "More products from our catalog.",
    accentColor: "#64748b",
    icon: "cube-outline",
  },
  soldering_tool: {
    key: "soldering_tool",
    title: "Soldering Tools",
    subtitle: "Tools and supplies for soldering.",
    accentColor: "#64748b",
    icon: "construct-outline",
  },
  torch: {
    key: "torch",
    title: "Torch",
    subtitle: "Torches and accessories.",
    accentColor: "#64748b",
    icon: "flashlight-outline",
  },
  main: {
    key: "main",
    title: "All Products",
    subtitle: "The full Alemdar Teknik catalog.",
    accentColor: "#f5a623",
    icon: "grid-outline",
  },
};

/** Sections featured on the home screen, in display order. */
export const HOME_SECTIONS: string[] = [
  "arduino",
  "solardb",
  "mexxsun",
  "sound",
  "batteries",
  "adapters",
  "fans",
  "filaments",
];

export function getSectionMeta(key: string): SectionMeta {
  return (
    SECTION_META[key] ?? {
      key,
      title: key,
      subtitle: "",
      accentColor: "#f5a623",
      icon: "cube-outline",
    }
  );
}
