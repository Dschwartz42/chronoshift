"use client";

import { CheckCircle, Circle, Loader2 } from "lucide-react";

export type StageStatus = "pending" | "active" | "complete" | "error";

export interface Stage {
  id: string;
  label: string;
  detail?: string;
}

interface GenerationProgressProps {
  stages: Stage[];
  statuses: Record<string, StageStatus>;
  currentDetail?: string;
}

const STAGES: Stage[] = [
  { id: "narrative", label: "Writing the alternate timeline" },
  { id: "scenes", label: "Breaking into scenes" },
  { id: "images", label: "Generating scene illustrations" },
  { id: "audio", label: "Generating narration audio" },
  { id: "video", label: "Assembling video" },
];

export { STAGES };

export default function GenerationProgress({ stages, statuses, currentDetail }: GenerationProgressProps) {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const status = statuses[stage.id] ?? "pending";
          const isActive = status === "active";
          const isComplete = status === "complete";
          const isPending = status === "pending";

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-4 transition-opacity duration-300 ${
                isPending ? "opacity-40" : "opacity-100"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isComplete ? (
                  <CheckCircle className="w-5 h-5 text-accent-red" />
                ) : isActive ? (
                  <Loader2 className="w-5 h-5 text-accent-gold animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-[#C4BDB4]" />
                )}
              </div>
              {/* Label */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium font-sans leading-5 ${
                    isComplete
                      ? "text-charcoal"
                      : isActive
                      ? "text-charcoal"
                      : "text-charcoal-muted"
                  }`}
                >
                  {stage.label}
                  {stage.detail && (
                    <span className="text-charcoal-muted font-normal"> — {stage.detail}</span>
                  )}
                </p>
                {isActive && currentDetail && (
                  <p className="mt-0.5 text-xs text-charcoal-muted font-sans animate-fade-in">
                    {currentDetail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
