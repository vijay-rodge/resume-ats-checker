import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Sparkles, ShieldCheck, Zap, Brain } from "lucide-react";
import { UploadZone } from "@/components/upload-zone";
import { AnalysisDashboard } from "@/components/analysis-dashboard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { parseFile } from "@/lib/parser";
import { analyze, type AnalysisResult } from "@/lib/analyzer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Resume Analyzer — ATS Score & Skill Gap Intelligence" },
      {
        name: "description",
        content:
          "Get an explainable ATS score, keyword match analysis, and skill-gap intelligence for your resume against any job description.",
      },
      { property: "og:title", content: "Resume Analyzer — ATS Score & Skill Gap Intelligence" },
      {
        property: "og:description",
        content:
          "Deterministic resume scoring with section-by-section feedback, keyword matching, and rewrite suggestions.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");

  async function runAnalysis() {
    if (!file) {
      setError("Please upload a resume first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const parsed = await parseFile(file);
      if (parsed.text.trim().length < 50) {
        setError("Resume appears empty or unreadable. Try a text-based PDF or DOCX.");
        setLoading(false);
        return;
      }
      const r = analyze({ text: parsed.text, jd, fileWarnings: parsed.warnings });
      setResult(r);
      setResumeText(parsed.text);
      setFileName(parsed.fileName);
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div
          className="absolute inset-x-0 top-0 h-[600px]"
          style={{ background: "var(--gradient-glow)" }}
        />
      </div>

      {/* Nav */}
      <header className="border-b border-border/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "var(--gradient-hero)" }}>
              <Brain className="h-5 w-5 text-background" />
            </div>
            <span className="text-lg font-bold tracking-tight">ResumeIQ</span>
          </div>
          <div className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <span>Deterministic scoring</span>
            <span>·</span>
            <span>Explainable AI</span>
            <span>·</span>
            <span>100% private</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <section className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" />
            ATS simulator + skill-gap intelligence
          </div>
          <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Stop guessing why your resume <br className="hidden sm:block" />
            gets <span className="text-gradient">silently rejected</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Get a transparent ATS score with the exact reasoning behind every number.
            Match against any job description, surface skill gaps, and rewrite weak bullets — instantly.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> No data leaves your browser</span>
            <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" /> Instant analysis</span>
            <span className="inline-flex items-center gap-1.5"><Brain className="h-4 w-4 text-primary" /> Explainable scores</span>
          </div>
        </section>

        {/* Upload card */}
        <section className="mx-auto mt-12 max-w-3xl">
          <div className="rounded-2xl border border-border glass p-6 shadow-[var(--shadow-elegant)] sm:p-8">
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block text-sm font-medium">1. Upload your resume</Label>
                <UploadZone file={file} onFile={setFile} disabled={loading} />
              </div>

              <div>
                <Label htmlFor="jd" className="mb-2 block text-sm font-medium">
                  2. Paste the job description <span className="text-muted-foreground">(optional but recommended)</span>
                </Label>
                <Textarea
                  id="jd"
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the full job description here for keyword matching and skill-gap analysis..."
                  className="min-h-[140px] resize-none bg-background/50 font-mono text-sm"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                onClick={runAnalysis}
                disabled={!file || loading}
                className="w-full text-base font-semibold h-12"
                style={{ background: "var(--gradient-hero)", color: "var(--primary-foreground)" }}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles className="mr-2 h-5 w-5" /> Analyze Resume</>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* Results */}
        {result && (
          <section id="results" className="mt-20">
            <AnalysisDashboard result={result} fileName={fileName} resumeText={resumeText} />
          </section>
        )}

        {!result && (
          <section className="mx-auto mt-24 grid max-w-5xl gap-4 sm:grid-cols-3">
            {[
              { icon: Brain, title: "Deterministic scoring", desc: "Five weighted components with clear formulas — no black box." },
              { icon: Sparkles, title: "Skill-gap intelligence", desc: "Curated taxonomy of 100+ skills mapped against any JD." },
              { icon: Zap, title: "Actionable rewrites", desc: "Specific bullet rewrites with measurable templates." },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card/40 p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-3 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </section>
        )}
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        ResumeIQ · Runs entirely in your browser · No accounts, no tracking
      </footer>
    </div>
  );
}
