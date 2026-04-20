// TerrainAI backend integration
const STORAGE_KEY = "terrainai.api_base";
const DEFAULT_API_BASE = "http://localhost:8000";

export function getApiBase(): string {
  if (typeof window === "undefined") return DEFAULT_API_BASE;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_API_BASE;
}

export function setApiBase(value: string) {
  localStorage.setItem(STORAGE_KEY, value);
}

export interface HealthResponse {
  status: string;
  miou: number;
  device: string;
}

export interface SegmentResponse {
  mask_b64: string;
  overlay_b64: string;
  classes: Record<string, number>;
  traversability: number;
  best_path: "left_zone" | "center_zone" | "right_zone";
  zone_scores: { left: number; center: number; right: number };
  inference_ms: number;
  miou: number;
}

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${getApiBase()}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function segmentImage(file: File): Promise<SegmentResponse> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${getApiBase()}/segment`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error(`Segmentation failed: ${res.status}`);
  return res.json();
}

export function isCorsLikeError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /failed to fetch|network|cors/i.test(msg);
}
