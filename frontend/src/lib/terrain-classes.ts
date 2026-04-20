// 16 terrain class reference for TerrainAI
export type ClassGroup = "safe" | "moderate" | "hazardous";

export interface TerrainClass {
  name: string;
  color: string; // hex for swatch
  group: ClassGroup;
}

export const TERRAIN_CLASSES: TerrainClass[] = [
  { name: "Grass", color: "#22c55e", group: "safe" },
  { name: "Dirt", color: "#a16207", group: "safe" },
  { name: "Gravel", color: "#94a3b8", group: "safe" },
  { name: "Sand", color: "#fbbf24", group: "safe" },
  { name: "Pavement", color: "#64748b", group: "safe" },
  { name: "Sky", color: "#38bdf8", group: "safe" },

  { name: "Trees", color: "#15803d", group: "moderate" },
  { name: "Bushes", color: "#65a30d", group: "moderate" },
  { name: "Mud", color: "#78350f", group: "moderate" },
  { name: "Snow", color: "#e2e8f0", group: "moderate" },
  { name: "Structures", color: "#a78bfa", group: "moderate" },

  { name: "Water", color: "#0ea5e9", group: "hazardous" },
  { name: "Rocks", color: "#57534e", group: "hazardous" },
  { name: "Cliff", color: "#7f1d1d", group: "hazardous" },
  { name: "Vehicle", color: "#f43f5e", group: "hazardous" },
  { name: "Person", color: "#ec4899", group: "hazardous" },
];

export function colorForClass(name: string): string {
  const found = TERRAIN_CLASSES.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  return found?.color ?? "#6366f1";
}
