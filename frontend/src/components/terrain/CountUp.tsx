import { useEffect, useState } from "react";

function useCountUp(target: number, duration = 600, decimals = 1) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(target * ease);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val.toFixed(decimals);
}

export function CountUp({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const v = useCountUp(value, 600, decimals);
  return <>{v}</>;
}
