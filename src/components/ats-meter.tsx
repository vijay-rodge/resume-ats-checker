interface AtsMeterProps {
  score: number;
}

function band(score: number) {
  if (score >= 80) return { label: "Strong match", tone: "oklch(0.72 0.18 155)", note: "Likely to pass most ATS filters." };
  if (score >= 60) return { label: "Decent — needs polish", tone: "oklch(0.78 0.16 200)", note: "A few tweaks will push you over the line." };
  if (score >= 40) return { label: "Weak — work to do", tone: "oklch(0.78 0.17 75)", note: "Several gaps an ATS will penalize." };
  return { label: "At risk", tone: "oklch(0.65 0.23 25)", note: "Likely to be filtered out — fix the basics first." };
}

export function AtsMeter({ score }: AtsMeterProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const b = band(clamped);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">ATS readiness</span>
        <span className="text-sm font-semibold" style={{ color: b.tone }}>{clamped}%</span>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${clamped}%`,
            background: "linear-gradient(90deg, oklch(0.65 0.23 25) 0%, oklch(0.78 0.17 75) 35%, oklch(0.78 0.16 200) 65%, oklch(0.72 0.18 155) 100%)",
            boxShadow: `0 0 12px ${b.tone}`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 flex">
          {[25, 50, 75].map((p) => (
            <div key={p} className="absolute top-0 h-full w-px bg-background/60" style={{ left: `${p}%` }} />
          ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: b.tone }} />
        <span className="text-sm font-medium text-foreground">{b.label}</span>
        <span className="text-sm text-muted-foreground">— {b.note}</span>
      </div>
    </div>
  );
}