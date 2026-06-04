"use client";

import VideoCard from "@/components/VideoCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { formatDuration } from "@/lib/mock-data";

export const CATEGORIES = ["All", "Ancient World", "American History", "Modern Era", "Science & Discovery"] as const;
export type Category = (typeof CATEGORIES)[number];

export type ExploreVideo = {
  id: string;
  prompt: string;
  title: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  category: Category | null;
};

export default function ExploreGrid({ videos }: { videos: ExploreVideo[] }) {
  const [active, setActive] = useState<Category>("All");

  const filtered = videos.filter(
    (v) => active === "All" || v.category === active
  );

  return (
    <>
      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-10 pb-10 border-b border-border-light overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-sans rounded-full border transition-colors ${
              active === cat
                ? "bg-charcoal text-parchment border-charcoal"
                : "border-border-light text-charcoal-muted hover:border-charcoal-muted hover:text-charcoal"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((video) => (
          <VideoCard
            key={video.id}
            id={video.id}
            title={video.prompt}
            thumbnail={video.thumbnail_url ?? undefined}
            duration={video.duration_seconds ? formatDuration(video.duration_seconds) : undefined}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-charcoal-muted font-sans text-sm text-center py-16">
          No timelines in this category yet.
        </p>
      )}

      {/* Generate CTA */}
      <div className="mt-16 pt-16 border-t border-border-light text-center">
        <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-3">
          Don&apos;t see your timeline?
        </h2>
        <p className="font-sans text-charcoal-muted mb-6 max-w-md mx-auto">
          Generate any alternate history — our AI will write, illustrate, and narrate it as a documentary.
        </p>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-charcoal text-parchment font-sans font-medium rounded-xl hover:bg-charcoal-soft transition-colors"
        >
          Generate a Timeline
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </>
  );
}
