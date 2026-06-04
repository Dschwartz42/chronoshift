import Navbar from "@/components/Navbar";
import { getServiceClient } from "@/lib/supabase";
import ExploreGrid, { ExploreVideo, Category } from "./ExploreGrid";

export const revalidate = 60;

// Fallback categories for existing videos that predate the category field in narrative_json
const LEGACY_CATEGORIES: Record<string, Category> = {
  "0f625caa-bef3-403c-8726-b4f9495f9a55": "Modern Era",          // Germany WWII
  "7bd35572-c59c-4ce6-89f7-55345f28639d": "Science & Discovery", // Printing press
  "6111334f-99f6-45af-8675-c23a2effc6d9": "American History",    // Civil War South
  "d314aa56-8ee4-49f7-8768-9b3e0fb93b7a": "American History",    // British colonies
  "a0d3451d-5e25-4050-b5b5-215ade483132": "Ancient World",       // Thermopylae
  "1e5eff86-e117-48c0-9c57-0a4c4497169e": "Ancient World",       // Alexander the Great
  "32f13f4b-a226-4393-87d4-91ef7af458bf": "Ancient World",       // Library of Alexandria
  "b7c2943a-e7ee-419e-abb9-2a34f74085a3": "Modern Era",          // Cuban Missile Crisis
  "3242f2a6-3a3e-4fea-8f18-50a00cc3e648": "Modern Era",          // Pearl Harbor
  "d7ec71ad-204b-438e-ad21-66dc0df28309": "Modern Era",          // British Ireland
};

async function getVideos(): Promise<ExploreVideo[]> {
  const sb = getServiceClient();
  const { data } = await sb
    .from("videos")
    .select("id, prompt, title, thumbnail_url, duration_seconds, narrative_json")
    .eq("status", "complete")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return data.map((v) => ({
    id: v.id,
    prompt: v.prompt,
    title: v.title,
    thumbnail_url: v.thumbnail_url,
    duration_seconds: v.duration_seconds,
    category:
      (v.narrative_json?.category as Category) ??
      LEGACY_CATEGORIES[v.id] ??
      null,
  }));
}

export default async function ExplorePage() {
  const videos = await getVideos();

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
          <ExploreGrid videos={videos} />
        </div>
      </div>
    </div>
  );
}
