export function Hero() {
  return (
    <section className="text-center pt-28 pb-10 animate-fade-in-up">
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
        Understand Any Terrain
      </h1>
      <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
        Real-time semantic segmentation for off-road autonomous navigation
      </p>
      <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
        <span className="px-4 py-1.5 rounded-full glass text-sm font-medium">
          <span className="font-mono text-primary">16</span> Terrain Classes
        </span>
        <span className="px-4 py-1.5 rounded-full glass text-sm font-medium">
          <span className="font-mono text-primary">63.72%</span> mIoU
        </span>
      </div>
    </section>
  );
}
