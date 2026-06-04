import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getServiceClient } from "@/lib/supabase";
import { Narrative } from "@/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a documentary writer specializing in alternate history.
When given a historical "what if" prompt, you generate structured JSON narratives.

Rules:
- Ground the alternate timeline in real historical cause-and-effect
- Reference real figures, places, and dates where possible
- Keep it plausible — no magic, no science fiction
- Structure it like a documentary: setup, turning point, consequences, long-term world impact
- End with a scene showing what the world looks like today in this alternate timeline
- Each scene narration should be 3-4 sentences, vivid and documentary-like
- Image prompts should be cinematic, historically accurate, and detailed

Return ONLY valid JSON, no other text.`;

const NARRATIVE_SCHEMA = `{
  "title": "string - documentary title",
  "what_if": "string - the original what-if question",
  "historical_reality": "string - 2-3 sentences on what actually happened",
  "teaser": "string - 2-3 sentence preview of what the documentary will cover",
  "category": "Ancient World|American History|Modern Era|Science & Discovery",
  "scenes": [
    {
      "id": 1,
      "title": "string - scene title",
      "narration": "string - 3-4 sentence narration script",
      "image_prompt": "string - detailed Stable Diffusion prompt, prepend: Cinematic, high detail, dramatic lighting, historically accurate, documentary style, painterly realism —",
      "mood": "triumphant|somber|tense|hopeful|dramatic|reflective",
      "duration_seconds": 18
    }
  ]
}`;

function isValidHistoricalPrompt(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  const historicalKeywords = [
    "what if", "if the", "if they", "if he", "if she", "if it",
    "had ", "never ", "didn't", "did not", "won", "lost", "survived",
    "discovered", "invaded", "failed", "succeeded", "died", "lived",
  ];
  return historicalKeywords.some((kw) => lower.includes(kw));
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 10) {
      return NextResponse.json({ error: "Please enter a more specific historical what-if." }, { status: 400 });
    }

    if (!isValidHistoricalPrompt(prompt)) {
      return NextResponse.json(
        { error: "That doesn't look like a historical what-if. Try something like 'What if the Roman Empire never fell?'" },
        { status: 400 }
      );
    }

    // Generate narrative with Claude
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a 7-scene alternate history documentary narrative for this prompt:\n\n"${prompt}"\n\nReturn JSON matching this schema:\n${NARRATIVE_SCHEMA}`,
        },
      ],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";

    let narrative: Narrative;
    try {
      // Strip markdown code fences if present
      const jsonText = rawText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
      narrative = JSON.parse(jsonText);
    } catch {
      return NextResponse.json({ error: "Failed to parse narrative. Please try again." }, { status: 500 });
    }

    // Save job to Supabase
    const supabase = getServiceClient();
    const { data: job, error: dbError } = await supabase
      .from("videos")
      .insert({
        prompt: prompt.trim(),
        title: narrative.title,
        narrative_json: narrative,
        status: "scenes",
        is_public: false,
      })
      .select("id")
      .single();

    if (dbError || !job) {
      console.error("DB insert error:", dbError);
      // Return a fake job ID for demo mode when DB not configured
      return NextResponse.json({
        jobId: "demo-" + Date.now(),
        teaser: narrative.teaser,
        narrative,
      });
    }

    // Trigger background worker (Inngest / Railway)
    if (process.env.WORKER_TRIGGER_URL) {
      await fetch(process.env.WORKER_TRIGGER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.WORKER_API_KEY ?? "" },
        body: JSON.stringify({ jobId: job.id }),
      }).catch(console.error);
    }

    return NextResponse.json({
      jobId: job.id,
      teaser: narrative.teaser,
    });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
