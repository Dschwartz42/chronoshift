import Navbar from "@/components/Navbar";
import CyclingInput from "@/components/CyclingInput";
import VideoCard from "@/components/VideoCard";
import { EXAMPLE_VIDEOS, formatDuration } from "@/lib/mock-data";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-parchment">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-dvh flex flex-col items-center justify-center px-6 pt-16">
        {/* Animated background */}
        <div className="hero-bg">
          <svg
            className="hero-bg-inner"
            viewBox="0 0 1440 900"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <path d="M0 450 Q180 200 360 450 Q540 700 720 450 Q900 200 1080 450 Q1260 700 1440 450" stroke="#8B6914" strokeWidth="2" fill="none" />
            <path d="M0 300 Q240 600 480 300 Q720 0 960 300 Q1200 600 1440 300" stroke="#8B6914" strokeWidth="1.5" fill="none" />
            <path d="M0 600 Q200 400 400 600 Q600 800 800 600 Q1000 400 1200 600 Q1400 800 1440 580" stroke="#8B6914" strokeWidth="1" fill="none" />
            <circle cx="360" cy="450" r="6" fill="#8B6914" />
            <circle cx="720" cy="300" r="8" fill="#8B6914" />
            <circle cx="1080" cy="450" r="5" fill="#8B6914" />
            <circle cx="240" cy="200" r="4" fill="#8B6914" />
            <circle cx="960" cy="640" r="5" fill="#8B6914" />
            <path d="M340 430 L380 430 M360 410 L360 450" stroke="#8B6914" strokeWidth="1.5" />
            <path d="M700 280 L740 280 M720 260 L720 300" stroke="#8B6914" strokeWidth="1.5" />
            <line x1="0" y1="150" x2="1440" y2="150" stroke="#8B6914" strokeWidth="0.5" strokeDasharray="4 8" />
            <line x1="0" y1="450" x2="1440" y2="450" stroke="#8B6914" strokeWidth="0.5" strokeDasharray="4 8" />
            <line x1="0" y1="750" x2="1440" y2="750" stroke="#8B6914" strokeWidth="0.5" strokeDasharray="4 8" />
            <line x1="360" y1="0" x2="360" y2="900" stroke="#8B6914" strokeWidth="0.5" strokeDasharray="4 8" />
            <line x1="720" y1="0" x2="720" y2="900" stroke="#8B6914" strokeWidth="0.5" strokeDasharray="4 8" />
            <line x1="1080" y1="0" x2="1080" y2="900" stroke="#8B6914" strokeWidth="0.5" strokeDasharray="4 8" />
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto animate-slide-up">
          <p className="mb-6 text-xs font-sans font-medium tracking-[0.2em] uppercase text-charcoal-muted">
            Alternate History &mdash; AI Documentary
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-semibold text-charcoal leading-[1.05] tracking-tight mb-6">
            Change History.
          </h1>
          <p className="font-sans text-lg md:text-xl text-charcoal-muted font-light leading-relaxed mb-12 max-w-lg">
            Pick a moment. Change one thing. See what happens.
          </p>
          <div className="w-full">
            <CyclingInput />
          </div>
          <p className="mt-8 text-xs font-sans text-charcoal-muted">
            8 pre-generated timelines ready to watch &mdash; or create your own
          </p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <p className="text-xs font-sans text-charcoal-muted tracking-widest uppercase">Explore timelines</p>
          <div className="w-px h-8 bg-charcoal-muted animate-pulse-soft" />
        </div>
      </section>

      {/* Gallery section */}
      <section className="py-20 md:py-28">
        <div className="px-6 md:px-12 mb-10">
          <div className="flex items-baseline justify-between max-w-screen-xl mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl text-charcoal">
              Explore alternate timelines
            </h2>
            <Link
              href="/explore"
              className="flex items-center gap-1 text-sm font-sans text-accent-red hover:text-accent-red-light transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="mt-2 text-sm font-sans text-charcoal-muted max-w-screen-xl mx-auto">
            Narrated, illustrated documentaries of history that never was.
          </p>
        </div>
        <div
          className="scroll-snap-x flex gap-4 overflow-x-auto pb-6 px-6 md:px-12"
          style={{ scrollbarWidth: "thin" }}
          role="list"
          aria-label="Example alternate history videos"
        >
          {EXAMPLE_VIDEOS.map((video) => (
            <div key={video.id} className="scroll-snap-item flex-shrink-0" role="listitem">
              <VideoCard
                id={video.id!}
                title={video.prompt!}
                thumbnail={video.thumbnail_url ?? undefined}
                duration={video.duration_seconds ? formatDuration(video.duration_seconds) : undefined}
              />
            </div>
          ))}
          <div className="flex-shrink-0 w-6 md:w-12" />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 md:py-28 px-6 border-t border-border-light">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-4">
            What moment would you change?
          </h2>
          <p className="font-sans text-charcoal-muted mb-8 leading-relaxed">
            Every generated documentary is grounded in real history — plausible, cinematic, and narrated like a real film.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent-red text-white font-sans font-medium rounded-xl hover:bg-accent-red-light transition-colors shadow-sm"
          >
            Start Generating
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 md:px-12 border-t border-border-light">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between text-xs font-sans text-charcoal-muted">
          <span className="font-serif text-sm text-charcoal">Chronoshift</span>
          <span>Powered by Claude AI &middot; Replicate &middot; ElevenLabs</span>
        </div>
      </footer>
    </div>
  );
}
