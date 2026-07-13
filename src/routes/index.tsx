import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Sparkles, Brain, Github, Linkedin, Mail } from "lucide-react";
import { UploadZone } from "@/components/upload-zone";
import { AnalysisDashboard } from "@/components/analysis-dashboard";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { parseFile } from "@/lib/parser";
import { analyze, type AnalysisResult } from "@/lib/analyzer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResumeIQ — ATS Score" },
      { name: "description", content: "See how your resume scores against any job — and what to fix." },
      { property: "og:title", content: "ResumeIQ — ATS Score" },
      { property: "og:description", content: "See how your resume scores against any job — and what to fix." },
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
        setError("ResumeIQ:ATS Compatibility & Skill Gap Analysis");
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
        <div className="absolute inset-0 bg-grid opacity-40" />
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
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">ResumeIQ</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-12 sm:pt-16">
        <section className="text-center">
          <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            <span className="text-gradient"> ResumeIQ: ATS Compatibility </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Upload it, paste the job description, and find out in seconds — with honest feedback, not vague tips.
          </p>
        </section>

        {/* Upload card */}
        <section className="mx-auto mt-10 max-w-3xl">
          <div className="rounded-2xl border border-border glass p-6 shadow-[var(--shadow-elegant)] sm:p-8">
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block text-sm font-medium">Your resume</Label>
                <UploadZone file={file} onFile={setFile} disabled={loading} />
              </div>

              <div>
                <Label htmlFor="jd" className="mb-2 block text-sm font-medium">
                  Job description <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="jd"
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the role you're applying for — we'll match keywords and spot the gaps."
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
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Reading your resume…</>
                ) : (
                  <><Sparkles className="mr-2 h-5 w-5" /> Check my resume</>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* Results */}
        {result && (
          <section id="results" className="mt-16">
            <AnalysisDashboard result={result} fileName={fileName} resumeText={resumeText} />
          </section>
        )}

        {!result && (
          <p className="mx-auto mt-10 max-w-md text-center text-xs text-muted-foreground">
            Everything runs in your browser. Nothing is uploaded, stored, or shared.
          </p>
        )}
      </main>

      <footer className="border-t border-border/60 bg-card/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <div className="text-sm font-semibold text-foreground">ResumeIQ</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Built for job seekers who deserve honest, actionable feedback.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <a
              href="https://www.linkedin.com/in/vijay-rodge"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-[var(--shadow-glow)]"
              aria-label="LinkedIn profile"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://github.com/vijay-rodge"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-[var(--shadow-glow)]"
              aria-label="GitHub profile"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
  href="mailto:vijayrodge116@gmail.com?subject=Contact from resume-ats-checker&body=Hello Vijay,"
  className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-[var(--shadow-glow)]"
  aria-label="Email contact"
>
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
