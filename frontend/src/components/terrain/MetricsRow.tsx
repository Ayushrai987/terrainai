import { CountUp } from "./CountUp";
import { Zap } from "lucide-react";
import type { SegmentResponse } from "@/lib/api";

interface MetricsRowProps {
  result: SegmentResponse | null;
}

export function MetricsRow({ result }: MetricsRowProps) {
  const trav = result?.traversability ?? 0;
  const inference = result?.inference_ms ?? 0;
  const miou = result ? (result.miou < 1 ? result.miou * 100 : result.miou) : 63.72;
  const best = result?.best_path ?? "center_zone";
  const zones = result?.zone_scores ?? { left: 0, center: 0, right: 0 };

  const status =
    trav >= 7 ? { text: "SAFE TO TRAVERSE", color: "text-success" }
    : trav >= 4 ? { text: "PROCEED WITH CAUTION", color: "text-warning" }
    : trav > 0 ? { text: "HAZARDOUS TERRAIN", color: "text-danger" }
    : { text: "AWAITING DATA", color: "text-muted-foreground" };

  const traversabilityPct = Math.min(100, (trav / 10) * 100);
  const traversabilityColor =
    trav >= 7 ? "bg-success" : trav >= 4 ? "bg-warning" : trav > 0 ? "bg-danger" : "bg-muted";

  const ZoneBtn = ({ id, label }: { id: "left_zone" | "center_zone" | "right_zone"; label: string }) => {
    const active = best === id;
    return (
      <button
        className={`flex-1 py-2 rounded-md text-[10px] font-mono font-semibold tracking-wider transition-all
          ${active
            ? "bg-gradient-primary text-primary-foreground shadow-glow"
            : "bg-secondary text-muted-foreground"}`}
      >
        {label}
      </button>
    );
  };

  const stagger = (i: number) => ({ animationDelay: `${120 + i * 50}ms` });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* TRAVERSABILITY */}
      <div className="glass card-lift rounded-xl p-5 animate-fade-in-up" style={stagger(0)}>
        <p className="text-[10px] font-mono font-semibold text-muted-foreground tracking-widest mb-3">TRAVERSABILITY</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold font-mono">
            {result ? <CountUp value={trav} /> : "—"}
          </span>
          <span className="text-base text-muted-foreground font-mono">/10</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 mb-3">Traversability Score</p>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className={`h-full ${traversabilityColor} transition-all duration-700 ease-out`}
            style={{ width: `${traversabilityPct}%` }}
          />
        </div>
        <p className={`mt-2 text-[10px] font-mono font-semibold tracking-wider ${status.color}`}>
          {status.text}
        </p>
      </div>

      {/* OPTIMAL PATH */}
      <div className="glass card-lift rounded-xl p-5 animate-fade-in-up" style={stagger(1)}>
        <p className="text-[10px] font-mono font-semibold text-muted-foreground tracking-widest mb-3">OPTIMAL PATH</p>
        <div className="flex gap-1.5 mb-3">
          <ZoneBtn id="left_zone" label="LEFT" />
          <ZoneBtn id="center_zone" label="CENTER" />
          <ZoneBtn id="right_zone" label="RIGHT" />
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5" /><path d="M5 12l7-7 7 7" />
          </svg>
          <span className="text-xs font-medium">
            {best.replace("_zone", "").toUpperCase()} recommended
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground font-mono">
          L:{zones.left} · C:{zones.center} · R:{zones.right}
        </p>
      </div>

      {/* SPEED */}
      <div className="glass card-lift rounded-xl p-5 animate-fade-in-up" style={stagger(2)}>
        <p className="text-[10px] font-mono font-semibold text-muted-foreground tracking-widest mb-3">SPEED</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold font-mono">
            {result ? Math.round(inference) : "—"}
          </span>
          <span className="text-base text-muted-foreground font-mono">ms</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 mb-3">Inference Time</p>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-info/10 border border-info/20 text-[10px] font-mono text-info">
          <Zap className="w-3 h-3" />
          GPU ACCELERATED
        </span>
      </div>

      {/* MODEL */}
      <div className="glass card-lift rounded-xl p-5 animate-fade-in-up" style={stagger(3)}>
        <p className="text-[10px] font-mono font-semibold text-muted-foreground tracking-widest mb-3">MODEL</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold font-mono bg-gradient-primary bg-clip-text text-transparent">
            {miou.toFixed(1)}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 mb-3">mIoU Score</p>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-mono">SegFormer-B2</span>
          <span className="text-[10px] font-mono text-muted-foreground">27.4M params</span>
        </div>
      </div>
    </div>
  );
}
