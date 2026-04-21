import { Sidebar } from "@/components/Sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
