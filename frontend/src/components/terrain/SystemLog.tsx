import { useEffect, useRef } from "react";

export type LogLevel = "success" | "info" | "warning" | "error";
export interface LogEntry {
  time: string;
  level: LogLevel;
  message: string;
}

const COLORS: Record<LogLevel, string> = {
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  error: "text-danger",
};

const TAGS: Record<LogLevel, string> = {
  success: "[OK]",
  info: "[INFO]",
  warning: "[WARN]",
  error: "[ERR]",
};

export function SystemLog({ entries }: { entries: LogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [entries]);

  return (
    <div className="glass card-lift rounded-xl p-6 animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">System Log</h3>
        <span className="text-[11px] font-mono text-muted-foreground">{entries.length} entries</span>
      </div>
      <div
        ref={ref}
        className="rounded-lg border border-border bg-[#080810] p-4 max-h-[150px] overflow-y-auto font-mono text-[11px] leading-relaxed"
      >
        {entries.length === 0 ? (
          <p className="text-muted-foreground italic">System ready. No events.</p>
        ) : (
          entries.map((e, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-muted-foreground/60">{e.time}</span>
              <span className={`${COLORS[e.level]} font-semibold w-12`}>{TAGS[e.level]}</span>
              <span className="text-foreground/80">{e.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
