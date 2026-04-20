import { useEffect, useState } from "react";
import { colorForClass } from "@/lib/terrain-classes";

interface DetectedClassesProps {
  classes: Record<string, number> | null;
}

export function DetectedClasses({ classes }: DetectedClassesProps) {
  const entries = classes
    ? Object.entries(classes).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="glass card-lift rounded-xl p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold">Detected Classes</h3>
        <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-mono text-primary">
          {entries.length} classes found
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Run analysis to detect terrain classes
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(([name, pct], i) => (
            <ClassRow key={name} name={name} pct={pct} delay={i * 60} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClassRow({ name, pct, delay }: { name: string; pct: number; delay: number }) {
  const [width, setWidth] = useState(0);
  const [shown, setShown] = useState(0);
  const color = colorForClass(name);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 80 + delay);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start - delay) / 800);
      if (p > 0) {
        const ease = 1 - Math.pow(1 - p, 3);
        setShown(pct * ease);
      }
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [pct, delay]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-28 min-w-28">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
        />
        <span className="text-sm font-medium capitalize truncate">{name}</span>
      </div>
      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-[800ms] ease-out"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 12px ${color}60`,
          }}
        />
      </div>
      <span className="w-14 text-right text-xs font-mono text-muted-foreground tabular-nums">
        {shown.toFixed(1)}%
      </span>
    </div>
  );
}
