"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/registrations", label: "Registrations", icon: Users },
  { href: "/theme-manager", label: "Theme Manager", icon: Lightbulb },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-full flex-col border-r border-[#15386b] bg-[#194685] text-white flex-shrink-0 md:w-64 md:min-h-screen">
      <div className="px-5 pb-6 pt-8">
        <Link href="/" className="block cursor-pointer text-3xl font-bold tracking-tight text-white">
          Hack Desk
        </Link>
      </div>

      <nav className="flex flex-1 px-3 pb-4 md:pb-8">
        <div className="flex w-full flex-row gap-2 overflow-x-auto md:flex-col md:gap-0.5 md:overflow-visible">
          {nav.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-md py-2.5 pl-3 pr-3 text-[15px] font-medium leading-none transition-colors",
                  isActive
                    ? "bg-black/20 text-white"
                    : "text-blue-100/90 hover:bg-white/10 hover:text-white"
                )}
              >
                {isActive ? (
                  <span
                    className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r bg-amber-300"
                    aria-hidden
                  />
                ) : null}
                <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" />
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
