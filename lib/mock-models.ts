export type ModelCategory = "enclosure" | "robotics" | "accessory";

export interface ShowcaseModel {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ModelCategory;
  thumbnail: string; // static preview image for the grid
  glbUrl: string;    // live-rendered when opened
  printTimeHours: number;
  material: string;
}

export const SHOWCASE_MODELS: ShowcaseModel[] = [
  {
    id: "boombox-speaker-case",
    name: "Bluetooth Speaker Enclosure",
    description:
      "Printable housing for a portable speaker build. Fits standard driver + amp board mounts.",
    price: 24.99,
    category: "enclosure",
    thumbnail: "https://images.unsplash.com/photo-1511499271651-073325718d90?w=600&h=600&fit=crop&q=80",
    glbUrl:
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/BoomBox/glTF-Binary/BoomBox.glb",
    printTimeHours: 6,
    material: "PETG",
  },
  {
    id: "robot-arm-kit",
    name: "Robotics Arm Kit",
    description:
      "Articulated arm frame for Arduino-driven servo projects. Prints in parts, snaps together.",
    price: 39.5,
    category: "robotics",
    thumbnail: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600&h=600&fit=crop&q=80",
    glbUrl: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
    printTimeHours: 11,
    material: "PLA+",
  },
  {
    id: "iot-controller-housing",
    name: "IoT Controller Housing",
    description:
      "Ventilated enclosure for microcontroller + relay boards. Snap-fit lid, cable cutouts.",
    price: 18.0,
    category: "enclosure",
    thumbnail: "https://images.unsplash.com/photo-1631376178637-392efc9e356b?w=600&h=600&fit=crop&q=80",
    glbUrl: "https://modelviewer.dev/shared-assets/models/coffeemat.glb",
    printTimeHours: 4,
    material: "PLA",
  },
  {
    id: "rc-chassis-kit",
    name: "RC Robot Car Chassis",
    description:
      "Two-motor chassis for beginner robotics builds. Pairs with any Arduino motor shield.",
    price: 29.0,
    category: "robotics",
    thumbnail:  "https://images.unsplash.com/photo-1643236873141-6511884b19e2?w=600&h=600&fit=crop&q=80",
    glbUrl:
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/ToyCar/glTF-Binary/ToyCar.glb",
    printTimeHours: 8,
    material: "ABS",
  },
];