export interface Scene {
  id: number;
  title: string;
  narration: string;
  image_prompt: string;
  mood: string;
  duration_seconds: number;
}

export interface Narrative {
  title: string;
  what_if: string;
  historical_reality: string;
  teaser?: string;
  scenes: Scene[];
}

export interface VideoRecord {
  id: string;
  prompt: string;
  title: string;
  narrative_json: Narrative;
  video_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  created_at: string;
  is_public: boolean;
  status: "pending" | "narrative" | "images" | "audio" | "assembling" | "complete" | "error";
  error_message?: string | null;
}

export interface JobStatus {
  id: string;
  status: VideoRecord["status"];
  stage_detail?: string | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  error_message?: string | null;
}
