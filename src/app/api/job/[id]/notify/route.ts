import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { email } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = getServiceClient();
  await supabase
    .from("job_notifications")
    .insert({ job_id: params.id, email })
    .select();

  return NextResponse.json({ ok: true });
}
