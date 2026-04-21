import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type IdeaItem = {
  theme_meaning: string;
  idea_title: string;
  description: string;
  tech_stack: string;
};

function extractJsonArray(text: string): IdeaItem[] {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model did not return a JSON array.");
  }

  const parsed = JSON.parse(cleaned.slice(start, end + 1));
  if (!Array.isArray(parsed)) throw new Error("Invalid JSON array format.");
  return parsed;
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as
      | { theme: string }
      | null;
    const theme = body?.theme?.trim();
    if (!theme) {
      return NextResponse.json({ error: "Theme is required." }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GROQ_API_KEY in environment." },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const systemPrompt =
      `You are a hackathon mentor. The theme is [${theme}]. ` +
      `Generate a JSON array of 20 completely unique, beginner-friendly project ideas using modern web tech. ` +
      `Schema: { "theme_meaning": "2 lines explaining the theme for social good/etc", "idea_title": "Project Name", ` +
      `"description": "1 line explaining exactly how it works", "tech_stack": "Next.js, Tailwind, etc." }.\n` +
      `CRITICAL: YOU MUST RETURN EXACTLY 20 ITEMS. NO FEWER, NO MORE. ENSURE EVERY FIELD IS FILLED WITH TEXT.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Return ONLY a valid JSON array. No conversational text, no markdown formatting." },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Groq returned an empty response.");
    }

    let ideas = extractJsonArray(content)
      .map((item) => ({
        theme_name: theme,
        theme_meaning: String(item.theme_meaning ?? "").trim(),
        idea_title: String(item.idea_title ?? "").trim(),
        description: String(item.description ?? "").trim(),
        tech_stack: String(item.tech_stack ?? "").trim(),
        is_taken: false,
      }))
      .filter(
        (i) =>
          i.theme_meaning.length > 0 &&
          i.idea_title.length > 0 &&
          i.description.length > 0 &&
          i.tech_stack.length > 0
      );

    if (ideas.length === 0) {
      return NextResponse.json(
        { error: "No valid ideas parsed from model response." },
        { status: 500 }
      );
    }

    let fallbackCount = 1;
    while (ideas.length < 20) {
      ideas.push({
        theme_name: theme,
        theme_meaning: "Exploring the fundamentals of " + theme + ".",
        idea_title: "Innovative " + theme + " Solution " + fallbackCount,
        description: "A beginner-friendly project designed to explore core " + theme + " concepts and practical real-world applications.",
        tech_stack: "HTML, CSS, JavaScript",
        is_taken: false,
      });
      fallbackCount++;
    }

    ideas = ideas.slice(0, 20);

    const { error } = await supabase.from("Theme_Ideas").insert(ideas);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ inserted: ideas.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}

