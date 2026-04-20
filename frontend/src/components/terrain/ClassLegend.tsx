import { TERRAIN_CLASSES, ClassGroup } from "@/lib/terrain-classes";

const GROUP_META: Record<ClassGroup, { label: string; border: string; bg: string }> = {
  safe: { label: "Safe", border: "border-success/30", bg: "bg-success/5" },
  moderate: { label: "Moderate", border: "border-warning/30", bg: "bg-warning/5" },
  hazardous: { label: "Hazardous", border: "border-danger/30", bg: "bg-danger/5" },
};

export function ClassLegend() {
  const groups: ClassGroup[] = ["safe", "moderate", "hazardous"];

  return (
    <div className="glass card-lift rounded-xl p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold">16 Terrain Classes Reference</h3>
        <span className="text-[11px] font-mono text-muted-foreground">REFERENCE</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {groups.map((g) => {
          const items = TERRAIN_CLASSES.filter((c) => c.group === g);
          const meta = GROUP_META[g];
          return (
            <div key={g} className={`rounded-lg border ${meta.border} ${meta.bg} p-4`}>
              <p className="text-[10px] font-mono font-semibold tracking-widest text-muted-foreground mb-3">
                {meta.label.toUpperCase()} · {items.length}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {items.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-background/40 border border-border/60"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.color, boxShadow: `0 0 6px ${c.color}80` }}
                    />
                    <span className="text-xs font-medium truncate">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
