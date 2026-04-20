import { useCallback, useEffect, useState } from "react";
import { Navbar } from "@/components/terrain/Navbar";
import { Hero } from "@/components/terrain/Hero";
import { InputPanel } from "@/components/terrain/InputPanel";
import { OutputPanel } from "@/components/terrain/OutputPanel";
import { MetricsRow } from "@/components/terrain/MetricsRow";
import { DetectedClasses } from "@/components/terrain/DetectedClasses";
import { ZoneAnalysis } from "@/components/terrain/ZoneAnalysis";
import { ClassLegend } from "@/components/terrain/ClassLegend";
import { SystemLog, LogEntry, LogLevel } from "@/components/terrain/SystemLog";
import { SettingsDialog } from "@/components/terrain/SettingsDialog";
import { checkHealth, segmentImage, isCorsLikeError, SegmentResponse } from "@/lib/api";
import { toast } from "@/components/ui/sonner";

interface HistoryItem {
  url: string;
  trav: number;
  result: SegmentResponse;
  file: File;
}

const TerrainAI = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SegmentResponse | null>(null);
  const [online, setOnline] = useState(false);
  const [miou, setMiou] = useState<number | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const log = useCallback((level: LogLevel, message: string) => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev.slice(-49), { time, level, message }]);
  }, []);

  const pingHealth = useCallback(async () => {
    try {
      const h = await checkHealth();
      setOnline(h.status?.toLowerCase() === "ok" || true);
      setMiou(h.miou ?? null);
      log("success", `Connected to backend · device=${h.device} · mIoU=${(h.miou * 100).toFixed(1)}%`);
    } catch (err) {
      setOnline(false);
      if (isCorsLikeError(err)) {
        log("warning", "Backend unreachable. Check API_BASE in settings or CORS config.");
      } else {
        log("error", `Health check failed: ${(err as Error).message}`);
      }
    }
  }, [log]);

  useEffect(() => {
    log("info", "TerrainAI initialised. SegFormer-B2 model registered.");
    pingHealth();
  }, [log, pingHealth]);

  const handleFile = (f: File | null) => {
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
      log("info", `Image loaded: ${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleAnalyse = useCallback(async () => {
    if (!file || loading) return;
    setLoading(true);
    log("info", `Submitting ${file.name} for segmentation...`);
    const t0 = performance.now();
    try {
      const r = await segmentImage(file);
      const dt = performance.now() - t0;
      setResult(r);
      log("success", `Segmentation complete in ${dt.toFixed(0)}ms · traversability=${r.traversability.toFixed(1)} · path=${r.best_path}`);
      toast.success("Analysis complete", {
        description: `Traversability ${r.traversability.toFixed(1)}/10 · ${r.inference_ms}ms`,
      });
      if (previewUrl) {
        setHistory((prev) => [
          { url: previewUrl, trav: r.traversability, result: r, file },
          ...prev.filter((h) => h.url !== previewUrl),
        ].slice(0, 5));
      }
    } catch (err) {
      const msg = (err as Error).message;
      if (isCorsLikeError(err)) {
        log("error", "Network/CORS error. Verify backend at API_BASE allows browser requests.");
        toast.error("Network error", {
          description: "Backend unreachable. Open settings to update API_BASE.",
        });
      } else {
        log("error", `Segmentation failed: ${msg}`);
        toast.error("Segmentation failed", { description: msg });
      }
    } finally {
      setLoading(false);
    }
  }, [file, loading, log, previewUrl]);

  // Spacebar shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        handleAnalyse();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleAnalyse]);

  const restoreHistory = (i: number) => {
    const h = history[i];
    if (!h) return;
    setResult(h.result);
    setFile(h.file);
    setPreviewUrl(h.url);
    log("info", `Restored analysis from history (#${i + 1})`);
  };

  return (
    <div className="min-h-screen text-foreground">
      <Navbar online={online} miou={miou} onSettingsClick={() => setSettingsOpen(true)} />

      <main className="max-w-[1400px] mx-auto px-6 pb-16">
        <Hero />

        {/* Workspace 55/45 */}
        <section className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-5 mb-6">
          <InputPanel
            file={file}
            previewUrl={previewUrl}
            loading={loading}
            onFile={handleFile}
            onAnalyse={handleAnalyse}
          />
          <OutputPanel
            loading={loading}
            overlayB64={result?.overlay_b64 ?? null}
            maskB64={result?.mask_b64 ?? null}
            originalUrl={previewUrl}
          />
        </section>

        {/* Metrics */}
        <section className="mb-6">
          <MetricsRow result={result} />
        </section>

        {/* Analysis */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <DetectedClasses classes={result?.classes ?? null} />
          <ZoneAnalysis
            result={result}
            history={history}
            onSelectHistory={restoreHistory}
          />
        </section>

        {/* Legend */}
        <section className="mb-6">
          <ClassLegend />
        </section>

        {/* Log */}
        <section>
          <SystemLog entries={logs} />
        </section>
      </main>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSaved={pingHealth}
      />
    </div>
  );
};

export default TerrainAI;
