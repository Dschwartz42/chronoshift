"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import GenerationProgress, { STAGES, StageStatus } from "@/components/GenerationProgress";
import { AlertCircle, Clock, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

function GenerateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";

  const [inputValue, setInputValue] = useState(query);
  const [submitted, setSubmitted] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [teaser, setTeaser] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<string, StageStatus>>({});
  const [stageDetail, setStageDetail] = useState<string>("");
  const [email, setEmail] = useState("");
  const [emailSaved, setEmailSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-submit if query param present
  useEffect(() => {
    if (query && !submitted) {
      handleSubmit(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (!jobId) return;

    // Subscribe via Supabase Realtime
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "videos", filter: `id=eq.${jobId}` },
        (payload) => {
          const row = payload.new as { status: string; stage_detail?: string; video_url?: string };
          handleStatusUpdate(row.status, row.stage_detail, row.video_url);
        }
      )
      .subscribe();

    // Fallback poll every 5s
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/job/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        handleStatusUpdate(data.status, data.stage_detail, data.video_url);
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  function handleStatusUpdate(status: string, detail?: string, videoUrl?: string) {
    const stageMap: Record<string, string> = {
      narrative: "narrative",
      scenes: "scenes",
      images: "images",
      audio: "audio",
      assembling: "video",
      complete: "video",
    };

    const newStatuses: Record<string, StageStatus> = {};
    const order = ["narrative", "scenes", "images", "audio", "video"];
    const activeStage = stageMap[status];

    for (const s of order) {
      const idx = order.indexOf(s);
      const activeIdx = order.indexOf(activeStage ?? "");
      if (status === "complete") {
        newStatuses[s] = "complete";
      } else if (idx < activeIdx) {
        newStatuses[s] = "complete";
      } else if (idx === activeIdx) {
        newStatuses[s] = "active";
      } else {
        newStatuses[s] = "pending";
      }
    }

    setStatuses(newStatuses);
    if (detail) setStageDetail(detail);

    if (status === "complete" && videoUrl) {
      if (pollRef.current) clearInterval(pollRef.current);
      router.push(`/watch/${jobId}`);
    }
    if (status === "error") {
      setError("Generation failed. Please try again.");
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }

  async function handleSubmit(prompt: string) {
    if (!prompt.trim()) return;
    setSubmitted(true);
    setError(null);
    setStatuses({ narrative: "active" });

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitted(false);
        return;
      }

      setJobId(data.jobId);
      setTeaser(data.teaser);
      setStatuses({ narrative: "complete", scenes: "active" });
    } catch {
      setError("Could not connect to the server. Please try again.");
      setSubmitted(false);
    }
  }

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !jobId) return;
    await fetch("/api/job/" + jobId + "/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setEmailSaved(true);
  }

  const completedCount = Object.values(statuses).filter((s) => s === "complete").length;
  const progressPct = Math.round((completedCount / STAGES.length) * 100);

  return (
    <div className="min-h-dvh bg-parchment">
      <Navbar />

      <div className="pt-24 pb-20 px-6 flex flex-col items-center min-h-dvh">
        {!submitted ? (
          /* Input state */
          <div className="w-full max-w-2xl mx-auto mt-16 animate-fade-in">
            <h1 className="font-serif text-3xl md:text-4xl text-charcoal text-center mb-3">
              What would you change?
            </h1>
            <p className="font-sans text-charcoal-muted text-center mb-10 text-base">
              Enter a historical &ldquo;what if&rdquo; and we&apos;ll generate a narrated documentary exploring that alternate timeline.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(inputValue);
              }}
              className="space-y-4"
            >
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What if the Library of Alexandria was never destroyed?"
                rows={3}
                className="w-full px-5 py-4 text-base font-sans text-charcoal bg-white border-2 border-border-light rounded-xl resize-none focus:outline-none focus:border-accent-red focus:shadow-[0_0_0_4px_rgba(139,26,26,0.1)] transition-all"
                aria-label="Historical what-if prompt"
              />
              {error && (
                <div className="flex items-start gap-2 text-sm text-accent-red font-sans">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="w-full py-4 bg-charcoal text-parchment font-sans font-medium text-base rounded-xl hover:bg-charcoal-soft active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Generate Documentary
              </button>
            </form>

            {/* Time estimate */}
            <div className="mt-8 flex items-center justify-center gap-2 text-sm font-sans text-charcoal-muted">
              <Clock className="w-4 h-4" />
              <span>Generation takes 3&ndash;5 minutes. Hang tight.</span>
            </div>
          </div>
        ) : (
          /* Generation in progress */
          <div className="w-full max-w-xl mx-auto mt-12 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-10">
              <p className="text-xs font-sans font-medium tracking-[0.2em] uppercase text-charcoal-muted mb-3">
                Generating your documentary
              </p>
              <h1 className="font-serif text-2xl md:text-3xl text-charcoal mb-2 leading-snug">
                &ldquo;{inputValue}&rdquo;
              </h1>
              <div className="flex items-center justify-center gap-2 text-sm font-sans text-charcoal-muted mt-3">
                <Clock className="w-3.5 h-3.5" />
                <span>Estimated time: 3&ndash;5 minutes</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-xs font-sans text-charcoal-muted mb-2">
                <span>Progress</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-1.5 bg-border-light rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-red rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Stage list */}
            <GenerationProgress
              stages={STAGES}
              statuses={statuses}
              currentDetail={stageDetail}
            />

            {/* Teaser */}
            {teaser && (
              <div className="mt-10 p-5 bg-white border border-border-light rounded-xl animate-fade-in">
                <p className="text-xs font-sans font-medium tracking-widest uppercase text-charcoal-muted mb-2">
                  Preview
                </p>
                <p className="font-sans text-sm text-charcoal leading-relaxed">{teaser}</p>
              </div>
            )}

            {/* Email notification */}
            {!emailSaved ? (
              <form onSubmit={saveEmail} className="mt-8">
                <p className="text-xs font-sans text-charcoal-muted mb-3 text-center">
                  Leaving? Get notified by email when it&apos;s ready.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-9 pr-4 py-3 text-sm font-sans bg-white border border-border-light rounded-lg focus:outline-none focus:border-accent-red transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!email}
                    className="px-4 py-3 text-sm font-sans font-medium bg-charcoal text-parchment rounded-lg hover:bg-charcoal-soft transition-colors disabled:opacity-40"
                  >
                    Notify me
                  </button>
                </div>
              </form>
            ) : (
              <p className="mt-8 text-sm font-sans text-center text-charcoal-muted animate-fade-in">
                ✓ We&apos;ll email you at {email} when it&apos;s ready.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense>
      <GenerateContent />
    </Suspense>
  );
}
