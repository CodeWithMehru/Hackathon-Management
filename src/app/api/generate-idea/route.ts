import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

type ThemeIdeaRow = {
  id: string;
  theme_name: string;
  theme_meaning: string;
  idea_title: string;
  description: string;
  tech_stack: string;
  is_taken: boolean;
};

async function claimOneIdea() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from("Theme_Ideas")
    .select("*")
    .eq("is_taken", false)
    .limit(1);

  if (error) {
    console.error("Supabase select error:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const idea = data[0];

  const { error: updateError } = await supabase
    .from("Theme_Ideas")
    .update({ is_taken: true })
    .eq("id", idea.id);

  if (updateError) {
    console.error("Supabase update error:", updateError);
    throw updateError;
  }

  return { ...idea, is_taken: true } as ThemeIdeaRow;
}

export async function POST() {
  try {
    const idea = await claimOneIdea();
    if (!idea) {
      return NextResponse.json(
        { 
          error: "POOL_EMPTY", 
          message: "Ideas pool empty! Please ask the organizer to generate more." 
        }, 
        { status: 200 }
      );
    }
    return NextResponse.json({ idea });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}

