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
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#f3f4f6]">
      <Sidebar />
      <div className="flex-1 w-full overflow-y-auto p-4 md:p-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </div>
    </div>
  );
}
