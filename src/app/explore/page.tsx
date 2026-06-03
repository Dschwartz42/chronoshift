"use client";

import Navbar from "@/components/Navbar";
import VideoCard from "@/components/VideoCard";
import { EXAMPLE_VIDEOS, formatDuration } from "@/lib/mock-data";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

const CATEGORIES = ["All", "Ancient World", "American History", "Modern Era", "Science & Discovery"] as const;
type Category = (typeof CATEGORIES)[number];

const VIDEO_CATEGORIES: Record<string, Category> = {
  "0f625caa-bef3-403c-8726-b4f9495f9a55": "Modern Era",          // Germany WWII
  "7bd35572-c59c-4ce6-89f7-55345f28639d": "Science & Discovery", // Printing press
  "6111334f-99f6-45af-8675-c23a2effc6d9": "American History",    // Civil War South
  "d314aa56-8ee4-49f7-8768-9b3e0fb93b7a": "American History",    // British colonies
  "a0d3451d-5e25-4050-b5b5-215ade483132": "Ancient World",       // Thermopylae
  "1e5eff86-e117-48c0-9c57-0a4c4497169e": "Ancient World",       // Alexander the Great
  "32f13f4b-a226-4393-87d4-91ef7af458bf": "Ancient World",       // Library of Alexandria
  "b7c2943a-e7ee-419e-abb9-2a34f74085a3": "Modern Era",          // Cuban Missile Crisis
};

export default function ExplorePage() {
  const [active, setActive] = useState<Category>("All");

  const filtered = EXAMPLE_VIDEOS.filter((v) =>
    active === "All" || VIDEO_CATEGORIES[v.id!] === active
  );

  return (
    <div className="min-h-dvh bg-parchment">
      <Navbar />

      <div className="pt-24 pb-20 px-6 md:px-12">
        <div className="max-w-screen-xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p className="text-xs font-sans font-medium tracking-[0.2em] uppercase text-charcoal-muted mb-3">
              Public Gallery
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">
              Alternate Timelines
            </h1>
            <p className="font-sans text-charcoal-muted text-base max-w-lg leading-relaxed">
              Narrated documentaries exploring history that never was. Each one grounded in real cause-and-effect.
            </p>
          </div>

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
                id={video.id!}
                title={video.prompt!}
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
        </div>
      </div>
    </div>
  );
}
