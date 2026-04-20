import { useEffect, useRef } from "react";
import type { SegmentResponse } from "@/lib/api";

interface ZoneAnalysisProps {
  result: SegmentResponse | null;
  history: { url: string; trav: number }[];
  onSelectHistory: (i: number) => void;
}

const AXES = ["Traversable", "Vegetation", "Hazards", "Obstacles", "Sky", "Ground"];

function computeAxes(result: SegmentResponse | null): number[] {
  if (!result) return AXES.map(() => 0);
  const c: Record<string, number> = {};
  // Normalize keys to lowercase for case-insensitive lookup
  for (const [k, v] of Object.entries(result.classes)) {
    c[k.toLowerCase()] = (c[k.toLowerCase()] ?? 0) + (v as number);
  }
  const get = (...keys: string[]) =>
    keys.reduce((s, k) => s + (c[k.toLowerCase()] ?? 0), 0);

  const traversable = get("road_path", "pavement") + get("dirt_soil", "dirt") + get("grass") * 0.7;
  const vegetation = get("trees", "bushes", "grass");
  const hazards = get("water", "mud_puddle", "mud", "rocks", "cliff");
  const obstacles = get("person", "vehicles", "vehicle", "buildings", "structures");
  const sky = get("sky");
  const ground = get("sand_gravel", "sand", "gravel", "dirt_soil", "dirt");

  return [
    Math.min(100, Math.max(traversable, result.traversability * 10)),
    Math.min(100, vegetation),
    Math.min(100, hazards),
    Math.min(100, obstacles),
    Math.min(100, sky),
    Math.min(100, ground),
  ];
}

export function ZoneAnalysis({ result, history, onSelectHistory }: ZoneAnalysisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const values = computeAxes(result);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radius = 100;
    const n = AXES.length;

    let frame = 0;
    let raf = 0;
    const animate = () => {
      frame = Math.min(60, frame + 2);
      const t = frame / 60;
      ctx.clearRect(0, 0, size, size);

      // Grid rings
      for (let r = 1; r <= 4; r++) {
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(a) * (radius * r / 4);
          const y = cy + Math.sin(a) * (radius * r / 4);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Axes
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.stroke();
      }

      // Data polygon
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const v = (values[i] / 100) * radius * t;
        const x = cx + Math.cos(a) * v;
        const y = cy + Math.sin(a) * v;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, "rgba(99,102,241,0.45)");
      grad.addColorStop(1, "rgba(56,189,248,0.45)");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "rgba(99,102,241,0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Axis labels
      ctx.font = "500 10px Inter, sans-serif";
      ctx.fillStyle = "rgba(148,163,184,0.9)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * (radius + 16);
        const y = cy + Math.sin(a) * (radius + 16);
        ctx.fillText(AXES[i], x, y);
      }

      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [values.join(",")]);

  return (
    <div className="glass card-lift rounded-xl p-6 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
      <h3 className="text-base font-semibold mb-2">Zone Analysis</h3>
      <p className="text-xs text-muted-foreground mb-3">Multi-dimensional terrain breakdown</p>
      <div className="flex items-center justify-center">
        <canvas ref={canvasRef} />
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-[11px] font-mono font-semibold text-muted-foreground tracking-widest mb-3">ANALYSIS HISTORY</p>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No previous analyses</p>
        ) : (
          <div className="flex gap-2">
            {history.slice(0, 5).map((h, i) => (
              <button
                key={i}
                onClick={() => onSelectHistory(i)}
                className="group relative w-14 h-14 rounded-lg overflow-hidden border border-border hover:border-primary/60 transition-all"
              >
                <img src={h.url} alt={`History ${i}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-background/80 backdrop-blur-sm text-[9px] font-mono text-center py-0.5">
                  {h.trav.toFixed(1)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
