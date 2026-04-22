import { useMemo } from "react";
import {
  CheckCircle2, AlertTriangle, XCircle, Sparkles, Target, FileSearch,
  TrendingUp, Lightbulb, ListChecks, Search,
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import type { AnalysisResult, ScoreComponent } from "@/lib/analyzer";
import { ScoreRing } from "./score-ring";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  result: AnalysisResult;
  fileName: string;
  resumeText: string;
}

function scoreTone(score: number) {
  if (score >= 80) return "text-[oklch(0.72_0.18_155)]";
  if (score >= 60) return "text-primary";
  if (score >= 40) return "text-[oklch(0.78_0.17_75)]";
  return "text-destructive";
}

function scoreFill(score: number) {
  if (score >= 80) return "oklch(0.72 0.18 155)";
  if (score >= 60) return "oklch(0.78 0.16 200)";
  if (score >= 40) return "oklch(0.78 0.17 75)";
  return "oklch(0.65 0.23 25)";
}

function ComponentCard({ c }: { c: ScoreComponent }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{c.label}</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={cn("text-3xl font-bold tabular-nums", scoreTone(c.score))}>{c.score}</span>
            <span className="text-xs text-muted-foreground">/ 100 · weight {Math.round(c.weight * 100)}%</span>
          </div>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${c.score}%`, background: scoreFill(c.score) }}
        />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{c.reason}</p>
      {c.evidence.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {c.evidence.map((e, i) => (
            <span key={i} className="rounded-md bg-muted/70 px-2 py-1 text-[11px] text-foreground/80">
              {e}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function HighlightedResume({ text, matched, missing }: {
  text: string;
  matched: string[];
  missing: string[];
}) {
  const html = useMemo(() => {
    if (!text) return "";
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const matchSet = matched.slice(0, 30);
    for (const kw of matchSet) {
      const safe = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      escaped = escaped.replace(
        new RegExp(`(\\b${safe}\\b)`, "gi"),
        `<mark class="bg-primary/25 text-primary-foreground rounded px-0.5">$1</mark>`,
      );
    }
    return escaped.replace(/\n/g, "<br/>");
  }, [text, matched]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-primary/40" /> Matched JD keywords
        </span>
        {missing.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-destructive/40" /> Missing: {missing.slice(0, 5).join(", ")}{missing.length > 5 ? "…" : ""}
          </span>
        )}
      </div>
      <div
        className="max-h-[480px] overflow-auto rounded-lg border border-border bg-background/40 p-4 font-mono text-xs leading-relaxed text-foreground/90"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export function AnalysisDashboard({ result, fileName, resumeText }: Props) {
  const chartData = result.components.map((c) => ({
    name: c.label.split(" ")[0],
    score: c.score,
    fill: scoreFill(c.score),
  }));

  return (
    <div className="space-y-8">
      {/* Hero score */}
      <div className="relative overflow-hidden rounded-2xl border border-border glass p-8">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
          <ScoreRing score={result.overallScore} label="ATS Score" />
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Analyzing</div>
            <h2 className="mt-1 text-2xl font-bold text-foreground">{fileName}</h2>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              Deterministic, explainable scoring across 5 weighted dimensions. Every score below
              shows its reasoning and the exact evidence pulled from your resume.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <div className="rounded-md bg-muted/60 px-2.5 py-1.5">
                <span className="text-muted-foreground">Words:</span>{" "}
                <span className="font-semibold text-foreground">{result.meta.wordCount}</span>
              </div>
              <div className="rounded-md bg-muted/60 px-2.5 py-1.5">
                <span className="text-muted-foreground">Bullets:</span>{" "}
                <span className="font-semibold text-foreground">{result.meta.bullets}</span>
              </div>
              <div className="rounded-md bg-muted/60 px-2.5 py-1.5">
                <span className="text-muted-foreground">Avg / bullet:</span>{" "}
                <span className="font-semibold text-foreground">{result.meta.avgWordsPerBullet} words</span>
              </div>
              <div className="rounded-md bg-muted/60 px-2.5 py-1.5">
                <span className="text-muted-foreground">Keyword density:</span>{" "}
                <span className="font-semibold text-foreground">{result.keywords.density}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component breakdown */}
      <section>
        <SectionHeader icon={<Target className="h-5 w-5" />} title="Score Breakdown" subtitle="5 weighted components, each with reasoning and evidence" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {result.components.map((c) => <ComponentCard key={c.key} c={c} />)}
        </div>
        <div className="mt-6 rounded-xl border border-border bg-card/60 p-5">
          <div className="mb-4 text-sm font-medium text-muted-foreground">Component scores</div>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="oklch(0.7 0.03 260)" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="oklch(0.7 0.03 260)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.22 0.025 262)",
                    border: "1px solid oklch(0.32 0.03 263)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Keyword + Skill gap */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card/60 p-6">
          <SectionHeader icon={<Search className="h-5 w-5" />} title="Keyword Match" subtitle={result.keywords.totalJdKeywords > 0 ? `${result.keywords.matched.length} of ${result.keywords.totalJdKeywords} JD keywords matched` : "Paste a job description for calibrated matching"} compact />
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Matched ({result.keywords.matched.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.matched.length === 0 && (
                  <span className="text-sm text-muted-foreground">No matches yet — add a JD.</span>
                )}
                {result.keywords.matched.slice(0, 24).map((m) => (
                  <Badge key={m.keyword} className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20">
                    {m.keyword} <span className="ml-1 text-[10px] opacity-70">×{m.count}</span>
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Missing ({result.keywords.missing.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.missing.length === 0 && (
                  <span className="text-sm text-muted-foreground">Nothing critical missing.</span>
                )}
                {result.keywords.missing.slice(0, 24).map((k) => (
                  <Badge key={k} className="border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20">
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/60 p-6">
          <SectionHeader icon={<Sparkles className="h-5 w-5" />} title="Skill Gap" subtitle="Required vs present, ranked by importance" compact />
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Present ({result.skillGap.present.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {result.skillGap.present.length === 0 && (
                  <span className="text-sm text-muted-foreground">No skills detected — add a Skills section.</span>
                )}
                {result.skillGap.present.slice(0, 30).map((s) => (
                  <Badge key={s} className="bg-[oklch(0.72_0.18_155)]/15 text-[oklch(0.72_0.18_155)] border border-[oklch(0.72_0.18_155)]/30">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Recommended to learn</div>
              <div className="space-y-1.5">
                {result.skillGap.recommended.length === 0 && (
                  <span className="text-sm text-muted-foreground">No gaps detected.</span>
                )}
                {result.skillGap.recommended.slice(0, 8).map((r) => (
                  <div key={r.skill} className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-sm">
                    <span className="font-medium text-foreground">{r.skill}</span>
                    <span className="text-xs text-muted-foreground">priority {r.importance}/10</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section evaluation */}
      <section>
        <SectionHeader icon={<ListChecks className="h-5 w-5" />} title="Section-by-Section Evaluation" subtitle="Each resume section scored independently" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {result.sections.map((s) => (
            <div key={s.name} className="rounded-xl border border-border bg-card/60 p-5">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">{s.name}</h4>
                <span className={cn("text-2xl font-bold tabular-nums", scoreTone(s.score))}>{s.score}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                {s.present ? (
                  <span className="inline-flex items-center gap-1 text-[oklch(0.72_0.18_155)]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Detected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-destructive">
                    <XCircle className="h-3.5 w-3.5" /> Not detected
                  </span>
                )}
              </div>
              {s.issues.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-foreground/80">
                  {s.issues.map((i, idx) => (
                    <li key={idx} className="flex gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[oklch(0.78_0.17_75)]" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.suggestions.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {s.suggestions.map((sg, idx) => (
                    <li key={idx} className="flex gap-2">
                      <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                      <span>{sg}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Experience analysis */}
      <section>
        <SectionHeader icon={<TrendingUp className="h-5 w-5" />} title="Experience Analysis" subtitle="Action verbs, measurable impact, weak phrasing" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card/60 p-5">
            <div className="text-sm font-medium text-muted-foreground">Action verbs detected</div>
            <div className="mt-1 text-3xl font-bold text-foreground">{result.experience.actionVerbCount}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Strong resumes lead bullets with verbs like <em>built, led, reduced, optimized</em>.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-5">
            <div className="text-sm font-medium text-muted-foreground">Quantified achievements</div>
            <div className="mt-1 text-3xl font-bold text-foreground">{result.experience.measurableAchievements.length}</div>
            <p className="mt-2 text-sm text-muted-foreground">Numbers, percentages, and scale signal real impact.</p>
          </div>
        </div>

        {result.experience.measurableAchievements.length > 0 && (
          <div className="mt-4 rounded-xl border border-border bg-card/60 p-5">
            <div className="mb-3 text-sm font-medium text-foreground">Strong, quantified bullets</div>
            <ul className="space-y-2">
              {result.experience.measurableAchievements.map((a, i) => (
                <li key={i} className="rounded-md border border-[oklch(0.72_0.18_155)]/30 bg-[oklch(0.72_0.18_155)]/5 p-3 text-sm text-foreground/90">
                  <CheckCircle2 className="mr-2 inline h-4 w-4 text-[oklch(0.72_0.18_155)]" />
                  {a.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.experience.rewriteSuggestions.length > 0 && (
          <div className="mt-4 rounded-xl border border-border bg-card/60 p-5">
            <div className="mb-3 text-sm font-medium text-foreground">Weak phrasing — suggested rewrites</div>
            <ul className="space-y-3">
              {result.experience.rewriteSuggestions.map((r, i) => (
                <li key={i} className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  <div className="text-foreground/80">
                    <XCircle className="mr-2 inline h-4 w-4 text-destructive" />
                    <span className="line-through opacity-70">{r.weak}</span>
                  </div>
                  <div className="mt-2 border-t border-border/50 pt-2 text-foreground">
                    <Sparkles className="mr-2 inline h-4 w-4 text-primary" />
                    <span>{r.rewrite}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Format & ATS */}
      <section>
        <SectionHeader icon={<FileSearch className="h-5 w-5" />} title="ATS Format Compatibility" subtitle="Parsing checks and structural warnings" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card/60 p-5">
            <div className="mb-3 text-sm font-medium text-foreground">Warnings</div>
            {result.format.warnings.length === 0 && (
              <p className="text-sm text-muted-foreground">No format issues detected. Nice.</p>
            )}
            <ul className="space-y-2 text-sm">
              {result.format.warnings.map((w, i) => (
                <li key={i} className="flex gap-2 text-foreground/85">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[oklch(0.78_0.17_75)]" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card/60 p-5">
            <div className="mb-3 text-sm font-medium text-foreground">Passes</div>
            <ul className="space-y-2 text-sm">
              {result.format.passes.map((p, i) => (
                <li key={i} className="flex gap-2 text-foreground/85">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[oklch(0.72_0.18_155)]" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Improvements */}
      {result.improvements.length > 0 && (
        <section>
          <SectionHeader icon={<Lightbulb className="h-5 w-5" />} title="Actionable Improvements" subtitle="Specific, context-aware fixes ranked by impact" />
          <div className="space-y-3">
            {result.improvements.slice(0, 12).map((imp, i) => (
              <div key={i} className="rounded-xl border border-border bg-card/60 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-primary">{imp.area}</div>
                <div className="mt-1 text-sm text-foreground">{imp.advice}</div>
                {imp.example && (
                  <div className="mt-2 rounded-md bg-primary/5 px-3 py-2 text-sm text-foreground/90 border border-primary/20">
                    <span className="text-xs font-medium text-primary">Example: </span>
                    {imp.example}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Resume preview */}
      <section>
        <SectionHeader icon={<FileSearch className="h-5 w-5" />} title="Resume Preview with Keyword Highlights" subtitle="Matched JD keywords highlighted in your resume text" />
        <div className="rounded-xl border border-border bg-card/60 p-5">
          <HighlightedResume
            text={resumeText}
            matched={result.keywords.matched.map((m) => m.keyword)}
            missing={result.keywords.missing}
          />
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  icon, title, subtitle, compact,
}: { icon: React.ReactNode; title: string; subtitle?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-start gap-3", compact ? "mb-0" : "mb-5")}>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}