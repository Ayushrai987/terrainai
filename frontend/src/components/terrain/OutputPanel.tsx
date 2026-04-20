import { useState, useRef, MouseEvent } from "react";
import { Map, Download } from "lucide-react";

type View = "OVERLAY" | "MASK" | "SPLIT";

interface OutputPanelProps {
  loading: boolean;
  overlayB64: string | null;
  maskB64: string | null;
  originalUrl: string | null;
}

export function OutputPanel({ loading, overlayB64, maskB64, originalUrl }: OutputPanelProps) {
  const [view, setView] = useState<View>("OVERLAY");
  const [splitPos, setSplitPos] = useState(50);
  const splitRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const overlaySrc = overlayB64 ? `data:image/png;base64,${overlayB64}` : null;
  const maskSrc = maskB64 ? `data:image/png;base64,${maskB64}` : null;
  const hasResult = !!overlaySrc;

  const handleSplitMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!dragging.current || !splitRef.current) return;
    const rect = splitRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPos(Math.max(5, Math.min(95, pct)));
  };

  const handleDownload = () => {
    if (!overlaySrc) return;
    const a = document.createElement("a");
    a.href = view === "MASK" && maskSrc ? maskSrc : overlaySrc;
    a.download = `terrain-${view.toLowerCase()}.png`;
    a.click();
  };

  return (
    <div className="glass card-lift gradient-border-green-blue rounded-xl p-6 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: "60ms" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-success" />
          <h2 className="text-base font-semibold">Segmentation Output</h2>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary">
          {(["OVERLAY", "MASK", "SPLIT"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded-md text-[11px] font-mono font-medium transition-all
                ${view === v
                  ? "bg-gradient-primary text-primary-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground"}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={splitRef}
        onMouseMove={handleSplitMove}
        onMouseUp={() => (dragging.current = false)}
        onMouseLeave={() => (dragging.current = false)}
        className="relative h-[350px] rounded-xl bg-[#080810] border border-border overflow-hidden flex items-center justify-center"
      >
        {loading && <div className="scan-sweep" />}

        {!hasResult && !loading && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Map className="w-8 h-8 opacity-40" />
            <p className="text-sm">Awaiting Analysis</p>
          </div>
        )}

        {loading && !hasResult && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <p className="text-xs text-muted-foreground mt-3 font-mono">PROCESSING...</p>
            </div>
          </div>
        )}

        {hasResult && view === "OVERLAY" && (
          <img src={overlaySrc!} alt="Overlay" className="w-full h-full object-cover animate-fade-in" />
        )}
        {hasResult && view === "MASK" && maskSrc && (
          <img src={maskSrc} alt="Mask" className="w-full h-full object-cover animate-fade-in" />
        )}
        {hasResult && view === "SPLIT" && originalUrl && (
          <>
            <img src={originalUrl} alt="Original" className="absolute inset-0 w-full h-full object-cover" />
            <div
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${splitPos}%` }}
            >
              <img
                src={overlaySrc!}
                alt="Overlay"
                className="absolute inset-0 h-full object-cover"
                style={{ width: `${100 / (splitPos / 100)}%`, maxWidth: "none" }}
              />
            </div>
            <div
              onMouseDown={() => (dragging.current = true)}
              className="absolute inset-y-0 w-1 bg-primary cursor-ew-resize shadow-glow"
              style={{ left: `${splitPos}%`, transform: "translateX(-50%)" }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary border-2 border-background flex items-center justify-center text-primary-foreground text-xs">
                ⇔
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleDownload}
          disabled={!hasResult}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
      </div>
    </div>
  );
}
