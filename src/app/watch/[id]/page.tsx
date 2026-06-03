import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import { EXAMPLE_VIDEOS, formatDuration } from "@/lib/mock-data";
import { getServiceClient } from "@/lib/supabase";
import ShareButton from "./ShareButton";
import VideoPlayer from "./VideoPlayer";

interface WatchPageProps {
  params: { id: string };
}

async function getVideo(id: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // For real UUIDs, prefer Supabase so we get the full narrative_json
  if (isUuid) {
    try {
      const sb = getServiceClient();
      const { data } = await sb.from("videos").select("*").eq("id", id).single();
      if (data) return data;
    } catch {}
  }

  // Fall back to mock data (covers slugs and UUID entries not yet in Supabase)
  const mock = EXAMPLE_VIDEOS.find((v) => v.id === id);
  if (mock) return mock;

  return null;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const video = await getVideo(params.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = video as any;
  const title = v?.prompt ?? "Alternate History Documentary";
  const docTitle = v?.title ?? v?.narrative_json?.title ?? title;
  const duration = v?.duration_seconds ? formatDuration(v.duration_seconds) : null;
  const historicalReality = v?.narrative_json?.historical_reality ?? null;

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
                <VideoPlayer
                  src={video.video_url}
                  poster={video.thumbnail_url ?? undefined}
                />
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
          {(historicalReality || EXAMPLE_VIDEOS.some((v) => v.id === params.id)) && (
            <div className="mb-12">
              <h2 className="font-serif text-lg text-[#F5F0EA] mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-accent-red rounded-full" />
                Historical Reality
              </h2>
              <p className="font-sans text-[#9A9088] text-sm md:text-base leading-relaxed">
                {historicalReality ?? (
                  <>
                    {params.id === "civil-war-south" && "The Union won the Civil War in April 1865 when Confederate General Robert E. Lee surrendered at Appomattox Court House."}
                    {params.id === "british-colonies" && "The American colonies declared independence from Britain in 1776 and became the United States of America in 1783."}
                    {params.id === "thermopylae" && "The Battle of Thermopylae in 480 BC saw 300 Spartans hold off the Persian army for three days before being defeated."}
                    {params.id === "alexander-80" && "Alexander the Great died in Babylon in 323 BC at just 32 years of age, leaving no clear successor."}
                    {params.id === "library-alexandria" && "The Library of Alexandria suffered multiple destructions over centuries, resulting in the loss of countless ancient texts."}
                    {params.id === "cuban-missile" && "The Cuban Missile Crisis of 1962 was resolved through diplomacy when the Soviets agreed to remove missiles from Cuba."}
                    {params.id === "china-americas" && "After Zheng He's death, the Ming Dynasty abandoned maritime exploration, leaving the Americas to European explorers."}
                    {params.id === "roman-empire" && "The Western Roman Empire fell in 476 AD when Germanic chieftain Odoacer deposed the last emperor, Romulus Augustulus."}
                  </>
                )}
              </p>
            </div>
          )}
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
