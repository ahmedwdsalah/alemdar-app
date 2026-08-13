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
    thumbnail:
      "https://modelviewer.dev/shared-assets/models/BoomBox.webp",
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
    thumbnail:
      "https://modelviewer.dev/shared-assets/models/RobotExpressive.webp",
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
    thumbnail: "https://modelviewer.dev/shared-assets/models/coffeemat.webp",
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
    thumbnail: "https://modelviewer.dev/shared-assets/models/ToyCar.webp",
    glbUrl:
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/ToyCar/glTF-Binary/ToyCar.glb",
    printTimeHours: 8,
    material: "ABS",
  },
];