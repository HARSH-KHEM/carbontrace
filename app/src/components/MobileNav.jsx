"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Dash" },
  { href: "/calculator", icon: "calculate", label: "Calc" },
  { href: "/insights", icon: "insights", label: "Tips" },
  { href: "/leaderboard", icon: "leaderboard", label: "Rank" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-highest/90 backdrop-blur-xl border-t border-white/5 flex justify-around items-center py-sm px-md">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 ${
              isActive ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                isActive
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {item.icon}
            </span>
            <span className="text-[10px] uppercase font-bold font-label-sm">
              {item.label}
            </span>
          </Link>
        );
      })}
      
      <button
        onClick={handleLogout}
        className="flex flex-col items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
      >
        <span className="material-symbols-outlined">logout</span>
        <span className="text-[10px] uppercase font-bold font-label-sm">
          Logout
        </span>
      </button>
    </nav>
  );
}
