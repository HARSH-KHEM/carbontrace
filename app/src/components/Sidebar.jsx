"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/calculator", icon: "calculate", label: "Calculator" },
  { href: "/insights", icon: "insights", label: "Insights" },
  { href: "/leaderboard", icon: "leaderboard", label: "Leaderboard" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex flex-col fixed left-0 h-full w-[280px] z-40 bg-surface-container-lowest/80 backdrop-blur-2xl border-r border-white/5 py-lg px-md shadow-2xl shadow-black/50">
      {/* Logo */}
      <div className="mb-xl px-sm">
        <Link href="/" className="font-headline-md text-headline-md font-black text-primary flex items-center gap-2">
          <span
            className="material-symbols-outlined text-[32px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
          CarbonTrace
        </Link>
        <p className="font-label-sm text-label-sm text-on-surface-variant/60 mt-1 uppercase tracking-widest">
          Eco-Conscious Tracking
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? "flex items-center gap-3 bg-white/10 border-l-4 border-primary shadow-[0_0_15px_rgba(74,222,128,0.3)] text-primary font-bold p-3 rounded-r-xl transition-all duration-200 translate-x-1"
                  : "flex items-center gap-3 text-on-surface-variant/70 hover:text-on-surface p-3 hover:bg-white/5 transition-all duration-200 rounded-lg group"
              }
            >
              <span
                className={`material-symbols-outlined ${!isActive ? "group-hover:text-primary" : ""}`}
                style={
                  isActive
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {item.icon}
              </span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* CTA Button */}
      <div className="mt-auto space-y-4">
        <Link href="/calculator">
          <button className="w-full bg-primary text-on-primary font-bold py-md px-lg rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all duration-300 lime-glow">
            <span className="material-symbols-outlined">add_circle</span>
            Track New Activity
          </button>
        </Link>

        <button 
          onClick={handleLogout}
          className="w-full bg-red-500/10 text-red-400 font-bold py-md px-lg rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(239,68,68,0)] hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
