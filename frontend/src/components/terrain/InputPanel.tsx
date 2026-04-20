import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { Upload, ArrowRight, Loader2, X } from "lucide-react";

interface InputPanelProps {
  file: File | null;
  previewUrl: string | null;
  loading: boolean;
  onFile: (file: File | null) => void;
  onAnalyse: () => void;
}

export function InputPanel({ file, previewUrl, loading, onFile, onAnalyse }: InputPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) onFile(f);
  };

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    onFile(f);
  };

  return (
    <div className="glass card-lift gradient-border-purple-blue rounded-xl p-6 relative overflow-hidden animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" />
          <h2 className="text-base font-semibold">Terrain Image</h2>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">INPUT</span>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative h-[350px] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 overflow-hidden flex items-center justify-center
          ${drag
            ? "border-primary bg-primary/5 shadow-glow"
            : "border-border hover:border-primary/60 hover:bg-primary/[0.03]"
          }`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Uploaded terrain" className="w-full h-full object-cover animate-fade-in" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary/10 border border-primary/20 flex items-center justify-center text-3xl">
              🏔️
            </div>
            <div>
              <p className="text-sm font-medium">Drop your terrain image here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleSelect}
        />
      </div>

      {file && (
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-xs font-mono animate-fade-in">
          <span className="truncate max-w-[240px]">{file.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onFile(null); }}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Remove file"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <button
        onClick={onAnalyse}
        disabled={!file || loading}
        className="mt-5 w-full h-12 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2
          shadow-card transition-all duration-200
          hover:shadow-glow hover:scale-[1.01]
          active:scale-[0.98]
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-card"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analysing...
          </>
        ) : (
          <>
            Analyse Terrain
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Press <kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono text-[10px] mx-0.5">Space</kbd> to analyse
      </p>
    </div>
  );
}
