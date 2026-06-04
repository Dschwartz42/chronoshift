"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import GenerationProgress, { STAGES, StageStatus } from "@/components/GenerationProgress";
import { AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Fake substep sequences per stage
const FAKE_DETAILS: Record<string, string[]> = {
  narrative: [
    "Analyzing historical context...",
    "Researching the alternate timeline...",
    "Writing the divergent history...",
  ],
  scenes: [
    "Structuring 7 scenes...",
    "Outlining narrative arc...",
    "Finalizing scene breakdown...",
  ],
  images: [
    "Generating illustration 1 of 7...",
    "Generating illustration 2 of 7...",
    "Generating illustration 3 of 7...",
    "Generating illustration 4 of 7...",
    "Generating illustration 5 of 7...",
    "Generating illustration 6 of 7...",
    "Generating illustration 7 of 7...",
  ],
  audio: [
    "Generating narration 1 of 7...",
    "Generating narration 2 of 7...",
    "Generating narration 3 of 7...",
    "Generating narration 4 of 7...",
    "Generating narration 5 of 7...",
    "Generating narration 6 of 7...",
    "Generating narration 7 of 7...",
  ],
  video: [
    "Rendering scene 1 of 7...",
    "Rendering scene 2 of 7...",
    "Rendering scene 3 of 7...",
    "Rendering scene 4 of 7...",
    "Rendering scene 5 of 7...",
    "Rendering scene 6 of 7...",
    "Rendering scene 7 of 7...",
    "Stitching final video...",
    "Finalizing your documentary...",
  ],
};

// ms between fake substep cycles within each stage
const DETAIL_INTERVALS: Record<string, number> = {
  narrative: 3000,
  scenes: 4000,
  images: 15000,
  audio: 8000,
  video: 25000,
};

// ms before advancing to next stage (after stage becomes active)
const STAGE_DURATIONS: Record<string, number> = {
  narrative: 8000,
  scenes: 12000,
  images: 110000,
  audio: 60000,
  // video holds until real completion
};

function buildStatuses(activeStage: string, isComplete: boolean): Record<string, StageStatus> {
  const order = ["narrative", "scenes", "images", "audio", "video"];
  const result: Record<string, StageStatus> = {};
  for (const s of order) {
    const idx = order.indexOf(s);
    const activeIdx = order.indexOf(activeStage);
    if (isComplete) {
      result[s] = "complete";
    } else if (idx < activeIdx) {
      result[s] = "complete";
    } else if (idx === activeIdx) {
      result[s] = "active";
    } else {
      result[s] = "pending";
    }
  }
  return result;
}

function GenerateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";

  const [inputValue, setInputValue] = useState(query);
  const [submitted, setSubmitted] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [teaser, setTeaser] = useState<string | null>(null);
  const [fakeStage, setFakeStage] = useState("narrative");
  const [fakeDetail, setFakeDetail] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const timerRefs = useRef<NodeJS.Timeout[]>([]);
  const realDoneRef = useRef(false);
  const atVideoStageRef = useRef(false);

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timerRefs.current.push(t);
    return t;
  };

  const clearAllTimers = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  };

  // Auto-submit if query param present
  useEffect(() => {
    if (query && !submitted) {
      handleSubmit(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Start fake progress timer chain once jobId is set
  useEffect(() => {
    if (!jobId) return;

    const stageOrder = ["narrative", "scenes", "images", "audio", "video"];
    let elapsed = 0;

    // Cycle fake detail text within a stage
    const cycleDetails = (stage: string) => {
      const details = FAKE_DETAILS[stage];
      const interval = DETAIL_INTERVALS[stage];
      let i = 0;
      setFakeDetail(details[0]);
      const tick = () => {
        i = (i + 1) % details.length;
        setFakeDetail(details[i]);
        const t = setTimeout(tick, interval);
        timerRefs.current.push(t);
      };
      const t = setTimeout(tick, interval);
      timerRefs.current.push(t);
    };

    // Start narrative cycling immediately
    cycleDetails("narrative");

    // Schedule stage transitions
    for (let i = 0; i < stageOrder.length - 1; i++) {
      const nextStage = stageOrder[i + 1];
      elapsed += STAGE_DURATIONS[stageOrder[i]];
      const capturedElapsed = elapsed;
      addTimer(() => {
        clearAllTimers();
        setFakeStage(nextStage);
        setFakeDetail(FAKE_DETAILS[nextStage][0]);
        if (nextStage === "video") {
          atVideoStageRef.current = true;
          // If real job already done, redirect immediately
          if (realDoneRef.current) {
            clearAllTimers();
            setFakeDetail("Finalizing your documentary...");
            setTimeout(() => {
              setIsComplete(true);
              setTimeout(() => router.push(`/watch/${jobId}`), 800);
            }, 1200);
          } else {
            cycleDetails("video");
          }
        } else {
          cycleDetails(nextStage);
        }
      }, capturedElapsed);
    }

    return () => clearAllTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  // Real DB polling — only used for completion/error detection
  useEffect(() => {
    if (!jobId) return;

    const handleRealStatus = (status: string, videoUrl?: string) => {
      if (status === "complete" && videoUrl) {
        realDoneRef.current = true;
        if (atVideoStageRef.current) {
          clearAllTimers();
          setFakeDetail("Finalizing your documentary...");
          setTimeout(() => {
            setIsComplete(true);
            if (pollRef.current) clearInterval(pollRef.current);
            setTimeout(() => router.push(`/watch/${jobId}`), 800);
          }, 1200);
        }
      }
      if (status === "error") {
        clearAllTimers();
        if (pollRef.current) clearInterval(pollRef.current);
        setError("Generation failed. Please try again.");
      }
    };

    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "videos", filter: `id=eq.${jobId}` },
        (payload) => {
          const row = payload.new as { status: string; video_url?: string };
          handleRealStatus(row.status, row.video_url);
        }
      )
      .subscribe();

    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/job/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        handleRealStatus(data.status, data.video_url);
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  async function handleSubmit(prompt: string) {
    if (!prompt.trim()) return;
    setSubmitted(true);
    setError(null);
    setFakeStage("narrative");
    setFakeDetail("Analyzing historical context...");

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
    } catch {
      setError("Could not connect to the server. Please try again.");
      setSubmitted(false);
    }
  }

  const statuses = buildStatuses(fakeStage, isComplete);
  const completedCount = Object.values(statuses).filter((s) => s === "complete").length;
  const progressPct = isComplete ? 100 : Math.round((completedCount / STAGES.length) * 100);

  return (
    <div className="min-h-dvh bg-parchment">
      <Navbar />

      <div className="pt-24 pb-20 px-6 flex flex-col items-center min-h-dvh">
        {!submitted ? (
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

            <div className="mt-8 flex items-center justify-center gap-2 text-sm font-sans text-charcoal-muted">
              <Clock className="w-4 h-4" />
              <span>Generation takes 8&ndash;10 minutes. Hang tight.</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xl mx-auto mt-12 animate-fade-in">
            <div className="text-center mb-10">
              <p className="text-xs font-sans font-medium tracking-[0.2em] uppercase text-charcoal-muted mb-3">
                Generating your documentary
              </p>
              <h1 className="font-serif text-2xl md:text-3xl text-charcoal mb-2 leading-snug">
                &ldquo;{inputValue}&rdquo;
              </h1>
              <div className="flex items-center justify-center gap-2 text-sm font-sans text-charcoal-muted mt-3">
                <Clock className="w-3.5 h-3.5" />
                <span>Estimated time: 8&ndash;10 minutes</span>
              </div>
            </div>

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

            <GenerationProgress
              stages={STAGES}
              statuses={statuses}
              currentDetail={fakeDetail}
            />

            {teaser && (
              <div className="mt-10 p-5 bg-white border border-border-light rounded-xl animate-fade-in">
                <p className="text-xs font-sans font-medium tracking-widest uppercase text-charcoal-muted mb-2">
                  Preview
                </p>
                <p className="font-sans text-sm text-charcoal leading-relaxed">{teaser}</p>
              </div>
            )}

            {error && (
              <div className="mt-8 flex items-start gap-2 text-sm text-accent-red font-sans">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
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
