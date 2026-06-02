import Navbar from "@/components/Navbar";
import VideoCard from "@/components/VideoCard";
import { EXAMPLE_VIDEOS, formatDuration } from "@/lib/mock-data";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function ExplorePage() {
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
            {["All", "Ancient World", "American History", "Modern Era", "Science & Discovery"].map((cat, i) => (
              <button
                key={cat}
                className={`flex-shrink-0 px-4 py-2 text-sm font-sans rounded-full border transition-colors ${
                  i === 0
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
            {EXAMPLE_VIDEOS.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id!}
                title={video.prompt!}
                thumbnail={video.thumbnail_url ?? undefined}
                duration={video.duration_seconds ? formatDuration(video.duration_seconds) : undefined}
              />
            ))}
          </div>

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
