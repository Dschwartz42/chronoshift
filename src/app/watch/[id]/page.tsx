import { notFound } from "next/navigation";
import Link from "next/link";
import { Share2, ChevronRight, Play } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import { EXAMPLE_VIDEOS, formatDuration } from "@/lib/mock-data";
import ShareButton from "./ShareButton";

interface WatchPageProps {
  params: { id: string };
}

function getVideo(id: string) {
  return EXAMPLE_VIDEOS.find((v) => v.id === id) ?? null;
}

export default function WatchPage({ params }: WatchPageProps) {
  const video = getVideo(params.id);

  // For pre-generated videos or videos from DB
  const title = video?.prompt ?? "Alternate History Documentary";
  const docTitle = video?.title ?? title;
  const duration = video?.duration_seconds ? formatDuration(video.duration_seconds) : null;

  const relatedVideos = EXAMPLE_VIDEOS.filter((v) => v.id !== params.id).slice(0, 4);

  return (
    <div className="watch-page min-h-dvh">
      {/* Dark navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 border-b border-border-dark bg-surface-dark/80 backdrop-blur-sm">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-[#F5F0EA]">
          Chronoshift
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/explore" className="text-sm font-medium text-[#9A9088] hover:text-[#F5F0EA] transition-colors">
            Explore
          </Link>
          <Link
            href="/generate"
            className="px-4 py-2 text-sm font-medium rounded bg-accent-red text-white hover:bg-accent-red-light transition-colors"
          >
            Generate
          </Link>
        </div>
      </nav>

      <div className="pt-16">
        {/* Video player area */}
        <div className="bg-black">
          <div className="max-w-5xl mx-auto">
            <div className="aspect-video bg-[#0A0908] flex items-center justify-center relative group">
              {video?.video_url ? (
                <video
                  controls
                  poster={video.thumbnail_url ?? undefined}
                  className="w-full h-full"
                  preload="metadata"
                >
                  <source src={video.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                /* Placeholder for pre-launch */
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1A1714] to-[#0A0908]">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white/15 transition-colors cursor-pointer">
                    <Play className="w-8 h-8 text-white/70 ml-1" fill="currentColor" />
                  </div>
                  <p className="text-[#6A6460] font-sans text-sm">Video processing...</p>
                  <p className="text-[#4A4440] font-sans text-xs mt-1">Coming soon</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-6 py-10">
          {/* Title + meta */}
          <div className="mb-8">
            <p className="text-xs font-sans tracking-[0.2em] uppercase text-[#6A6460] mb-3">
              Alternate History Documentary {duration && <span>&middot; {duration}</span>}
            </p>
            <h1 className="font-serif text-2xl md:text-3xl text-[#F5F0EA] leading-snug mb-4">
              &ldquo;{title}&rdquo;
            </h1>
            <p className="font-serif text-lg md:text-xl text-[#C9A84C] italic">{docTitle}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mb-10 pb-10 border-b border-border-dark">
            <ShareButton />
            <Link
              href="/generate"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border-dark text-[#C8C0B8] hover:border-[#5A5450] hover:text-[#F5F0EA] transition-colors text-sm font-sans"
            >
              Generate your own <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Historical Reality */}
          <div className="mb-12">
            <h2 className="font-serif text-lg text-[#F5F0EA] mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-accent-red rounded-full" />
              Historical Reality
            </h2>
            <p className="font-sans text-[#9A9088] text-sm md:text-base leading-relaxed">
              {params.id === "civil-war-south" &&
                "The Union won the Civil War in April 1865 when Confederate General Robert E. Lee surrendered at Appomattox Court House. The war ended slavery, preserved the United States as one nation, and set the stage for Reconstruction — a turbulent period that would shape American society for more than a century."}
              {params.id === "british-colonies" &&
                "The American colonies declared independence from Britain in 1776 and, following the Revolutionary War, became the United States of America in 1783. Britain went on to build the largest empire in history, but the loss of the American colonies marked the beginning of a shift away from direct colonial rule."}
              {params.id === "thermopylae" &&
                "The Battle of Thermopylae in 480 BC saw a small force of Greek warriors, including 300 Spartans under King Leonidas, hold off the massive Persian army of Xerxes I for three days. Despite their heroic last stand, the Greeks were defeated. However, the battle bought time for the Greek city-states and became a legendary symbol of courage."}
              {params.id === "alexander-80" &&
                "Alexander the Great died in Babylon in 323 BC at just 32 years of age. The cause of his death remains disputed — possibly typhoid fever, poisoning, or complications from his many war wounds. His sudden death left no clear successor, triggering the Wars of the Diadochi that fragmented his vast empire."}
              {params.id === "library-alexandria" &&
                "The Library of Alexandria, founded in the 3rd century BC, was one of the largest and most significant libraries of the ancient world. It suffered multiple destructions over centuries — including fires during Julius Caesar's civil war, the edict of Theophilus in 391 AD, and the Arab conquest in 642 AD — resulting in the irretrievable loss of countless ancient texts."}
              {params.id === "cuban-missile" &&
                "The Cuban Missile Crisis of October 1962 brought the world to the brink of nuclear war before being resolved through careful diplomacy. Soviet Premier Khrushchev agreed to remove missiles from Cuba in exchange for a US pledge not to invade Cuba, and the secret removal of American Jupiter missiles from Turkey."}
              {params.id === "china-americas" &&
                "Chinese Admiral Zheng He led massive treasure fleets across Southeast Asia, India, Arabia, and East Africa between 1405 and 1433. After Zheng He's death, the Ming Dynasty turned inward, abandoning its maritime exploration program — leaving the 'discovery' of the Americas to European explorers, beginning with Columbus in 1492."}
              {params.id === "roman-empire" &&
                "The Western Roman Empire formally fell in 476 AD when the Germanic chieftain Odoacer deposed the last emperor, Romulus Augustulus. The Eastern Roman Empire (Byzantine) survived until 1453 AD. The fall of Rome is considered a watershed moment marking the end of Classical Antiquity and the beginning of the Middle Ages in Europe."}
              {!EXAMPLE_VIDEOS.some((v) => v.id === params.id) &&
                "This is a user-generated alternate history documentary. The historical reality section will appear here once the documentary is published."}
            </p>
          </div>
        </div>

        {/* Related videos */}
        {relatedVideos.length > 0 && (
          <div className="border-t border-border-dark pt-10 pb-16">
            <div className="px-6 md:px-12 mb-6 max-w-screen-xl mx-auto">
              <h2 className="font-serif text-xl text-[#F5F0EA]">More alternate timelines</h2>
            </div>
            <div
              className="scroll-snap-x flex gap-4 overflow-x-auto pb-4 px-6 md:px-12"
              style={{ scrollbarWidth: "none" }}
            >
              {relatedVideos.map((v) => (
                <div key={v.id} className="scroll-snap-item flex-shrink-0">
                  <div className="video-card rounded-lg overflow-hidden bg-surface-dark-2 border border-border-dark w-64 group cursor-pointer">
                    <Link href={`/watch/${v.id}`}>
                      <div className="aspect-video bg-surface-dark-3 relative overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center">
                          <svg viewBox="0 0 100 56" className="w-3/4 opacity-10" fill="none">
                            <path d="M0 28 Q25 10 50 28 Q75 46 100 28" stroke="#C9A84C" strokeWidth="1.5" />
                            <circle cx="50" cy="28" r="3" fill="#C9A84C" />
                          </svg>
                        </div>
                        <div className="watch-btn absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-4 h-4 text-charcoal ml-0.5" fill="currentColor" />
                          </div>
                        </div>
                        {v.duration_seconds && (
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded font-mono">
                            {formatDuration(v.duration_seconds)}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-serif text-sm text-[#D8D0C8] leading-snug line-clamp-2">{v.prompt}</p>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
