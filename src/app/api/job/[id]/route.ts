import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("videos")
    .select("id, status, stage_detail, video_url, thumbnail_url, error_message")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
