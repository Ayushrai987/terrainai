import { Activity, Settings } from "lucide-react";

interface NavbarProps {
  online: boolean;
  miou: number | null;
  onSettingsClick: () => void;
}

export function Navbar({ online, miou, onSettingsClick }: NavbarProps) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 glass-strong border-b border-border/60">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-purple-blue opacity-60" />
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 20l5-9 4 6 3-4 6 7" />
              <path d="M3 20h18" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight">TerrainAI</span>
            <span className="text-[10px] font-mono text-muted-foreground -mt-0.5">v1.0</span>
          </div>
        </div>

        {/* Center: status pill */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full glass">
          <span
            className={`pulse-dot inline-block w-2 h-2 rounded-full ${
              online ? "bg-success text-success" : "bg-danger text-danger"
            }`}
          />
          <span className="text-xs font-medium">
            {online ? "Model Online" : "Model Offline"}
          </span>
        </div>

        {/* Right: badges */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-xs font-mono">
            <Activity className="w-3 h-3 text-primary" />
            SegFormer-B2
          </span>
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-xs font-mono text-primary">
            mIoU {miou !== null ? `${(miou < 1 ? miou * 100 : miou).toFixed(1)}%` : "63.72%"}
          </span>
          <button
            onClick={onSettingsClick}
            className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:border-primary/40 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}
